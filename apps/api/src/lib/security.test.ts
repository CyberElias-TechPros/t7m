import { describe, it, expect } from 'vitest';
import { sha256Hex, hashIp, timingSafeEqual, rateLimit, clientIp } from './security.js';

function fakeKv(store = new Map<string, string>()) {
  return {
    store,
    async get(k: string) {
      return store.get(k) ?? null;
    },
    async put(k: string, v: string) {
      store.set(k, v);
    },
  } as unknown as KVNamespace;
}

describe('hashing', () => {
  it('produces stable hex digests', async () => {
    const a = await sha256Hex('hello');
    const b = await sha256Hex('hello');
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
    expect(await sha256Hex('hello2')).not.toBe(a);
  });

  it('hashes the same IP+secret consistently and different salts differently', async () => {
    const h1 = await hashIp('1.2.3.4', 'salt');
    const h2 = await hashIp('1.2.3.4', 'salt');
    const h3 = await hashIp('1.2.3.4', 'other-salt');
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).not.toContain('1.2.3.4');
  });
});

describe('timingSafeEqual', () => {
  it('matches equal strings and rejects differing ones', async () => {
    expect(await timingSafeEqual('secret-token', 'secret-token')).toBe(true);
    expect(await timingSafeEqual('secret-token', 'secret-tokenn')).toBe(false);
    expect(await timingSafeEqual('secret-token', 'nope')).toBe(false);
    expect(await timingSafeEqual('', '')).toBe(true);
  });
});

describe('rateLimit', () => {
  it('allows up to the limit then blocks', async () => {
    const kv = fakeKv();
    const results = [];
    for (let i = 0; i < 5; i++) results.push((await rateLimit(kv, 'test', 3, 60)).allowed);
    expect(results).toEqual([true, true, true, false, false]);
  });

  it('uses separate buckets per key', async () => {
    const kv = fakeKv();
    await rateLimit(kv, 'a', 1, 60);
    expect((await rateLimit(kv, 'a', 1, 60)).allowed).toBe(false);
    expect((await rateLimit(kv, 'b', 1, 60)).allowed).toBe(true);
  });
});

describe('clientIp', () => {
  it('prefers CF-Connecting-IP then X-Forwarded-For', () => {
    expect(clientIp(new Headers({ 'CF-Connecting-IP': '9.9.9.9' }))).toBe('9.9.9.9');
    expect(clientIp(new Headers({ 'X-Forwarded-For': '8.8.8.8, 7.7.7.7' }))).toBe('8.8.8.8');
    expect(clientIp(new Headers())).toBe('unknown');
  });
});
