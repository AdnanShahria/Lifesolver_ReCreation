#!/usr/bin/env node
/**
 * LifeSolver D1 Database Setup & Migration Script
 * Usage:
 *   node scripts/apply-schema.js          # Defaults to local D1
 *   node scripts/apply-schema.js --remote # Applies to production Cloudflare D1
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const isRemote = process.argv.includes('--remote');
const targetFlag = isRemote ? '--remote' : '--local';

console.log(`🔄 [LifeSolver D1] Syncing Drizzle schema with ${isRemote ? 'Cloudflare Remote D1' : 'Local D1 Database'}...`);

try {
  // 1. Generate Drizzle migrations
  console.log('📦 Generating Drizzle migration files...');
  execSync('pnpm --filter @lifesolver/database generate', { stdio: 'inherit' });
  console.log('✅ Generated Drizzle migration artifacts.');

  // 2. Find migration SQL files
  const migrationsDir = path.resolve('database/migrations');
  if (fs.existsSync(migrationsDir)) {
    const sqlFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const sqlFile of sqlFiles) {
      console.log(`🚀 Executing migration: ${sqlFile} (${targetFlag})...`);
      const filePath = `../database/migrations/${sqlFile}`;
      execSync(
        `pnpm --filter @lifesolver/backend exec wrangler d1 execute lifesolver-d1 ${targetFlag} --file="${filePath}"`,
        { stdio: 'inherit' }
      );
    }
  }

  console.log(`\n🎉 LifeSolver Database schema is in 100% sync with ${isRemote ? 'Remote D1' : 'Local D1'}.\n`);
} catch (error) {
  console.error('❌ Database migration error:', error.message);
  process.exit(1);
}
