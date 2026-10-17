#!/usr/bin/env node
/**
 * LifeSolver Monorepo Dev Runner
 * Concurrently orchestrates Frontend (5173), Backend (8788), and Extension builds.
 */
import { spawn } from 'node:child_process';
import process from 'node:process';

console.log('🌌 Starting LifeSolver v3.2 Ecosystem...\n');

const services = [
  { name: 'backend', cmd: 'pnpm', args: ['--filter', '@lifesolver/backend', 'dev'], color: '\x1b[35m' },
  { name: 'frontend', cmd: 'pnpm', args: ['--filter', '@lifesolver/frontend', 'dev'], color: '\x1b[36m' },
  { name: 'extension', cmd: 'pnpm', args: ['--filter', '@lifesolver/extension', 'dev'], color: '\x1b[33m' }
];

const processes = services.map(({ name, cmd, args, color }) => {
  const isWindows = process.platform === 'win32';
  const executable = isWindows ? `${cmd}.cmd` : cmd;

  const child = spawn(executable, args, {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  child.stdout?.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      console.log(`${color}[${name}]\x1b[0m ${line}`);
    });
  });

  child.stderr?.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      console.error(`${color}[${name}:err]\x1b[0m \x1b[31m${line}\x1b[0m`);
    });
  });

  child.on('exit', (code) => {
    console.log(`${color}[${name}]\x1b[0m Process exited with code ${code}`);
  });

  return child;
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down LifeSolver services...');
  processes.forEach((p) => p.kill());
  process.exit(0);
});
