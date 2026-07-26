import { z } from 'zod';

import { runAgent } from '@/lib/ai/agent';
import { runFallback } from '@/lib/ai/fallback';
import { encodeEvent, type StreamEvent } from '@/lib/ai/protocol';
import { resolveProviders } from '@/lib/ai/provider';
import { checkRateLimit, clientKey } from '@/lib/ai/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4_000),
      }),
    )
    .min(1)
    .max(40),
});

export async function POST(request: Request) {
  // --- Rate limit ----------------------------------------------------------
  const rate = checkRateLimit(clientKey(request));
  if (!rate.ok) {
    return errorStream(
      `You've hit the hourly message limit on this site. Try again in about ${Math.ceil(rate.resetInSeconds / 60)} minutes - or just email me at mdmuaz23@gmail.com.`,
      'rate_limited',
      429,
      { 'Retry-After': String(rate.resetInSeconds) },
    );
  }

  // --- Validate ------------------------------------------------------------
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return errorStream('That request did not look right. Reload the page and try again.', 'bad_request', 400);
  }

  // --- Pick an engine ------------------------------------------------------
  const providers = resolveProviders();
  const events: AsyncGenerator<StreamEvent> = providers.length
    ? runAgent({ providers, messages: parsed.messages, signal: request.signal })
    : runFallback(parsed.messages);

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of events) {
          controller.enqueue(encoder.encode(encodeEvent(event)));
        }
      } catch (error) {
        // Client disconnects surface here; do not treat them as failures.
        if (!isAbort(error)) {
          const message = error instanceof Error ? error.message : 'Unexpected server error.';
          controller.enqueue(encoder.encode(encodeEvent({ type: 'error', message })));
          controller.enqueue(encoder.encode(encodeEvent({ type: 'done', reason: 'error' })));
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed - nothing to do.
        }
      }
    },
    cancel() {
      void events.return?.(undefined);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-RateLimit-Limit': String(rate.limit),
      'X-RateLimit-Remaining': String(rate.remaining),
    },
  });
}

/** Errors travel over the same stream shape so the client has one code path. */
function errorStream(
  message: string,
  code: string,
  status: number,
  extraHeaders: Record<string, string> = {},
) {
  const body =
    encodeEvent({ type: 'error', message, code }) + encodeEvent({ type: 'done', reason: 'error' });

  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'));
}
