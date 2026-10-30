import type { Context } from 'hono';

export function jsonOk<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ ok: true, data }, status);
}

export function jsonCursor<T>(c: Context, data: T[], nextCursor: string | null) {
  return c.json({ ok: true, data, nextCursor });
}

export function jsonError(c: Context, message: string, code = 'BAD_REQUEST', status: 400 | 401 | 402 | 403 | 404 | 409 | 500 = 400) {
  return c.json({ ok: false, error: code, message }, status);
}
