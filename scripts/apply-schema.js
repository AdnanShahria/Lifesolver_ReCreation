#!/usr/bin/env node
/**
 * LifeSolver Schema Migration Runner
 * Syncs Drizzle ORM Schema definitions with Cloudflare D1
 */
import { execSync } from 'node:child_process';

console.log('🔄 Syncing Drizzle Schema with Cloudflare D1...');

try {
  execSync('pnpm --filter @lifesolver/database generate', { stdio: 'inherit' });
  console.log('✅ Generated migration artifacts.');
  execSync('pnpm --filter @lifesolver/database push', { stdio: 'inherit' });
  console.log('✅ Database schema in sync with D1.');
} catch (error) {
  console.error('❌ Schema application error:', error.message);
  process.exit(1);
}
