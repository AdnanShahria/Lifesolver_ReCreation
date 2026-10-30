import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { usersTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { hashPassword, verifyPassword } from './crypto';
import type { Env, AppVariables } from '../types';

export const profileRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').nullable().optional(),
  preferences: z.string().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

profileRoute.put('/profile', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) return jsonError(c, 'Unauthorized', 'UNAUTHORIZED', 401);

    const body = await c.req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid profile updates', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const updates: Partial<typeof usersTable.$inferInsert> = {};

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.avatarUrl !== undefined) updates.avatarUrl = parsed.data.avatarUrl;
    if (parsed.data.preferences !== undefined) updates.preferences = parsed.data.preferences;

    if (Object.keys(updates).length > 0) {
      await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));
    }

    const updatedUser = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
        preferences: usersTable.preferences,
        isVerified: usersTable.isVerified
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    return jsonOk(c, {
      user: {
        ...updatedUser,
        isVerified: Boolean(updatedUser?.isVerified)
      },
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return jsonError(c, error?.message || 'Failed to update profile', 'PROFILE_ERROR', 500);
  }
});

profileRoute.post('/change-password', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) return jsonError(c, 'Unauthorized', 'UNAUTHORIZED', 401);

    const body = await c.req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid password payload', 'VALIDATION_ERROR', 400);
    }

    const { currentPassword, newPassword } = parsed.data;
    const db = getDb(c.env);

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user || !user.passwordHash || !user.passwordSalt) {
      return jsonError(c, 'User account not found', 'NOT_FOUND', 404);
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash, user.passwordSalt);
    if (!isMatch) {
      return jsonError(c, 'Current password does not match', 'INVALID_CREDENTIALS', 400);
    }

    const { hashHex, saltHex } = await hashPassword(newPassword);

    await db
      .update(usersTable)
      .set({
        passwordHash: hashHex,
        passwordSalt: saltHex
      })
      .where(eq(usersTable.id, userId));

    return jsonOk(c, { message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return jsonError(c, error?.message || 'Failed to change password', 'CHANGE_PASSWORD_ERROR', 500);
  }
});

profileRoute.delete('/account', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) return jsonError(c, 'Unauthorized', 'UNAUTHORIZED', 401);

    const db = getDb(c.env);

    // Delete user (foreign key cascades will clean up settings, subscriptions, and module records)
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    return jsonOk(c, { message: 'User account and associated data successfully deleted.' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return jsonError(c, error?.message || 'Failed to delete account', 'DELETE_ERROR', 500);
  }
});
