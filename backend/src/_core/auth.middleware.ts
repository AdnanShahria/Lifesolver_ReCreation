import type { Context, Next } from 'hono';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { jsonError } from './response';
import type { Env, AppVariables } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: AppVariables }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonError(c, 'Missing or malformed Authorization header', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.substring(7);
  try {
    const isValid = await jwt.verify(token, c.env.JWT_SECRET);
    if (!isValid) {
      return jsonError(c, 'Invalid or expired token', 'UNAUTHORIZED', 401);
    }

    const { payload } = jwt.decode<{ sub: string; email: string }>(token);
    if (!payload?.sub) {
      return jsonError(c, 'Invalid token payload', 'UNAUTHORIZED', 401);
    }

    c.set('userId', payload.sub);
    c.set('userEmail', payload.email);

    await next();
  } catch (error) {
    return jsonError(c, 'Authentication failure', 'UNAUTHORIZED', 401);
  }
}
