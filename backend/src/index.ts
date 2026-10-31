import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env, AppVariables } from './types';
import { authMiddleware } from './_core/auth.middleware';
import { adminMiddleware } from './_core/admin.middleware';
import { subscriptionMiddleware } from './_core/subscription.middleware';
import { jsonOk } from './_core/response';
import { authRouter } from './Auth';
import { plannerRouter } from './Planner';
import { financeRouter } from './Finance';
import { adminRouter } from './Admin/AdminRouter';

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

const honoLogger = logger();
app.use('*', async (c, next) => {
  // Silence noisy telemetry and health probes from console logs
  if (c.req.path === '/api/system/probe') {
    return next();
  }
  return honoLogger(c, next);
});
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ── System Diagnostics Probe ──────────────────────
app.get('/api/system/probe', (c) => {
  return jsonOk(c, {
    status: 'online',
    version: '3.2.0',
    timestamp: new Date().toISOString(),
    cloudflareEdge: true,
    bindings: {
      db: !!c.env.DB,
      turso: !!c.env.TURSO_URL,
      kv: !!c.env.KV,
      r2: !!c.env.R2_BUCKET,
      ai: !!c.env.AI,
      vectorize: !!c.env.VECTORIZE_INDEX,
      queue: !!c.env.NOTIFICATION_QUEUE
    }
  });
});

// ── Auth Module ───────────────────────────────────
app.route('/api/auth', authRouter);

// ── 8 Core Verticals (Protected) ─────────────────

// 1. Planner (Tasks, Lists, Subtasks, Columns, Folders)
app.route('/api/planner', plannerRouter);

// 2. Mind (Notes, Flashcards, Journal)
app.get('/api/mind/notes', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { notes: [] });
});

// 3. Finance (Ledger, Budgets, Savings, Bills, Loans, Analytics)
app.route('/api/finance', financeRouter);

// 4. Health (Habits, Gym, Vitals)
app.get('/api/health/habits', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { habits: [] });
});

// 5. Focus (Pomodoro, Screen Time Telemetry)
app.get('/api/focus/telemetry', authMiddleware, async (c) => {
  return jsonOk(c, { focusMinutes: 0, blockedDistractions: 0 });
});

// 6. Assets (Inventory, Warranties, Vault)
app.get('/api/assets/inventory', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { items: [] });
});

// 7. Network (Contacts, Commitments)
app.get('/api/network/contacts', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { contacts: [] });
});

// 8. Copilot (Orbit AI Engine)
app.post('/api/copilot/chat', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { response: 'Orbit AI Copilot connected.' });
});

// ── Billing & Subscriptions ───────────────────────
app.get('/api/billing/plans', async (c) => {
  return jsonOk(c, {
    plans: [
      { id: 'free', name: 'Free Starter', price: 0 },
      { id: 'pro', name: 'Pro Life OS', price: 9.99 },
      { id: 'elite', name: 'Elite Master', price: 19.99 }
    ]
  });
});

// ── SysAdmin Monitoring & Governance Matrix ──────
app.route('/api/admin', adminRouter);
app.route('/adm/api', adminRouter);

export { app };
export default app;
