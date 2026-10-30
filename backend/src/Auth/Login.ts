import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { usersTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { verifyPassword, signUserToken } from './crypto';
import type { Env, AppVariables } from '../types';

export const loginRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

loginRoute.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid credentials provided', 'VALIDATION_ERROR', 400);
    }

    const { email, password } = parsed.data;
    const db = getDb(c.env);

    // Retrieve user by normalized email
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .get();

    if (!user || !user.passwordHash || !user.passwordSalt) {
      return jsonError(c, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Verify password via PBKDF2 constant-time check
    const isMatch = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isMatch) {
      return jsonError(c, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Issue JWT Token
    const token = await signUserToken(
      { id: user.id, email: user.email, name: user.name },
      c.env.JWT_SECRET
    );

    return jsonOk(c, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: Boolean(user.isVerified),
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return jsonError(c, error?.message || 'Authentication error occurred', 'AUTH_ERROR', 500);
  }
});
