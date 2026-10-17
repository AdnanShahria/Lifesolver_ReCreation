import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@lifesolver/database';
import type { Env } from '../types';

export type DbProvider = 'd1' | 'turso';

export function getDb(env: Env, _role: 'primary' | 'replica' = 'primary') {
  // Cloudflare D1 with parameterized Drizzle ORM
  return drizzle(env.DB, { schema });
}
