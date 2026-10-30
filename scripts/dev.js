#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LifeSolver Command Cockpit — Unified Monorepo Development Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Concurrently orchestrates:
 *   1. Frontend App          (@lifesolver/frontend   -> http://localhost:5173)
 *   2. Backend Edge API      (@lifesolver/backend    -> http://localhost:8788)
 *   3. Focus Telemetry Ext   (@lifesolver/extension  -> vite build --watch)
 *
 * Features:
 *   - Cyber-Noir ANSI TUI Dashboard with real-time status matrix
 *   - Auto-detection: Supports both `pnpm` and `npm` seamlessly
 *   - Active HTTP health probing (D1 Edge + Vite HMR)
 *   - Live rolling log stream with interactive service filtering
 *   - Instant keyboard hotkeys:
 *       [f] Frontend, [b] Backend, [d] Finance OS, [l] Filter, [c] Clear, [r] Restart, [q] Quit
 *   - Reliable process-tree termination for Windows (taskkill /T /F) and Unix
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import readline from 'node:readline';
import process from 'node:process';

// ── Detect Package Manager (pnpm preferred, npm fallback) ────────────────────
let pm = 'pnpm';
try {
  execSync(process.platform === 'win32' ? 'where pnpm' : 'which pnpm', { stdio: 'ignore' });
} catch {
  pm = 'npm';
}

const isWindows = process.platform === 'win32';
const pmExecutable = isWindows ? `${pm}.cmd` : pm;

// ── ANSI Styling Tokens (High-Contrast Cyber Palette) ────────────────────────
const ESC = '\x1b[';
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const DIM = `${ESC}2m`;

const FG_VIOLET = `${ESC}38;5;135m`;
const FG_CYAN = `${ESC}38;5;51m`;
const FG_EMERALD = `${ESC}38;5;48m`;
const FG_AMBER = `${ESC}38;5;214m`;
const FG_ROSE = `${ESC}38;5;197m`;
const FG_WHITE = `${ESC}38;5;231m`;
const FG_MUTED = `${ESC}38;5;244m`;
const FG_DARK = `${ESC}38;5;238m`;

// Box Drawing Characters
const BOX = {
  tl: '┌',
  tr: '┐',
  bl: '└',
  br: '┘',
  h: '─',
  v: '│',
  vl: '├',
  vr: '┤',
  tt: '┬',
  tb: '┴',
  cross: '┼'
};

// ── Service Definitions ──────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'backend',
    name: 'Backend API',
    tag: 'BACKEND',
    color: FG_VIOLET,
    target: 'http://localhost:8788',
    port: 8788,
    dir: 'backend',
    pkgName: '@lifesolver/backend',
    probePath: '/api/system/probe'
  },
  {
    id: 'frontend',
    name: 'Frontend App',
    tag: 'FRONTEND',
    color: FG_CYAN,
    target: 'http://localhost:5173',
    port: 5173,
    dir: 'frontend',
    pkgName: '@lifesolver/frontend',
    probePath: '/'
  },
  {
    id: 'extension',
    name: 'Chrome Ext',
    tag: 'EXTEN',
    color: FG_AMBER,
    target: 'extension/dist',
    port: null,
    dir: 'extension',
    pkgName: '@lifesolver/extension',
    probePath: null
  }
];

// ── State Management ─────────────────────────────────────────────────────────
const serviceStates = {
  backend: { status: 'STARTING', health: 'Spinning up...', pid: null },
  frontend: { status: 'STARTING', health: 'Spinning up...', pid: null },
  extension: { status: 'STARTING', health: 'Compiling...', pid: null }
};

const MAX_LOGS = 18;
const logs = [];
let activeLogFilter = 'all'; // 'all' | 'backend' | 'frontend' | 'extension'

const startTime = Date.now();
const childProcesses = new Map();
let isShuttingDown = false;

// ── Helper: Format Uptime ────────────────────────────────────────────────────
function getUptime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function getTimestamp() {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

// ── Safe Process Tree Termination ────────────────────────────────────────────
function killProcessTree(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-pid, 'SIGKILL');
    }
  } catch {
    // Process might already be dead
  }
}

// ── Browser Opener ───────────────────────────────────────────────────────────
function openBrowser(url) {
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
      spawn('open', [url], { detached: true, stdio: 'ignore' });
    } else {
      spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
    }
    pushLog('system', `Browser launched: ${url}`);
  } catch (err) {
    pushLog('system', `Could not open browser: ${err?.message}`, true);
  }
}

// ── Push Log ─────────────────────────────────────────────────────────────────
function pushLog(serviceId, text, isError = false) {
  const cleanText = String(text).replace(/\r/g, '').trim();
  if (!cleanText) return;

  const lines = cleanText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    logs.push({
      serviceId,
      text: trimmed,
      timestamp: getTimestamp(),
      isError
    });
  }

  // Keep max logs buffer
  if (logs.length > 200) {
    logs.splice(0, logs.length - 200);
  }

  if (process.stdout.isTTY) {
    renderDashboard();
  } else {
    console.log(`[${serviceId}] ${trimmed}`);
  }
}

// ── Spawn Individual Service ─────────────────────────────────────────────────
function startService(service) {
  serviceStates[service.id].status = 'STARTING';
  serviceStates[service.id].health = 'Launching...';

  const args = pm === 'pnpm' 
    ? ['--filter', service.pkgName, 'dev']
    : ['--prefix', service.dir, 'run', 'dev'];

  const child = spawn(pmExecutable, args, {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  childProcesses.set(service.id, child);
  serviceStates[service.id].pid = child.pid || null;

  child.stdout?.on('data', (chunk) => {
    const str = chunk.toString();
    
    // Detect readiness signals
    if (service.id === 'backend') {
      if (str.includes('Ready on') || str.includes('localhost:8788')) {
        serviceStates.backend.status = 'ONLINE';
        serviceStates.backend.health = 'Cloudflare D1 Ready';
      }
    } else if (service.id === 'frontend') {
      if (str.includes('ready in') || str.includes('Local:')) {
        serviceStates.frontend.status = 'ONLINE';
        serviceStates.frontend.health = 'Vite HMR Active';
      }
    } else if (service.id === 'extension') {
      if (str.includes('built in') || str.includes('watching for file changes')) {
        serviceStates.extension.status = 'WATCHING';
        serviceStates.extension.health = 'Build Synced';
      }
    }

    pushLog(service.id, str);
  });

  child.stderr?.on('data', (chunk) => {
    const str = chunk.toString();
    const isRealError = /error|fatal|fail/i.test(str);
    if (isRealError) {
      serviceStates[service.id].health = 'Stderr Warning';
    }
    pushLog(service.id, str, isRealError);
  });

  child.on('exit', (code) => {
    if (isShuttingDown) return;
    serviceStates[service.id].status = code === 0 ? 'STOPPED' : 'ERROR';
    serviceStates[service.id].health = `Exited (code ${code})`;
    pushLog(service.id, `Process exited with code ${code}`, code !== 0);
    renderDashboard();
  });
}

// ── Active Health Prober ─────────────────────────────────────────────────────
function probeServices() {
  // Probe Backend (port 8788)
  const reqBack = http.get('http://127.0.0.1:8788/api/system/probe', (res) => {
    if (res.statusCode === 200) {
      serviceStates.backend.status = 'ONLINE';
      serviceStates.backend.health = 'D1 Edge Verified';
    }
  });
  reqBack.on('error', () => {
    if (serviceStates.backend.status !== 'STARTING') {
      serviceStates.backend.health = 'Waiting on :8788';
    }
  });
  reqBack.setTimeout(800, () => reqBack.destroy());

  // Probe Frontend (port 5173)
  const reqFront = http.get('http://127.0.0.1:5173/', (res) => {
    if (res.statusCode === 200 || res.statusCode === 304) {
      serviceStates.frontend.status = 'ONLINE';
      serviceStates.frontend.health = 'HTTP 200 OK';
    }
  });
  reqFront.on('error', () => {
    if (serviceStates.frontend.status !== 'STARTING') {
      serviceStates.frontend.health = 'Waiting on :5173';
    }
  });
  reqFront.setTimeout(800, () => reqFront.destroy());
}

// ── TUI Terminal Renderer ────────────────────────────────────────────────────
function renderDashboard() {
  if (!process.stdout.isTTY || isShuttingDown) return;

  const width = Math.max(78, Math.min(process.stdout.columns || 80, 115));
  const innerWidth = width - 2;

  let out = '';

  // Move cursor to top-left
  out += `${ESC}?25l`; // Hide cursor
  out += `${ESC}H`;    // Move to (0,0)

  // 1. Header Banner
  const title = ` ${BOLD}${FG_WHITE}L I F E S O L V E R   C O M M A N D   C O C K P I T${RESET}  ${FG_VIOLET}[v3.2.0]${RESET} `;
  const borderTop = `${FG_DARK}${BOX.tl}${BOX.h.repeat(innerWidth)}${BOX.tr}${RESET}\n`;
  const bannerLine = `${FG_DARK}${BOX.v}${RESET}  ${FG_EMERALD}⚡${RESET} ${title}${' '.repeat(Math.max(0, innerWidth - 56))}${FG_DARK}${BOX.v}${RESET}\n`;
  
  const subLineText = `Edge Ecosystem (${pm.toUpperCase()})  ${FG_DARK}│${RESET}  Node ${process.version}  ${FG_DARK}│${RESET}  Uptime: ${FG_CYAN}${getUptime()}${RESET}  ${FG_DARK}│${RESET}  Filter: ${FG_AMBER}${activeLogFilter.toUpperCase()}${RESET}`;
  const subLinePadded = `  ${subLineText}${' '.repeat(Math.max(0, innerWidth - 68))}`;
  const subLine = `${FG_DARK}${BOX.v}${RESET}${subLinePadded}${FG_DARK}${BOX.v}${RESET}\n`;
  const borderMid = `${FG_DARK}${BOX.vl}${BOX.h.repeat(innerWidth)}${BOX.vr}${RESET}\n`;

  out += borderTop + bannerLine + subLine + borderMid;

  // 2. Services Table Header
  const colName = 16;
  const colTarget = 24;
  const colPort = 8;
  const colStatus = 14;
  const colHealth = innerWidth - (colName + colTarget + colPort + colStatus + 6);

  const pad = (str, len) => {
    const visibleLength = String(str).replace(/\x1b\[[0-9;]*m/g, '').length;
    return str + ' '.repeat(Math.max(0, len - visibleLength));
  };

  const headerRow = `  ${BOLD}${FG_MUTED}SERVICE${RESET}         ${BOLD}${FG_MUTED}TARGET / URL${RESET}            ${BOLD}${FG_MUTED}PORT${RESET}    ${BOLD}${FG_MUTED}STATUS${RESET}        ${BOLD}${FG_MUTED}HEALTH${RESET}`;
  out += `${FG_DARK}${BOX.v}${RESET}${pad(headerRow, innerWidth)}${FG_DARK}${BOX.v}${RESET}\n`;
  out += `${FG_DARK}${BOX.vl}${BOX.h.repeat(innerWidth)}${BOX.vr}${RESET}\n`;

  // 3. Service Rows
  for (const s of SERVICES) {
    const st = serviceStates[s.id];
    let statusFormatted = '';
    if (st.status === 'ONLINE' || st.status === 'WATCHING') {
      statusFormatted = `${FG_EMERALD}● ${st.status}${RESET}`;
    } else if (st.status === 'STARTING') {
      statusFormatted = `${FG_AMBER}● ${st.status}${RESET}`;
    } else {
      statusFormatted = `${FG_ROSE}✖ ${st.status}${RESET}`;
    }

    const nameStr = `${s.color}${BOLD}${s.name}${RESET}`;
    const targetStr = `${FG_WHITE}${s.target}${RESET}`;
    const portStr = s.port ? `${FG_CYAN}${s.port}${RESET}` : `${FG_MUTED}----${RESET}`;
    const healthStr = `${FG_MUTED}${st.health}${RESET}`;

    const rowContent = `  ${pad(nameStr, colName)} ${pad(targetStr, colTarget)} ${pad(portStr, colPort)} ${pad(statusFormatted, colStatus)} ${pad(healthStr, colHealth)}`;
    out += `${FG_DARK}${BOX.v}${RESET}${pad(rowContent, innerWidth)}${FG_DARK}${BOX.v}${RESET}\n`;
  }

  // 4. Action Hotkey Bar
  out += `${FG_DARK}${BOX.vl}${BOX.h.repeat(innerWidth)}${BOX.vr}${RESET}\n`;
  const hotkeys = `  ${FG_VIOLET}[f]${RESET} Web App  ${FG_VIOLET}[d]${RESET} Finance OS  ${FG_VIOLET}[b]${RESET} Backend  ${FG_VIOLET}[l]${RESET} Filter Logs  ${FG_VIOLET}[r]${RESET} Restart  ${FG_VIOLET}[c]${RESET} Clear  ${FG_ROSE}[q]${RESET} Quit`;
  out += `${FG_DARK}${BOX.v}${RESET}${pad(hotkeys, innerWidth)}${FG_DARK}${BOX.v}${RESET}\n`;
  out += `${FG_DARK}${BOX.vl}${BOX.h.repeat(innerWidth)}${BOX.vr}${RESET}\n`;

  // 5. Log Feed Header
  const filterLabel = activeLogFilter === 'all' ? 'ALL SERVICES' : `${activeLogFilter.toUpperCase()} ONLY`;
  const logHeader = `  ${BOLD}${FG_WHITE}LIVE TELEMETRY STREAM${RESET} ${FG_DARK}(${filterLabel})${RESET}`;
  out += `${FG_DARK}${BOX.v}${RESET}${pad(logHeader, innerWidth)}${FG_DARK}${BOX.v}${RESET}\n`;
  out += `${FG_DARK}${BOX.vl}${BOX.h.repeat(innerWidth)}${BOX.vr}${RESET}\n`;

  // 6. Log Entries
  const filteredLogs = activeLogFilter === 'all' 
    ? logs 
    : logs.filter((l) => l.serviceId === activeLogFilter || l.serviceId === 'system');

  const visibleLogs = filteredLogs.slice(-MAX_LOGS);

  if (visibleLogs.length === 0) {
    const emptyMsg = `  ${FG_MUTED}Awaiting live process streams...${RESET}`;
    out += `${FG_DARK}${BOX.v}${RESET}${pad(emptyMsg, innerWidth)}${FG_DARK}${BOX.v}${RESET}\n`;
  } else {
    for (const log of visibleLogs) {
      let svcBadge = '';
      if (log.serviceId === 'backend') svcBadge = `${FG_VIOLET}[BACKEND]${RESET}`;
      else if (log.serviceId === 'frontend') svcBadge = `${FG_CYAN}[FRONTEND]${RESET}`;
      else if (log.serviceId === 'extension') svcBadge = `${FG_AMBER}[EXTEN]${RESET}`;
      else svcBadge = `${FG_EMERALD}[SYSTEM]${RESET}`;

      const timeStr = `${FG_MUTED}${log.timestamp}${RESET}`;
      const maxTextWidth = Math.max(20, innerWidth - 22);
      const cleanText = log.text.slice(0, maxTextWidth);
      const row = `  ${timeStr} ${svcBadge} ${log.isError ? `${FG_ROSE}${cleanText}${RESET}` : cleanText}`;
      out += `${FG_DARK}${BOX.v}${RESET}${pad(row, innerWidth)}${FG_DARK}${BOX.v}${RESET}\n`;
    }
  }

  // Fill remaining space if logs are fewer than MAX_LOGS
  const remainingLines = MAX_LOGS - visibleLogs.length;
  for (let i = 0; i < Math.max(0, remainingLines); i++) {
    out += `${FG_DARK}${BOX.v}${RESET}${' '.repeat(innerWidth)}${FG_DARK}${BOX.v}${RESET}\n`;
  }

  // Footer Bottom Border
  out += `${FG_DARK}${BOX.bl}${BOX.h.repeat(innerWidth)}${BOX.br}${RESET}\n`;

  process.stdout.write(out);
}

// ── Interactive Keyboard Handling ────────────────────────────────────────────
function setupInteractiveInput() {
  if (!process.stdin.isTTY) return;

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  process.stdin.on('keypress', (str, key) => {
    if (!key) return;

    // Ctrl+C or 'q' -> Graceful Exit
    if ((key.ctrl && key.name === 'c') || key.name === 'q') {
      shutdown();
      return;
    }

    // 'f' -> Open Frontend in Browser
    if (key.name === 'f') {
      openBrowser('http://localhost:5173');
      return;
    }

    // 'd' -> Open Vertical 3: Finance OS in Browser
    if (key.name === 'd') {
      openBrowser('http://localhost:5173/finance');
      return;
    }

    // 'b' -> Open Backend System Probe
    if (key.name === 'b') {
      openBrowser('http://localhost:8788/api/system/probe');
      return;
    }

    // 'c' -> Clear Logs
    if (key.name === 'c') {
      logs.length = 0;
      pushLog('system', 'Terminal telemetry log buffer cleared.');
      renderDashboard();
      return;
    }

    // 'l' -> Cycle Filter
    if (key.name === 'l') {
      const filters = ['all', 'backend', 'frontend', 'extension'];
      const nextIdx = (filters.indexOf(activeLogFilter) + 1) % filters.length;
      activeLogFilter = filters[nextIdx];
      renderDashboard();
      return;
    }

    // 'r' -> Restart Services
    if (key.name === 'r') {
      pushLog('system', 'Restarting all LifeSolver services...');
      for (const [id, child] of childProcesses.entries()) {
        killProcessTree(child.pid);
      }
      childProcesses.clear();
      SERVICES.forEach(startService);
      renderDashboard();
      return;
    }
  });
}

// ── Graceful Shutdown ────────────────────────────────────────────────────────
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  if (process.stdout.isTTY) {
    process.stdout.write(`${ESC}?25h\n`); // Show cursor
  }

  console.log(`\n${FG_ROSE}${BOLD}🛑 Shutting down LifeSolver ecosystem...${RESET}`);

  for (const [name, child] of childProcesses.entries()) {
    console.log(`  ${FG_MUTED}Terminating ${name} (PID: ${child.pid})...${RESET}`);
    killProcessTree(child.pid);
  }

  childProcesses.clear();
  console.log(`${FG_EMERALD}✓ All ports cleanly released. Good luck, Commander.${RESET}\n`);
  process.exit(0);
}

// ── Main Entrypoint ──────────────────────────────────────────────────────────
async function main() {
  if (process.stdout.isTTY) {
    console.clear();
  }

  pushLog('system', `LifeSolver v3.2 Engine initializing via [${pm.toUpperCase()}]...`);

  // Launch all 3 services
  SERVICES.forEach(startService);

  // Setup interactive hotkeys
  setupInteractiveInput();

  // Initial render
  renderDashboard();

  // Periodic render & Health Probe Loop (Adaptive: 1s while starting, 15s once online)
  let probeCounter = 0;
  setInterval(() => {
    if (!isShuttingDown) {
      probeCounter++;
      const allOnline = serviceStates.backend.status === 'ONLINE' && serviceStates.frontend.status === 'ONLINE';
      const probeInterval = allOnline ? 15 : 1; // probe every 15s when healthy, 1s while starting

      if (probeCounter % probeInterval === 0) {
        probeServices();
      }
      renderDashboard();
    }
  }, 1000);

  // Termination Signal Handlers
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', () => {
    if (process.stdout.isTTY) {
      process.stdout.write(`${ESC}?25h`); // Restore cursor
    }
  });
}

main().catch((err) => {
  console.error('Fatal initialization error:', err);
  shutdown();
});
