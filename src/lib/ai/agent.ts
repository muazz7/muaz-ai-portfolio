/**
 * The agent loop.
 *
 * Talks to any OpenAI-compatible Chat Completions endpoint, streams text back
 * token by token, and runs a bounded tool-calling loop so the model can mount UI
 * components mid-answer.
 *
 * Shape of a turn:
 *   1. stream a completion, forwarding every text delta immediately
 *   2. if the model asked for a tool -> execute it, append the result, go to 1
 *   3. stop after MAX_STEPS rounds no matter what
 */

import { runFallback } from './fallback';
import { buildContext } from './retrieval';
import { buildSystemPrompt } from './system-prompt';
import { TOOL_SCHEMAS, executeTool } from './tools';
import { isToolName, type StreamEvent, type ToolName } from './protocol';
import type { ResolvedProvider } from './provider';

const MAX_STEPS = 3;
const MAX_HISTORY = 12;
const REQUEST_TIMEOUT_MS = 45_000;

interface WireToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
  /**
   * Gemini 3.x returns a `thought_signature` alongside every function call and
   * rejects the follow-up request with a 400 unless it is echoed back verbatim.
   * Other providers neither send nor mind this field, so passing it straight
   * through keeps one code path for everyone.
   */
  extra_content?: unknown;
}

interface WireMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: WireToolCall[];
  tool_call_id?: string;
}

/** Accumulator for a tool call being assembled across stream deltas. */
interface PendingToolCall {
  id: string;
  name: string;
  args: string;
  /** Provider-specific passthrough (see `WireToolCall.extra_content`). */
  extra?: unknown;
}

/** Mutable sink filled in by `streamStep` while it yields events. */
interface StepResult {
  text: string;
  toolCalls: PendingToolCall[];
  finishReason: string | null;
}

export interface AgentInput {
  /** Ordered provider chain, best first. See `resolveProviders`. */
  providers: ResolvedProvider[];
  messages: { role: 'user' | 'assistant'; content: string }[];
  signal?: AbortSignal;
}

/** Thrown by an attempt that failed before anything reached the browser. */
class ModelUnavailable extends Error {
  constructor(public readonly detail: string) {
    super(detail);
    this.name = 'ModelUnavailable';
  }
}

/**
 * Walks every provider and model available, then the local engine.
 *
 * Free-tier quotas are metered per model *and* per provider, and can be as low
 * as a couple of dozen requests a day, so a single hard-coded model makes the
 * site fail in a way the visitor sees. An attempt that dies before emitting
 * anything is retried on the next model, then the next provider. If everything
 * is exhausted we answer from the knowledge base. The visitor always gets an
 * answer.
 */
export async function* runAgent(input: AgentInput): AsyncGenerator<StreamEvent> {
  const { providers, messages, signal } = input;

  const history = messages.slice(-MAX_HISTORY);
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  const { text: grounding, ids } = buildContext(lastUser?.content ?? '', 8);
  const systemPrompt = buildSystemPrompt(grounding);

  const failures: string[] = [];

  for (const provider of providers) {
    for (const model of provider.models) {
      let started = false;

      try {
        for await (const event of attemptModel({ provider, model, systemPrompt, history, signal })) {
          // Announce the model only once we know it is actually answering.
          if (!started) {
            started = true;
            yield { type: 'start', model: `${provider.label} · ${model}`, grounded: ids };
          }
          yield event;
        }
        return;
      } catch (error) {
        if (error instanceof ModelUnavailable && !started) {
          failures.push(`${provider.id}/${model}: ${error.detail}`);
          continue;
        }
        // Anything else already reached the browser, or is not retryable.
        if (!started) {
          yield { type: 'start', model: `${provider.label} · ${model}`, grounded: ids };
        }
        yield { type: 'error', message: toMessage(error) };
        yield { type: 'done', reason: 'error' };
        return;
      }
    }
  }

  // Everything refused. Answer from local data rather than failing visibly.
  console.warn(`[agent] no provider could answer, using local engine. ${failures.join(' | ')}`);
  yield* runFallback(messages, 'Local knowledge base (AI quota exhausted)');
}

async function* attemptModel(opts: {
  provider: ResolvedProvider;
  model: string;
  systemPrompt: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  signal?: AbortSignal;
}): AsyncGenerator<StreamEvent> {
  const { provider, model, systemPrompt, history, signal } = opts;

  const wire: WireMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  let toolsEnabled = true;
  let emittedAnyText = false;
  /** Once a component is on screen the answer is already useful. */
  let toolRan = false;
  /** True once the browser has seen anything from this attempt. */
  let emittedAnything = false;

  for (let step = 0; step < MAX_STEPS; step++) {
    const result: StepResult = { text: '', toolCalls: [], finishReason: null };
    let failure: unknown = null;

    try {
      for await (const event of streamStep({ provider, model, wire, tools: toolsEnabled, signal }, result)) {
        if (event.type === 'text') emittedAnyText = true;
        emittedAnything = true;
        yield event;
      }
    } catch (error) {
      failure = error;
    }

    if (failure) {
      // A provider that chokes on the tool schema gets one clean retry without
      // tools, but only if it failed before writing anything.
      if (toolsEnabled && result.text.length === 0 && isSchemaRejection(failure)) {
        toolsEnabled = false;
        step--;
        continue;
      }
      // A tool already rendered a real component, so this was only the narration
      // step. Close out cleanly instead of replacing a good answer with an error.
      if (toolRan) {
        if (!emittedAnyText) yield { type: 'text', delta: fallbackLine() };
        yield { type: 'done', reason: 'stop' };
        return;
      }
      // Nothing has reached the browser, so the caller can cleanly try the next
      // model in the chain.
      if (!emittedAnything && isModelUnavailable(failure)) {
        throw new ModelUnavailable(toDetail(failure));
      }
      yield { type: 'error', message: toMessage(failure) };
      yield { type: 'done', reason: 'error' };
      return;
    }

    if (result.toolCalls.length === 0) {
      if (!emittedAnyText) {
        yield { type: 'text', delta: fallbackLine() };
      }
      yield { type: 'done', reason: result.finishReason === 'length' ? 'length' : 'stop' };
      return;
    }

    // Only ever honour one tool per turn - matches the prompt contract and stops
    // the UI stacking three components onto one reply.
    const call = result.toolCalls[0];

    if (!isToolName(call.name)) {
      wire.push({ role: 'assistant', content: result.text || null, tool_calls: [toWire(call)] });
      wire.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify({ error: 'unknown tool' }) });
      continue;
    }

    const toolName: ToolName = call.name;
    yield { type: 'tool', id: call.id, name: toolName };

    let args: Record<string, unknown> = {};
    if (call.args.trim()) {
      try {
        const parsed: unknown = JSON.parse(call.args);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          args = parsed as Record<string, unknown>;
        }
      } catch {
        // Malformed arguments are not fatal - every tool works with no args.
      }
    }

    const toolResult = executeTool(toolName, args);
    toolRan = true;
    yield { type: 'tool-result', id: call.id, name: toolName, result: toolResult };

    wire.push({ role: 'assistant', content: result.text || null, tool_calls: [toWire(call)] });
    wire.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(toolResult) });

    // One tool per reply. Withdraw the tools so the next step must write prose.
    toolsEnabled = false;
  }

  if (!emittedAnyText) yield { type: 'text', delta: fallbackLine() };
  yield { type: 'done', reason: 'stop' };
}

// ---------------------------------------------------------------------------

async function* streamStep(
  opts: {
    provider: ResolvedProvider;
    model: string;
    wire: WireMessage[];
    tools: boolean;
    signal?: AbortSignal;
  },
  out: StepResult,
): AsyncGenerator<StreamEvent> {
  const { provider, model, wire, tools, signal } = opts;

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  const abort = signal ? anySignal([signal, timeout.signal]) : timeout.signal;

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
        ...provider.extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages: wire,
        stream: true,
        temperature: 0.65,
        max_tokens: 900,
        ...(tools ? { tools: TOOL_SCHEMAS, tool_choice: 'auto' } : {}),
      }),
      signal: abort,
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '');
      throw new ProviderError(response.status, detail.slice(0, 600));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const pending = new Map<number, PendingToolCall>();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line.
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        for (const line of frame.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;

          let parsed: SseChunk;
          try {
            parsed = JSON.parse(payload) as SseChunk;
          } catch {
            continue;
          }

          if (parsed.error) {
            throw new ProviderError(0, parsed.error.message ?? 'Provider returned an error');
          }

          const choice = parsed.choices?.[0];
          if (!choice) continue;

          if (choice.finish_reason) out.finishReason = choice.finish_reason;

          const content = choice.delta?.content;
          if (typeof content === 'string' && content.length > 0) {
            out.text += content;
            yield { type: 'text', delta: content };
          }

          const calls = choice.delta?.tool_calls;
          if (Array.isArray(calls)) {
            for (let i = 0; i < calls.length; i++) {
              const raw = calls[i];
              const index = typeof raw.index === 'number' ? raw.index : i;
              const existing = pending.get(index) ?? {
                id: raw.id ?? `call_${index}_${Date.now().toString(36)}`,
                name: '',
                args: '',
              };

              if (raw.id) existing.id = raw.id;
              if (raw.function?.name) existing.name += raw.function.name;
              if (raw.function?.arguments) existing.args += raw.function.arguments;
              // Arrives on whichever delta the provider chooses - keep the first
              // one we see rather than letting a later empty delta clear it.
              if (raw.extra_content !== undefined && existing.extra === undefined) {
                existing.extra = raw.extra_content;
              }

              pending.set(index, existing);
            }
          }
        }

        boundary = buffer.indexOf('\n\n');
      }
    }

    out.toolCalls = [...pending.values()].filter((c) => c.name.length > 0);
  } finally {
    clearTimeout(timer);
  }
}

interface SseChunk {
  error?: { message?: string };
  choices?: {
    finish_reason?: string | null;
    delta?: {
      content?: string | null;
      tool_calls?: {
        index?: number;
        id?: string;
        function?: { name?: string; arguments?: string };
        extra_content?: unknown;
      }[];
    };
  }[];
}

class ProviderError extends Error {
  constructor(
    public status: number,
    detail: string,
  ) {
    super(detail || `Provider request failed with status ${status}`);
    this.name = 'ProviderError';
  }
}

function toWire(call: PendingToolCall): WireToolCall {
  return {
    id: call.id,
    type: 'function',
    function: { name: call.name, arguments: call.args || '{}' },
    ...(call.extra !== undefined ? { extra_content: call.extra } : {}),
  };
}

function fallbackLine(): string {
  return "That's the short version - want me to go deeper on any part of it?";
}

/**
 * Is this failure about the model or account rather than our request?
 *
 * 401/403 - bad key, or an account with no credits (xAI does this)
 * 404      - model retired or not enabled on this key
 * 429      - out of quota (free tiers are metered per model and per provider)
 * 5xx      - upstream temporarily unhealthy
 *
 * All are worth trying the next model or provider. A 400 is our own request's
 * fault, so retrying it elsewhere would just fail again.
 */
function isModelUnavailable(error: unknown): boolean {
  if (!(error instanceof ProviderError)) return false;
  const { status } = error;
  return status === 401 || status === 403 || status === 404 || status === 429 || status >= 500;
}

/** Short reason string for the "why did we skip this" server log. */
function toDetail(error: unknown): string {
  if (error instanceof ProviderError) {
    if (error.status === 429) return 'out of quota (429)';
    if (error.status === 404) return 'not available (404)';
    if (error.status === 401 || error.status === 403) return `key rejected or no credits (${error.status})`;
    return `status ${error.status}`;
  }
  return error instanceof Error ? error.message : 'unknown error';
}

/** Detects "your tool schema upset me" style 400s so we can retry plainly. */
function isSchemaRejection(error: unknown): boolean {
  if (!(error instanceof ProviderError)) return false;
  if (error.status !== 400 && error.status !== 422) return false;
  const m = error.message.toLowerCase();
  return (
    m.includes('tool') ||
    m.includes('function') ||
    m.includes('schema') ||
    m.includes('parameters') ||
    m.includes('additionalproperties')
  );
}

function toMessage(error: unknown): string {
  if (error instanceof ProviderError) {
    if (error.status === 401 || error.status === 403) {
      return 'The AI provider rejected the API key. Check AI_API_KEY in .env.local.';
    }
    if (error.status === 404) {
      return `The model "${process.env.AI_MODEL ?? 'default'}" was not found on this provider. Check AI_MODEL.`;
    }
    if (error.status === 429) {
      return 'The AI provider is rate limiting us right now. Give it a moment and try again.';
    }
    return `AI provider error${error.status ? ` (${error.status})` : ''}. ${error.message}`.trim();
  }
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return 'That took too long and timed out. Try asking again.';
    }
    // Undici surfaces connection problems as a bare "fetch failed".
    const m = `${error.message} ${(error.cause as Error | undefined)?.message ?? ''}`.toLowerCase();
    if (m.includes('fetch failed') || m.includes('econnrefused') || m.includes('enotfound') || m.includes('network')) {
      return "I couldn't reach the AI provider. Check AI_BASE_URL / your connection and try again.";
    }
    return error.message;
  }
  return 'Something went wrong talking to the AI provider.';
}

/** Portable AbortSignal.any - not available on every runtime we might deploy to. */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }
  return controller.signal;
}
