import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { budgetsTable, financeTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const budgetsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

budgetsRoute.use('*', authMiddleware, subscriptionMiddleware);

const createBudgetSchema = z.object({
  name: z.string().trim().min(1, 'Budget name is required'),
  targetAmount: z.number().positive('Target budget must be greater than zero'),
  category: z.string().trim().min(1, 'Category is required'),
  period: z.enum(['weekly', 'monthly', 'yearly']).default('monthly'),
  isSpecial: z.number().int().min(0).max(1).default(0)
});

const updateBudgetSchema = createBudgetSchema.partial();

// ── GET /budgets ──────────────────────────────────────────────────
budgetsRoute.get('/budgets', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    // Fetch user budgets
    const budgets = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.userId, userId), eq(budgetsTable.type, 'budget')));

    // For each budget, compute actual spent in current month
    const enhancedBudgets = await Promise.all(
      budgets.map(async (b) => {
        const spendRow = await db
          .select({
            spent: sql<number>`SUM(${financeTable.amount})`
          })
          .from(financeTable)
          .where(
            and(
              eq(financeTable.userId, userId),
              eq(financeTable.type, 'expense'),
              sql`${financeTable.date} LIKE ${currentMonthPrefix + '%'}`,
              sql`(${financeTable.budgetId} = ${b.id} OR ${financeTable.category} = ${b.category})`
            )
          )
          .get();

        const actualSpent = Number(spendRow?.spent || 0);
        const percent = b.targetAmount > 0 ? Math.min(Math.round((actualSpent / b.targetAmount) * 100), 999) : 0;
        const status = percent >= 100 ? 'exceeded' : percent >= 80 ? 'warning' : 'on-track';

        return {
          ...b,
          currentAmount: actualSpent,
          percentSpent: percent,
          status,
          remaining: Math.max(0, b.targetAmount - actualSpent)
        };
      })
    );

    const totalTarget = enhancedBudgets.reduce((acc, b) => acc + b.targetAmount, 0);
    const totalSpent = enhancedBudgets.reduce((acc, b) => acc + b.currentAmount, 0);

    return jsonOk(c, {
      budgets: enhancedBudgets,
      overview: {
        totalTarget,
        totalSpent,
        totalRemaining: Math.max(0, totalTarget - totalSpent),
        overallPercent: totalTarget > 0 ? Math.round((totalSpent / totalTarget) * 100) : 0
      }
    });
  } catch (error: any) {
    console.error('Fetch budgets error:', error);
    return jsonError(c, error?.message || 'Failed to fetch budgets', 'BUDGET_ERROR', 500);
  }
});

// ── POST /budgets ─────────────────────────────────────────────────
budgetsRoute.post('/budgets', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid budget data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const id = `bdg_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    const newBudget = {
      id,
      userId,
      name: parsed.data.name,
      type: 'budget',
      targetAmount: parsed.data.targetAmount,
      currentAmount: 0,
      category: parsed.data.category,
      period: parsed.data.period,
      isSpecial: parsed.data.isSpecial,
      startDate: new Date().toISOString().slice(0, 10),
      deadlineDate: null
    };

    await db.insert(budgetsTable).values(newBudget);

    return jsonOk(c, { budget: newBudget, message: 'Budget created successfully' }, 201);
  } catch (error: any) {
    console.error('Create budget error:', error);
    return jsonError(c, error?.message || 'Failed to create budget', 'BUDGET_ERROR', 500);
  }
});

// ── PUT /budgets/:id ──────────────────────────────────────────────
budgetsRoute.put('/budgets/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid updates', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const existing = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Budget not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof budgetsTable.$inferInsert> = {};
    if (parsed.data.name) updates.name = parsed.data.name;
    if (parsed.data.targetAmount !== undefined) updates.targetAmount = parsed.data.targetAmount;
    if (parsed.data.category) updates.category = parsed.data.category;
    if (parsed.data.period) updates.period = parsed.data.period;

    await db.update(budgetsTable).set(updates).where(eq(budgetsTable.id, id));

    const updated = await db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.id, id))
      .get();

    return jsonOk(c, { budget: updated, message: 'Budget updated successfully' });
  } catch (error: any) {
    console.error('Update budget error:', error);
    return jsonError(c, error?.message || 'Failed to update budget', 'BUDGET_ERROR', 500);
  }
});

// ── DELETE /budgets/:id ───────────────────────────────────────────
budgetsRoute.delete('/budgets/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const existing = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId)))
      .get();

    if (!existing) {
      return jsonError(c, 'Budget not found', 'NOT_FOUND', 404);
    }

    await db.delete(budgetsTable).where(eq(budgetsTable.id, id));

    return jsonOk(c, { message: 'Budget deleted successfully' });
  } catch (error: any) {
    console.error('Delete budget error:', error);
    return jsonError(c, error?.message || 'Failed to delete budget', 'BUDGET_ERROR', 500);
  }
});
