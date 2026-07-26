/**
 * A sliding-window rate limiter held in process memory.
 *
 * Caveat worth knowing: on serverless each instance keeps its own counter, so
 * the effective global limit is higher than the configured number. That is fine
 * for a portfolio - the goal is stopping one bored visitor from draining your
 * API quota, not airtight quota enforcement. If you ever need that, swap the Map
 * for Upstash Redis; the interface below would not change.
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_ENTRIES = 5_000;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

function limitPerHour(): number {
  const parsed = Number.parseInt(process.env.RATE_LIMIT_PER_HOUR ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

export function checkRateLimit(key: string): RateLimitResult {
  const limit = limitPerHour();
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    const oldest = recent[0];
    hits.set(key, recent);
    return {
      ok: false,
      limit,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
    };
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so a long-lived instance cannot grow without bound.
  if (hits.size > MAX_ENTRIES) {
    for (const [k, times] of hits) {
      const live = times.filter((t) => t > cutoff);
      if (live.length === 0) hits.delete(k);
      else hits.set(k, live);
      if (hits.size <= MAX_ENTRIES) break;
    }
  }

  return { ok: true, limit, remaining: limit - recent.length, resetInSeconds: 0 };
}

/** Best-effort client identity behind Vercel / any reverse proxy. */
export function clientKey(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown';
  return ip;
}
