import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { usersTable, settingsTable, subscriptionsTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import type { Env, AppVariables } from '../types';

export const meRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

meRoute.get('/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return jsonError(c, 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    const db = getDb(c.env);

    const user = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
        preferences: usersTable.preferences,
        isVerified: usersTable.isVerified,
        createdAt: usersTable.createdAt
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      return jsonError(c, 'User account not found', 'NOT_FOUND', 404);
    }

    const settings = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.userId, userId))
      .get();

    const subscription = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, userId))
      .get();

    return jsonOk(c, {
      user: {
        ...user,
        isVerified: Boolean(user.isVerified)
      },
      settings: settings || null,
      subscription: subscription || {
        planId: 'free',
        status: 'active'
      }
    });
  } catch (error: any) {
    console.error('Fetch /me error:', error);
    return jsonError(c, error?.message || 'Failed to fetch user profile', 'SERVER_ERROR', 500);
  }
});
