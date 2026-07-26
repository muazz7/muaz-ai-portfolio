/**
 * The wire protocol shared by `/api/chat` and the client hook.
 *
 * The server streams newline-delimited JSON (one event per line). It is a
 * deliberately small surface: text deltas, tool lifecycle events, and a
 * terminator. Keeping this hand-rolled means no dependency on any AI SDK's
 * streaming format, which changes far more often than this file will.
 */

export const TOOL_NAMES = [
  'getPresentation',
  'getProjects',
  'getSkills',
  'getResume',
  'getContact',
  'getSports',
  'getCrazy',
  'getInternship',
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export function isToolName(value: unknown): value is ToolName {
  return typeof value === 'string' && (TOOL_NAMES as readonly string[]).includes(value);
}

/** Events the server can emit. */
export type StreamEvent =
  | { type: 'start'; model: string; grounded: string[] }
  | { type: 'text'; delta: string }
  | { type: 'tool'; id: string; name: ToolName }
  | { type: 'tool-result'; id: string; name: ToolName; result: unknown }
  | { type: 'error'; message: string; code?: string }
  | { type: 'done'; reason: 'stop' | 'length' | 'error' | 'aborted' };

/** A tool the assistant invoked during a turn. */
export interface ToolInvocation {
  id: string;
  name: ToolName;
  result?: unknown;
  state: 'running' | 'done';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tools: ToolInvocation[];
  createdAt: number;
  /** Set when the turn failed, so the UI can offer a retry. */
  failed?: boolean;
}

/** Body accepted by POST /api/chat. */
export interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
}

export function encodeEvent(event: StreamEvent): string {
  return `${JSON.stringify(event)}\n`;
}

/**
 * Splits a raw stream chunk into complete events, returning any trailing
 * partial line so the caller can prepend it to the next chunk.
 */
export function decodeEvents(buffer: string): { events: StreamEvent[]; rest: string } {
  const lines = buffer.split('\n');
  const rest = lines.pop() ?? '';
  const events: StreamEvent[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed) as StreamEvent);
    } catch {
      // A malformed line should never kill the stream - skip it.
    }
  }

  return { events, rest };
}
