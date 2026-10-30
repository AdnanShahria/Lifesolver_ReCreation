import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, sql, desc } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { accountsTable, financeTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const accountsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

accountsRoute.use('*', authMiddleware, subscriptionMiddleware);

// ── Default Exchange Rates to USD (Fallback Reference Matrix) ───────
export const DEFAULT_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  BDT: 0.00833, // 1 USD ≈ 120 BDT
  EUR: 1.08,
  GBP: 1.28,
  INR: 0.012,
  CAD: 0.74,
  AUD: 0.65,
  JPY: 0.0066,
  CNY: 0.14,
  BTC: 65000.0,
  ETH: 3500.0
};

export function convertToUsd(amount: number, currency: string = 'USD'): number {
  const code = (currency || 'USD').toUpperCase();
  const rate = DEFAULT_RATES_TO_USD[code] ?? 1.0;
  return amount * rate;
}

// ── Seed Starter Accounts Definition ────────────────────────────────
const STARTER_ACCOUNTS = [
  {
    name: 'Cash Wallet',
    type: 'cash',
    subtype: null,
    currency: 'USD',
    balance: 250,
    color: '#10b981',
    icon: 'Banknote'
  },
  {
    name: 'Main Bank Account',
    type: 'bank',
    subtype: null,
    currency: 'USD',
    balance: 3420,
    color: '#3b82f6',
    icon: 'Building2'
  },
  {
    name: 'bKash Mobile Wallet',
    type: 'mobile_wallet',
    subtype: 'bkash',
    currency: 'BDT',
    balance: 18500,
    color: '#e11d48',
    icon: 'Smartphone'
  },
  {
    name: 'PayPal USD',
    type: 'online_wallet',
    subtype: 'paypal',
    currency: 'USD',
    balance: 480,
    color: '#0284c7',
    icon: 'Globe'
  }
];

// ── Validation Schemas ──────────────────────────────────────────────
const accountTypes = [
  'bank',
  'mobile_wallet',
  'online_wallet',
  'cash',
  'credit_card',
  'crypto',
  'investment',
  'custom'
] as const;

const createAccountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required'),
  type: z.enum(accountTypes, { errorMap: () => ({ message: 'Invalid account type' }) }),
  subtype: z.string().trim().optional().nullable(),
  currency: z.string().trim().min(1, 'Currency is required').default('USD'),
  initialBalance: z.number().default(0),
  creditLimit: z.number().min(0, 'Credit limit cannot be negative').optional().default(0),
  color: z.string().trim().optional().default('#8b5cf6'),
  icon: z.string().trim().optional().default('Wallet'),
  excludeFromNetWorth: z.number().int().min(0).max(1).optional().default(0)
});

const updateAccountSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.enum(accountTypes).optional(),
  subtype: z.string().trim().optional().nullable(),
  currency: z.string().trim().min(1).optional(),
  creditLimit: z.number().min(0).optional(),
  color: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  isActive: z.number().int().min(0).max(1).optional(),
  excludeFromNetWorth: z.number().int().min(0).max(1).optional()
});

const adjustBalanceSchema = z.object({
  newBalance: z.number({ required_error: 'New balance is required' }),
  reason: z.string().trim().optional(),
  logTransaction: z.boolean().optional().default(true)
});

// ── Summary Helper ──────────────────────────────────────────────────
function computeSummary(accounts: Array<typeof accountsTable.$inferSelect>) {
  let totalBalanceUsd = 0;
  let netWorthUsd = 0;
  const byType: Record<string, number> = {};

  for (const acc of accounts) {
    const bal = Number(acc.currentBalance || 0);
    const converted = convertToUsd(bal, acc.currency);
    totalBalanceUsd += converted;

    if (acc.excludeFromNetWorth !== 1) {
      netWorthUsd += converted;
    }

    byType[acc.type] = (byType[acc.type] || 0) + converted;
  }

  totalBalanceUsd = Math.round(totalBalanceUsd * 100) / 100;
  netWorthUsd = Math.round(netWorthUsd * 100) / 100;
  for (const k in byType) {
    byType[k] = Math.round(byType[k] * 100) / 100;
  }

  return {
    totalBalance: totalBalanceUsd,
    netWorth: netWorthUsd,
    accountsCount: accounts.length,
    byType
  };
}

// ── GET /accounts (List accounts + Auto-seed + Converted Balance) ────
accountsRoute.get('/accounts', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    let accounts = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.userId, userId), eq(accountsTable.isActive, 1)))
      .orderBy(desc(accountsTable.createdAt));

    // If no active accounts exist, check if user has ANY accounts at all
    if (accounts.length === 0) {
      const anyExisting = await db
        .select({ id: accountsTable.id })
        .from(accountsTable)
        .where(eq(accountsTable.userId, userId))
        .limit(1);

      if (anyExisting.length === 0) {
        // Auto-seed the 4 starter accounts
        const seedPayload = STARTER_ACCOUNTS.map((acc) => ({
          id: `acc_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`,
          userId,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          currency: acc.currency,
          initialBalance: acc.balance,
          currentBalance: acc.balance,
          creditLimit: 0,
          color: acc.color,
          icon: acc.icon,
          isActive: 1,
          excludeFromNetWorth: 0
        }));

        await db.insert(accountsTable).values(seedPayload);

        accounts = await db
          .select()
          .from(accountsTable)
          .where(and(eq(accountsTable.userId, userId), eq(accountsTable.isActive, 1)))
          .orderBy(desc(accountsTable.createdAt));
      }
    }

    const summary = computeSummary(accounts);

    return jsonOk(c, {
      accounts,
      totalConvertedBalance: summary.totalBalance,
      summary
    });
  } catch (error: any) {
    console.error('Fetch accounts error:', error);
    return jsonError(c, error?.message || 'Failed to fetch accounts', 'ACCOUNTS_ERROR', 500);
  }
});

// ── GET /accounts/:id (Single account detail) ───────────────────────
accountsRoute.get('/accounts/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const account = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.id, id), eq(accountsTable.userId, userId)))
      .get();

    if (!account) {
      return jsonError(c, 'Account not found', 'NOT_FOUND', 404);
    }

    return jsonOk(c, { account });
  } catch (error: any) {
    console.error('Fetch account detail error:', error);
    return jsonError(c, error?.message || 'Failed to fetch account', 'ACCOUNT_ERROR', 500);
  }
});

// ── POST /accounts (Create new Account) ─────────────────────────────
accountsRoute.post('/accounts', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createAccountSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid account data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const id = `acc_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    const newAccount = {
      id,
      userId,
      name: parsed.data.name,
      type: parsed.data.type,
      subtype: parsed.data.subtype || null,
      currency: parsed.data.currency.toUpperCase(),
      initialBalance: parsed.data.initialBalance ?? 0,
      currentBalance: parsed.data.initialBalance ?? 0,
      creditLimit: parsed.data.creditLimit ?? 0,
      color: parsed.data.color || '#8b5cf6',
      icon: parsed.data.icon || 'Wallet',
      isActive: 1,
      excludeFromNetWorth: parsed.data.excludeFromNetWorth ?? 0
    };

    await db.insert(accountsTable).values(newAccount);

    return jsonOk(c, { account: newAccount, message: 'Account created successfully' }, 201);
  } catch (error: any) {
    console.error('Create account error:', error);
    return jsonError(c, error?.message || 'Failed to create account', 'CREATE_ACCOUNT_ERROR', 500);
  }
});

// ── PUT /accounts/:id (Update Account) ──────────────────────────────
accountsRoute.put('/accounts/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateAccountSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid account updates', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.id, id), eq(accountsTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Account not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof accountsTable.$inferInsert> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.type !== undefined) updates.type = parsed.data.type;
    if (parsed.data.subtype !== undefined) updates.subtype = parsed.data.subtype;
    if (parsed.data.currency !== undefined) updates.currency = parsed.data.currency.toUpperCase();
    if (parsed.data.creditLimit !== undefined) updates.creditLimit = parsed.data.creditLimit;
    if (parsed.data.color !== undefined) updates.color = parsed.data.color;
    if (parsed.data.icon !== undefined) updates.icon = parsed.data.icon;
    if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
    if (parsed.data.excludeFromNetWorth !== undefined) updates.excludeFromNetWorth = parsed.data.excludeFromNetWorth;

    await db.update(accountsTable).set(updates).where(eq(accountsTable.id, id));

    const updated = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.id, id))
      .get();

    return jsonOk(c, { account: updated, message: 'Account updated successfully' });
  } catch (error: any) {
    console.error('Update account error:', error);
    return jsonError(c, error?.message || 'Failed to update account', 'UPDATE_ACCOUNT_ERROR', 500);
  }
});

// ── DELETE /accounts/:id (Delete Account) ───────────────────────────
accountsRoute.delete('/accounts/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.id, id), eq(accountsTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Account not found', 'NOT_FOUND', 404);
    }

    await db.delete(accountsTable).where(and(eq(accountsTable.id, id), eq(accountsTable.userId, userId)));

    return jsonOk(c, { message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return jsonError(c, error?.message || 'Failed to delete account', 'DELETE_ACCOUNT_ERROR', 500);
  }
});

// ── POST /accounts/:id/adjust (Direct Balance Adjustment + Reconciliation) ──
accountsRoute.post('/accounts/:id/adjust', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = adjustBalanceSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid adjustment data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.id, id), eq(accountsTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Account not found', 'NOT_FOUND', 404);
    }

    const oldBalance = Number(existing.currentBalance || 0);
    const newBalance = Number(parsed.data.newBalance);
    const diff = Math.round((newBalance - oldBalance) * 100) / 100;

    // 1. Update currentBalance on account
    await db
      .update(accountsTable)
      .set({ currentBalance: newBalance })
      .where(eq(accountsTable.id, id));

    // 2. Optionally record reconciliation transaction in general ledger
    let reconciliationTx = null;
    if (parsed.data.logTransaction && diff !== 0) {
      const txId = `fin_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      const todayStr = new Date().toISOString().slice(0, 10);
      const isPositive = diff > 0;

      reconciliationTx = {
        id: txId,
        userId,
        accountId: id,
        type: (isPositive ? 'income' : 'expense') as 'income' | 'expense',
        amount: Math.abs(diff),
        category: 'Reconciliation',
        description: parsed.data.reason || `Balance adjustment for ${existing.name} (${diff > 0 ? '+' : ''}${diff} ${existing.currency})`,
        payee: 'Balance Correction',
        date: todayStr,
        isSpecial: 0,
        budgetId: null
      };

      await db.insert(financeTable).values(reconciliationTx);
    }

    const updated = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.id, id))
      .get();

    return jsonOk(c, {
      account: updated,
      difference: diff,
      reconciliationTransaction: reconciliationTx,
      message: 'Account balance adjusted successfully'
    });
  } catch (error: any) {
    console.error('Adjust account balance error:', error);
    return jsonError(c, error?.message || 'Failed to adjust balance', 'ADJUST_ACCOUNT_ERROR', 500);
  }
});
