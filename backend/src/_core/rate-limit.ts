import type { Env } from '../types';

export async function checkAiRateLimit(userId: string, env: Env): Promise<boolean> {
  const bucket = new Date().toISOString().slice(0, 13); // hourly window
  const key = `ratelimit:ai:${userId}:${bucket}`;
  
  try {
    const raw = await env.KV.get(key);
    const count = parseInt(raw ?? '0', 10);
    if (count >= 120) {
      return false;
    }
    await env.KV.put(key, String(count + 1), { expirationTtl: 3600 });
    return true;
  } catch {
    return true; // fail open for rate limit if KV is transiently unavailable
  }
}
