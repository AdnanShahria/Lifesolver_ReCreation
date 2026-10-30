import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { otpsTable, usersTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { timingSafeEqual } from './crypto';
import type { Env, AppVariables } from '../types';

export const verifyOtpRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otpCode: z.string().trim().length(6, 'Verification code must be 6 digits'),
  purpose: z.enum(['verification', 'reset_password', 'detox']).default('verification')
});

verifyOtpRoute.post('/verify-otp', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid OTP payload', 'VALIDATION_ERROR', 400);
    }

    const { email, otpCode, purpose } = parsed.data;
    const db = getDb(c.env);

    // Fetch the latest OTP record for this email and purpose
    const otpRecord = await db
      .select()
      .from(otpsTable)
      .where(and(eq(otpsTable.email, email), eq(otpsTable.purpose, purpose)))
      .orderBy(desc(otpsTable.createdAt))
      .get();

    if (!otpRecord) {
      return jsonError(c, 'No active verification code found for this account', 'OTP_NOT_FOUND', 400);
    }

    // Check expiration
    const isExpired = new Date(otpRecord.expiresAt).getTime() < Date.now();
    if (isExpired) {
      await db.delete(otpsTable).where(eq(otpsTable.id, otpRecord.id));
      return jsonError(c, 'Verification code has expired. Please request a new one.', 'OTP_EXPIRED', 400);
    }

    // Check maximum attempts (5 max)
    if ((otpRecord.attempts ?? 0) >= 5) {
      await db.delete(otpsTable).where(eq(otpsTable.id, otpRecord.id));
      return jsonError(c, 'Too many incorrect attempts. Please request a new code.', 'MAX_ATTEMPTS_EXCEEDED', 400);
    }

    // Timing-safe match check
    const isMatch = timingSafeEqual(otpRecord.otpCode, otpCode);
    if (!isMatch) {
      // Increment attempts
      await db
        .update(otpsTable)
        .set({ attempts: (otpRecord.attempts ?? 0) + 1 })
        .where(eq(otpsTable.id, otpRecord.id));

      const remaining = 4 - (otpRecord.attempts ?? 0);
      return jsonError(
        c,
        `Incorrect verification code. ${remaining > 0 ? remaining + ' attempt(s) remaining.' : 'Code invalidated.'}`,
        'INVALID_OTP',
        400
      );
    }

    // On successful verification
    if (purpose === 'verification') {
      await db
        .update(usersTable)
        .set({ isVerified: 1 })
        .where(eq(usersTable.email, email));
    }

    // Delete used OTP
    await db.delete(otpsTable).where(eq(otpsTable.id, otpRecord.id));

    return jsonOk(c, {
      verified: true,
      purpose,
      message: purpose === 'verification' ? 'Email verified successfully.' : 'Code validated.'
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return jsonError(c, error?.message || 'Failed to verify code', 'VERIFICATION_ERROR', 500);
  }
});
