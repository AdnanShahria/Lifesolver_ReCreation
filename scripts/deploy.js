#!/usr/bin/env node
/**
 * LifeSolver Monorepo Production Deploy Orchestration
 * Runs Cloudflare Workers & Pages deployment pipelines
 */
import { execSync } from 'node:child_process';

console.log('🚀 Deploying LifeSolver to Cloudflare Edge Network...\n');

try {
  console.log('📦 1/3 Applying Database Migrations (D1)...');
  execSync('pnpm --filter @lifesolver/database push', { stdio: 'inherit' });

  console.log('⚡ 2/3 Deploying Backend Worker API...');
  execSync('pnpm --filter @lifesolver/backend deploy', { stdio: 'inherit' });

  console.log('🌐 3/3 Deploying Frontend to Cloudflare Pages...');
  execSync('pnpm --filter @lifesolver/frontend build', { stdio: 'inherit' });
  execSync('npx wrangler pages deploy frontend/dist --project-name lifesolver', { stdio: 'inherit' });

  console.log('\n✨ LifeSolver successfully deployed across global Cloudflare edge!');
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}
