import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { usersTable, otpsTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { generateNumericOtp } from './crypto';
import { sendEmail } from '../_routers/EmailRouter';
import type { Env, AppVariables } from '../types';

export const forgotPasswordRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase()
});

forgotPasswordRoute.post('/forgot-password', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid email address', 'VALIDATION_ERROR', 400);
    }

    const { email } = parsed.data;
    const db = getDb(c.env);

    // Look up user
    const user = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (user) {
      // Remove any existing password reset OTPs
      await db
        .delete(otpsTable)
        .where(and(eq(otpsTable.email, email), eq(otpsTable.purpose, 'reset_password')));

      // Generate fresh OTP
      const otpCode = generateNumericOtp();
      const otpId = `otp_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await db.insert(otpsTable).values({
        id: otpId,
        email,
        otpCode,
        purpose: 'reset_password',
        expiresAt,
        attempts: 0
      });

      // Send password reset email
      await sendEmail(
        {
          to: email,
          subject: 'Reset your LifeSolver Password',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #09090b; color: #f4f4f5; border-radius: 12px; border: 1px solid #27272a;">
              <div style="margin-bottom: 24px;">
                <span style="font-size: 20px; font-weight: 700; color: #a855f7; letter-spacing: -0.5px;">LifeSolver</span>
                <span style="font-size: 13px; color: #71717a; margin-left: 8px;">Password Recovery</span>
              </div>
              <h2 style="font-size: 22px; font-weight: 600; color: #ffffff; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #a1a1aa; line-height: 1.6; font-size: 15px;">Hello ${user.name}, we received a request to reset your password. Use the verification code below to proceed:</p>
              <div style="margin: 24px 0; text-align: center; background: #18181b; padding: 18px; border-radius: 8px; border: 1px solid #3f3f46;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #c084fc;">${otpCode}</span>
              </div>
              <p style="color: #71717a; font-size: 13px;">This code will expire in 10 minutes. If you did not make this request, you can safely disregard this email; your account remains secure.</p>
            </div>
          `
        },
        c.env
      );
    }

    // Always return success to protect against user enumeration
    return jsonOk(c, {
      message: 'If an account exists with this email, a reset code has been sent.'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return jsonError(c, error?.message || 'Failed to process password reset', 'RECOVERY_ERROR', 500);
  }
});
