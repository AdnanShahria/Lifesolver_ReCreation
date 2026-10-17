import type { Context, Next } from 'hono';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { getCookie } from 'hono/cookie';
import { jsonError } from './response';
import type { Env, AppVariables } from '../types';

export async function adminMiddleware(c: Context<{ Bindings: Env; Variables: AppVariables }>, next: Next) {
  const sessionCookie = getCookie(c, 'ls_adm_session');
  if (!sessionCookie) {
    return jsonError(c, 'Admin session required', 'FORBIDDEN', 403);
  }

  try {
    const isValid = await jwt.verify(sessionCookie, c.env.ADMIN_SESSION_SECRET);
    if (!isValid) {
      return jsonError(c, 'Admin session expired or invalid', 'FORBIDDEN', 403);
    }

    const { payload } = jwt.decode<{ role: string; adminId: string }>(sessionCookie);
    if (payload?.role !== 'admin') {
      return jsonError(c, 'Insufficient privileges', 'FORBIDDEN', 403);
    }

    c.set('adminId', payload.adminId);
    await next();
  } catch {
    return jsonError(c, 'Admin authentication failure', 'FORBIDDEN', 403);
  }
}
