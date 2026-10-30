import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { usersTable, otpsTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { hashPassword, timingSafeEqual } from './crypto';
import type { Env, AppVariables } from '../types';

export const resetPasswordRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const resetPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otpCode: z.string().trim().length(6, 'Verification code must be 6 digits'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

resetPasswordRoute.post('/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid input provided', 'VALIDATION_ERROR', 400);
    }

    const { email, otpCode, newPassword } = parsed.data;
    const db = getDb(c.env);

    // Fetch latest reset_password OTP for this email
    const otpRecord = await db
      .select()
      .from(otpsTable)
      .where(and(eq(otpsTable.email, email), eq(otpsTable.purpose, 'reset_password')))
      .orderBy(desc(otpsTable.createdAt))
      .get();

    if (!otpRecord) {
      return jsonError(c, 'No active password reset code found for this email', 'OTP_NOT_FOUND', 400);
    }

    // Expiry check
    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await db.delete(otpsTable).where(eq(otpsTable.id, otpRecord.id));
      return jsonError(c, 'Reset code has expired. Please request a new one.', 'OTP_EXPIRED', 400);
    }

    // Attempts check
    if ((otpRecord.attempts ?? 0) >= 5) {
      await db.delete(otpsTable).where(eq(otpsTable.id, otpRecord.id));
      return jsonError(c, 'Too many incorrect attempts. Please request a new reset code.', 'MAX_ATTEMPTS_EXCEEDED', 400);
    }

    // Timing-safe match
    if (!timingSafeEqual(otpRecord.otpCode, otpCode)) {
      await db
        .update(otpsTable)
        .set({ attempts: (otpRecord.attempts ?? 0) + 1 })
        .where(eq(otpsTable.id, otpRecord.id));

      const remaining = 4 - (otpRecord.attempts ?? 0);
      return jsonError(
        c,
        `Incorrect code. ${remaining > 0 ? remaining + ' attempt(s) remaining.' : 'Code invalidated.'}`,
        'INVALID_OTP',
        400
      );
    }

    // Hash the new password with a brand-new salt and PBKDF2 (100k iters)
    const { hashHex, saltHex } = await hashPassword(newPassword);

    // Update password in users table
    const result = await db
      .update(usersTable)
      .set({
        passwordHash: hashHex,
        passwordSalt: saltHex
      })
      .where(eq(usersTable.email, email));

    // Delete used OTP
    await db.delete(otpsTable).where(eq(otpsTable.id, otpRecord.id));

    return jsonOk(c, {
      message: 'Password has been reset successfully. You can now log in with your new credentials.'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return jsonError(c, error?.message || 'Failed to reset password', 'RESET_ERROR', 500);
  }
});
