import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env, AppVariables } from './types';
import { authMiddleware } from './_core/auth.middleware';
import { adminMiddleware } from './_core/admin.middleware';
import { subscriptionMiddleware } from './_core/subscription.middleware';
import { jsonOk } from './_core/response';

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

app.use('*', logger());
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
      kv: !!c.env.KV,
      r2: !!c.env.R2_BUCKET,
      ai: !!c.env.AI,
      vectorize: !!c.env.VECTORIZE_INDEX,
      queue: !!c.env.NOTIFICATION_QUEUE
    }
  });
});

// ── Auth Module ───────────────────────────────────
app.post('/api/auth/register', async (c) => {
  return jsonOk(c, { message: 'Register endpoint ready' });
});

app.post('/api/auth/login', async (c) => {
  return jsonOk(c, { token: 'mock_jwt_token', user: { id: 'usr_01', email: 'user@lifesolver.app' } });
});

app.post('/api/auth/verify-otp', async (c) => {
  return jsonOk(c, { verified: true });
});

// ── 8 Core Verticals (Protected) ─────────────────

// 1. Planner (Tasks, Goals, Calendar)
app.get('/api/planner/tasks', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { tasks: [] });
});

app.post('/api/planner/tasks', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { created: true }, 201);
});

// 2. Mind (Notes, Flashcards, Journal)
app.get('/api/mind/notes', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { notes: [] });
});

// 3. Finance (Ledger, Budgets, Loans)
app.get('/api/finance/ledger', authMiddleware, subscriptionMiddleware, async (c) => {
  return jsonOk(c, { transactions: [], summary: { balance: 0, income: 0, expenses: 0 } });
});

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

// ── Admin Matrix ──────────────────────────────────
app.get('/adm/api/dashboard', adminMiddleware, async (c) => {
  return jsonOk(c, { activeUsers: 1, mrr: 0, edgeHealthy: true });
});

export default app;
