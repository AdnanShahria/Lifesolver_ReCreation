import type { Context, Next } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { subscriptionsTable } from '@lifesolver/database';
import { jsonError } from './response';
import type { Env, AppVariables, UserPlan } from '../types';

export const DEFAULT_PLANS: Record<string, UserPlan> = {
  free: {
    plan: 'free',
    status: 'active',
    limits: { tasks: 50, habits: 5, notes: 30, vault_storage_mb: 25, ai_calls_per_day: 10 },
    features: { ai_chat: false, flashcards: true, vault: false, extension_sync: true }
  },
  pro: {
    plan: 'pro',
    status: 'active',
    limits: { tasks: 1000, habits: 50, notes: 1000, vault_storage_mb: 500, ai_calls_per_day: 100 },
    features: { ai_chat: true, flashcards: true, vault: true, extension_sync: true }
  },
  elite: {
    plan: 'elite',
    status: 'active',
    limits: { tasks: -1, habits: -1, notes: -1, vault_storage_mb: 5000, ai_calls_per_day: 500 },
    features: { ai_chat: true, flashcards: true, vault: true, extension_sync: true }
  }
};

export async function subscriptionMiddleware(
  c: Context<{ Bindings: Env; Variables: AppVariables }>,
  next: Next
) {
  const userId = c.get('userId');
  if (!userId) return await next();

  const cacheKey = `sub:${userId}`;
  let sub: UserPlan | null = null;

  try {
    sub = await c.env.KV.get<UserPlan>(cacheKey, 'json');
  } catch {
    // KV read fallback
  }

  if (!sub) {
    const db = getDb(c.env);
    const row = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId)).get();

    const planKey = (row?.adminOverridePlan || row?.planId || 'free') as 'free' | 'pro' | 'elite';
    sub = DEFAULT_PLANS[planKey] || DEFAULT_PLANS.free;

    try {
      await c.env.KV.put(cacheKey, JSON.stringify(sub), { expirationTtl: 60 });
    } catch {
      // KV write fallback
    }
  }

  c.set('userPlan', sub);
  await next();
}

export function assertFeature(c: Context<{ Variables: AppVariables }>, feature: keyof UserPlan['features']) {
  const userPlan = c.get('userPlan');
  if (!userPlan?.features[feature]) {
    return jsonError(c, `Feature '${feature}' requires a Pro or Elite subscription`, 'UPGRADE_REQUIRED', 402);
  }
  return null;
}
