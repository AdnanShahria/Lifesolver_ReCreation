import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { otpsTable, usersTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { generateNumericOtp } from './crypto';
import { sendEmail } from '../_routers/EmailRouter';
import type { Env, AppVariables } from '../types';

export const resendOtpRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const resendSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  purpose: z.enum(['verification', 'reset_password', 'detox']).default('verification')
});

resendOtpRoute.post('/resend-otp', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid request', 'VALIDATION_ERROR', 400);
    }

    const { email, purpose } = parsed.data;
    const db = getDb(c.env);

    // Verify user exists if purpose is verification or reset_password
    const user = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (!user && purpose !== 'detox') {
      // Don't leak user non-existence, return success message
      return jsonOk(c, { message: 'If an account exists, a new verification code has been dispatched.' });
    }

    // Delete existing OTPs for this email and purpose to keep table clean
    await db
      .delete(otpsTable)
      .where(and(eq(otpsTable.email, email), eq(otpsTable.purpose, purpose)));

    // Generate fresh OTP
    const otpCode = generateNumericOtp();
    const otpId = `otp_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.insert(otpsTable).values({
      id: otpId,
      email,
      otpCode,
      purpose,
      expiresAt,
      attempts: 0
    });

    // Send email
    const subject = purpose === 'reset_password'
      ? 'LifeSolver Password Reset Code'
      : purpose === 'detox'
      ? 'LifeSolver Focus Detox Emergency Unlock Code'
      : 'Verify your LifeSolver Account';

    await sendEmail(
      {
        to: email,
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #09090b; color: #f4f4f5; border-radius: 12px; border: 1px solid #27272a;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 20px; font-weight: 700; color: #a855f7; letter-spacing: -0.5px;">LifeSolver</span>
              <span style="font-size: 13px; color: #71717a; margin-left: 8px;">Security Service</span>
            </div>
            <h2 style="font-size: 22px; font-weight: 600; color: #ffffff; margin-top: 0;">${subject}</h2>
            <p style="color: #a1a1aa; line-height: 1.6; font-size: 15px;">Your new 6-digit authorization code is:</p>
            <div style="margin: 24px 0; text-align: center; background: #18181b; padding: 18px; border-radius: 8px; border: 1px solid #3f3f46;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #c084fc;">${otpCode}</span>
            </div>
            <p style="color: #71717a; font-size: 13px;">This code will expire in 10 minutes. If you did not initiate this request, you can safely ignore this email.</p>
          </div>
        `
      },
      c.env
    );

    return jsonOk(c, { message: 'A new verification code has been dispatched to your email.' });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return jsonError(c, error?.message || 'Failed to resend code', 'RESEND_ERROR', 500);
  }
});
