import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@lifesolver/database';
import type { Env } from '../types';

export function getDb(env: Env) {
  // Ensure foreign_keys are enabled on every connection
  const db = drizzle(env.DB, { schema });
  return db;
}
