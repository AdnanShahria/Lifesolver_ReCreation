#!/usr/bin/env node
/**
 * LifeSolver Edge Telemetry & Diagnostics Probe
 * Verifies backend API readiness, database connectivity, and edge bindings.
 */
import http from 'node:http';

const API_TARGET = process.env.API_TARGET || 'http://localhost:8788/api/system/probe';

console.log(`🩺 Probing LifeSolver Services at ${API_TARGET}...`);

const req = http.get(API_TARGET, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const probe = JSON.parse(data);
      console.log('\n================ LifeSolver Edge Status ================');
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Probe Data :`, JSON.stringify(probe, null, 2));
      console.log('========================================================\n');
      if (res.statusCode === 200 && probe.ok) {
        console.log('✅ Edge services healthy!');
      } else {
        console.warn('⚠️ Edge returned degraded status.');
      }
    } catch {
      console.log(`Raw Response: ${data}`);
    }
  });
});

req.on('error', (err) => {
  console.log(`ℹ️ Probe target is offline or not yet started (${err.message}).`);
  console.log('💡 Run `pnpm dev` to launch the local Cloudflare Worker backend.');
});
