import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { usersTable, settingsTable, subscriptionsTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { hashPassword, signUserToken } from './crypto';
import type { Env, AppVariables } from '../types';

export const registerRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

registerRoute.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid registration input', 'VALIDATION_ERROR', 400);
    }

    const { name, email, password } = parsed.data;
    const db = getDb(c.env);

    // Check if email already registered
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (existing) {
      return jsonError(c, 'An account with this email already exists', 'EMAIL_ALREADY_EXISTS', 409);
    }

    // Hash password with Web Crypto PBKDF2 (100k iterations + 16-byte random salt)
    const { hashHex, saltHex } = await hashPassword(password);
    const userId = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    // 1. Create User (Instant Verification Enabled)
    await db.insert(usersTable).values({
      id: userId,
      name,
      email,
      passwordHash: hashHex,
      passwordSalt: saltHex,
      preferences: '{}',
      avatarUrl: null,
      isVerified: 1
    });

    // 2. Initialize Default Settings
    const settingId = `set_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    await db.insert(settingsTable).values({
      id: settingId,
      userId,
      theme: 'dark',
      currency: 'BDT',
      language: 'en',
      notificationsEnabled: 1,
      monthlyBudget: 0,
      dockShortcuts: JSON.stringify(['planner', 'mind', 'finance', 'health'])
    });

    // 3. Initialize Free Subscription
    const subId = `sub_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    await db.insert(subscriptionsTable).values({
      id: subId,
      userId,
      planId: 'free',
      status: 'active'
    });

    // 4. Sign JWT Session
    const token = await signUserToken(
      { id: userId, email, name },
      c.env.JWT_SECRET
    );

    return jsonOk(
      c,
      {
        token,
        user: {
          id: userId,
          name,
          email,
          isVerified: true,
          avatarUrl: null
        },
        requiresVerification: false,
        message: 'Account created successfully.'
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return jsonError(c, error?.message || 'Failed to complete registration', 'REGISTRATION_ERROR', 500);
  }
});
