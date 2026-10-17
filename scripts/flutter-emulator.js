#!/usr/bin/env node
/**
 * LifeSolver Flutter Mobile Runner
 * Launches the Android AVD or web device and triggers `flutter run`
 */
import { execSync, spawn } from 'node:child_process';
import process from 'node:process';

console.log('📱 Launching LifeSolver Flutter Client...\n');

try {
  // Check available emulators/devices
  console.log('🔍 Detecting connected devices & emulators...');
  execSync('flutter devices', { stdio: 'inherit' });

  console.log('\n🚀 Starting Flutter app in debug mode with hot reload...');
  const flutter = spawn('flutter', ['run', '-d', 'chrome'], {
    cwd: './flutter',
    stdio: 'inherit',
    shell: true
  });

  flutter.on('exit', (code) => {
    console.log(`Flutter exited with code ${code}`);
  });
} catch (err) {
  console.error('❌ Failed to run Flutter client:', err.message);
  process.exit(1);
}
