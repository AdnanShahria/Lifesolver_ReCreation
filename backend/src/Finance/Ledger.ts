import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, sql, lt } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { financeTable, budgetsTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const ledgerRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

ledgerRoute.use('*', authMiddleware, subscriptionMiddleware);

const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be greater than zero'),
  category: z.string().trim().min(1, 'Category is required'),
  description: z.string().trim().optional().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  isSpecial: z.number().int().min(0).max(1).default(0),
  budgetId: z.string().optional().nullable()
});

const updateTransactionSchema = createTransactionSchema.partial();

// ── GET /ledger (Transactions + Real-time Computed Balances) ──────
ledgerRoute.get('/ledger', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    const isSpecialParam = c.req.query('isSpecial');
    const typeParam = c.req.query('type');
    const categoryParam = c.req.query('category');
    const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
    const cursor = c.req.query('cursor');

    // 1. Compute dynamic balances server-side
    const balanceRows = await db
      .select({
        type: financeTable.type,
        isSpecial: financeTable.isSpecial,
        total: sql<number>`SUM(${financeTable.amount})`
      })
      .from(financeTable)
      .where(eq(financeTable.userId, userId))
      .groupBy(financeTable.type, financeTable.isSpecial);

    let regularIncome = 0;
    let regularExpense = 0;
    let specialIncome = 0;
    let specialExpense = 0;

    for (const row of balanceRows) {
      const amount = Number(row.total || 0);
      if (row.isSpecial === 1) {
        if (row.type === 'income') specialIncome += amount;
        else specialExpense += amount;
      } else {
        if (row.type === 'income') regularIncome += amount;
        else regularExpense += amount;
      }
    }

    const regularBalance = regularIncome - regularExpense;
    const specialBalance = specialIncome - specialExpense;
    const totalBalance = regularBalance + specialBalance;

    // Current month metrics
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthRows = await db
      .select({
        type: financeTable.type,
        total: sql<number>`SUM(${financeTable.amount})`
      })
      .from(financeTable)
      .where(
        and(
          eq(financeTable.userId, userId),
          sql`${financeTable.date} LIKE ${currentMonthPrefix + '%'}`
        )
      )
      .groupBy(financeTable.type);

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    for (const r of currentMonthRows) {
      if (r.type === 'income') monthlyIncome += Number(r.total || 0);
      else monthlyExpense += Number(r.total || 0);
    }

    // 2. Fetch paginated transactions
    const filters = [eq(financeTable.userId, userId)];

    if (isSpecialParam !== undefined && isSpecialParam !== 'all') {
      filters.push(eq(financeTable.isSpecial, parseInt(isSpecialParam, 10)));
    }
    if (typeParam === 'income' || typeParam === 'expense') {
      filters.push(eq(financeTable.type, typeParam));
    }
    if (categoryParam) {
      filters.push(eq(financeTable.category, categoryParam));
    }
    if (cursor) {
      filters.push(lt(financeTable.createdAt, cursor));
    }

    const rows = await db
      .select()
      .from(financeTable)
      .where(and(...filters))
      .orderBy(desc(financeTable.date), desc(financeTable.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const transactions = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? transactions[transactions.length - 1].createdAt : null;

    return jsonOk(c, {
      transactions,
      nextCursor,
      summary: {
        totalBalance,
        regularBalance,
        regularIncome,
        regularExpense,
        specialBalance,
        specialIncome,
        specialExpense,
        monthlyIncome,
        monthlyExpense,
        netSavingsRate: monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) : 0
      }
    });
  } catch (error: any) {
    console.error('Fetch ledger error:', error);
    return jsonError(c, error?.message || 'Failed to fetch financial ledger', 'LEDGER_ERROR', 500);
  }
});

// ── POST /transactions (Create Income/Expense Entry) ──────────────
ledgerRoute.post('/transactions', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid transaction data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const id = `fin_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    const newEntry = {
      id,
      userId,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      description: parsed.data.description || null,
      date: parsed.data.date || todayStr,
      isSpecial: parsed.data.isSpecial ?? 0,
      budgetId: parsed.data.budgetId || null
    };

    await db.insert(financeTable).values(newEntry);

    // If attached to budget and is an expense, optionally update budget current amount
    if (parsed.data.budgetId && parsed.data.type === 'expense') {
      await db
        .update(budgetsTable)
        .set({
          currentAmount: sql`${budgetsTable.currentAmount} + ${parsed.data.amount}`
        })
        .where(eq(budgetsTable.id, parsed.data.budgetId));
    }

    return jsonOk(c, { transaction: newEntry, message: 'Transaction recorded successfully' }, 201);
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return jsonError(c, error?.message || 'Failed to record transaction', 'TRANSACTION_ERROR', 500);
  }
});

// ── PUT /transactions/:id (Update Entry) ──────────────────────────
ledgerRoute.put('/transactions/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid updates', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(financeTable)
      .where(and(eq(financeTable.id, id), eq(financeTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Transaction not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof financeTable.$inferInsert> = {};
    if (parsed.data.type) updates.type = parsed.data.type;
    if (parsed.data.amount !== undefined) updates.amount = parsed.data.amount;
    if (parsed.data.category) updates.category = parsed.data.category;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.date) updates.date = parsed.data.date;
    if (parsed.data.isSpecial !== undefined) updates.isSpecial = parsed.data.isSpecial;
    if (parsed.data.budgetId !== undefined) updates.budgetId = parsed.data.budgetId;

    await db.update(financeTable).set(updates).where(eq(financeTable.id, id));

    const updated = await db
      .select()
      .from(financeTable)
      .where(eq(financeTable.id, id))
      .get();

    return jsonOk(c, { transaction: updated, message: 'Transaction updated' });
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return jsonError(c, error?.message || 'Failed to update transaction', 'UPDATE_ERROR', 500);
  }
});

// ── DELETE /transactions/:id ──────────────────────────────────────
ledgerRoute.delete('/transactions/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(financeTable)
      .where(and(eq(financeTable.id, id), eq(financeTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Transaction not found', 'NOT_FOUND', 404);
    }

    await db.delete(financeTable).where(eq(financeTable.id, id));

    return jsonOk(c, { message: 'Transaction deleted successfully' });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return jsonError(c, error?.message || 'Failed to delete transaction', 'DELETE_ERROR', 500);
  }
});
