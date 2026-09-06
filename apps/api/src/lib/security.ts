/**
 * Security helpers: constant-time secret comparisons, IP hashing, and a
 * Cloudflare KV-backed fixed-window rate limiter.
 */

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const enc = new TextEncoder();
    const [ha, hb] = await Promise.all([
      crypto.subtle.digest('SHA-256', enc.encode(a)),
      crypto.subtle.digest('SHA-256', enc.encode(b)),
    ]);
    const ba = new Uint8Array(ha);
    const bb = new Uint8Array(hb);
    if (ba.length !== bb.length) return false;
    let diff = 0;
    for (let i = 0; i < ba.length; i++) diff |= (ba[i] ?? 0) ^ (bb[i] ?? 0);
    return diff === 0;
  }
  return a === b;
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Hash an IP with a secret salt so raw addresses are never stored. */
export async function hashIp(ip: string, secret: string): Promise<string> {
  return sha256Hex(`${secret}:${ip}`);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

/**
 * Fixed-window rate limiter backed by Cloudflare KV.
 * Note: KV is eventually consistent, so limits are best-effort — sufficient
 * for abuse throttling on a public form endpoint, not for billing.
 */
export async function rateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
  const kvKey = `rl:${key}:${windowStart}`;
  const current = await kv.get(kvKey);
  const count = current ? Number.parseInt(current, 10) || 0 : 0;

  if (count >= limit) {
    const retryAfter = windowStart + windowSeconds - Math.floor(Date.now() / 1000);
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter) };
  }

  // write+read: tolerate the small over-admission window rather than failing open
  await kv.put(kvKey, String(count + 1), { expirationTtl: windowSeconds + 5 });
  return { allowed: true, remaining: limit - (count + 1), retryAfter: 0 };
}

/** Extract the client IP from Cloudflare headers. */
export function clientIp(headers: Headers): string {
  return headers.get('CF-Connecting-IP') || headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}
