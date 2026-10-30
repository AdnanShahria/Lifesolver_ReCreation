import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { budgetsTable, savingsTransactionsTable, financeTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const savingsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

savingsRoute.use('*', authMiddleware, subscriptionMiddleware);

const createSavingsSchema = z.object({
  name: z.string().trim().min(1, 'Savings pot name is required'),
  targetAmount: z.number().positive('Target amount must be greater than zero'),
  category: z.string().trim().optional().default('Savings'),
  deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline date must be YYYY-MM-DD').optional().nullable(),
  isSpecial: z.number().int().min(0).max(1).optional().default(0)
});

const depositWithdrawSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
  description: z.string().trim().optional(),
  logToLedger: z.boolean().optional().default(false)
});

// ── GET /savings ──────────────────────────────────────────────────
savingsRoute.get('/savings', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    const pots = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.userId, userId), eq(budgetsTable.type, 'savings')))
      .orderBy(desc(budgetsTable.createdAt));

    const enhancedPots = await Promise.all(
      pots.map(async (pot) => {
        const transactions = await db
          .select()
          .from(savingsTransactionsTable)
          .where(and(eq(savingsTransactionsTable.savingsId, pot.id), eq(savingsTransactionsTable.userId, userId)))
          .orderBy(desc(savingsTransactionsTable.date), desc(savingsTransactionsTable.createdAt));

        const currentAmount = Number(pot.currentAmount || 0);
        const targetAmount = Number(pot.targetAmount || 0);
        const progressPercentage = targetAmount > 0 ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100) : 0;
        const remainingTarget = Math.max(0, targetAmount - currentAmount);

        return {
          ...pot,
          currentAmount,
          targetAmount,
          progressPercentage,
          remainingTarget,
          transactions
        };
      })
    );

    const totalSaved = enhancedPots.reduce((acc, p) => acc + p.currentAmount, 0);
    const totalTarget = enhancedPots.reduce((acc, p) => acc + p.targetAmount, 0);
    const totalRemaining = Math.max(0, totalTarget - totalSaved);
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return jsonOk(c, {
      savings: enhancedPots,
      summary: {
        totalSaved,
        totalTarget,
        totalRemaining,
        overallProgress,
        activePotsCount: enhancedPots.length
      }
    });
  } catch (error: any) {
    console.error('Fetch savings error:', error);
    return jsonError(c, error?.message || 'Failed to fetch savings pots', 'SAVINGS_ERROR', 500);
  }
});

// ── POST /savings ─────────────────────────────────────────────────
savingsRoute.post('/savings', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createSavingsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid savings pot data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const id = `svg_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    const newPot = {
      id,
      userId,
      name: parsed.data.name,
      type: 'savings',
      targetAmount: parsed.data.targetAmount,
      currentAmount: 0,
      category: parsed.data.category || 'Savings',
      period: null,
      startDate: todayStr,
      deadlineDate: parsed.data.deadlineDate || null,
      isSpecial: parsed.data.isSpecial ?? 0
    };

    await db.insert(budgetsTable).values(newPot);

    return jsonOk(c, { pot: newPot, message: 'Savings pot created successfully' }, 201);
  } catch (error: any) {
    console.error('Create savings error:', error);
    return jsonError(c, error?.message || 'Failed to create savings pot', 'SAVINGS_ERROR', 500);
  }
});

// ── POST /savings/:id/deposit ─────────────────────────────────────
savingsRoute.post('/savings/:id/deposit', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = depositWithdrawSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid deposit data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const pot = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId), eq(budgetsTable.type, 'savings')))
      .get();

    if (!pot) {
      return jsonError(c, 'Savings pot not found', 'NOT_FOUND', 404);
    }

    // 1. Update currentAmount in budgetsTable
    await db
      .update(budgetsTable)
      .set({
        currentAmount: sql`${budgetsTable.currentAmount} + ${parsed.data.amount}`
      })
      .where(eq(budgetsTable.id, id));

    // 2. Insert into savingsTransactionsTable
    const txId = `stx_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const today = new Date().toISOString().slice(0, 10);
    const txRecord = {
      id: txId,
      savingsId: id,
      userId,
      type: 'deposit',
      amount: parsed.data.amount,
      description: parsed.data.description || 'Deposit to savings',
      date: today
    };
    await db.insert(savingsTransactionsTable).values(txRecord);

    // 3. Log to general ledger (expense) if requested
    let ledgerTx = null;
    if (parsed.data.logToLedger) {
      const ledgerId = `fin_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      ledgerTx = {
        id: ledgerId,
        userId,
        type: 'expense' as const,
        amount: parsed.data.amount,
        category: pot.category || 'Savings',
        description: `Savings Deposit: ${pot.name}${parsed.data.description ? ` - ${parsed.data.description}` : ''}`,
        date: today,
        isSpecial: pot.isSpecial ?? 0,
        budgetId: pot.id
      };
      await db.insert(financeTable).values(ledgerTx);
    }

    const updatedPot = await db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.id, id))
      .get();

    return jsonOk(c, {
      pot: updatedPot,
      transaction: txRecord,
      ledgerTransaction: ledgerTx,
      message: 'Deposit recorded successfully'
    });
  } catch (error: any) {
    console.error('Deposit error:', error);
    return jsonError(c, error?.message || 'Failed to record deposit', 'DEPOSIT_ERROR', 500);
  }
});

// ── POST /savings/:id/withdraw ────────────────────────────────────
savingsRoute.post('/savings/:id/withdraw', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = depositWithdrawSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid withdrawal data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const pot = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId), eq(budgetsTable.type, 'savings')))
      .get();

    if (!pot) {
      return jsonError(c, 'Savings pot not found', 'NOT_FOUND', 404);
    }

    if ((pot.currentAmount || 0) < parsed.data.amount) {
      return jsonError(c, 'Withdrawal amount exceeds available savings pot balance', 'INSUFFICIENT_FUNDS', 400);
    }

    // 1. Decrement currentAmount in budgetsTable
    await db
      .update(budgetsTable)
      .set({
        currentAmount: sql`MAX(0, ${budgetsTable.currentAmount} - ${parsed.data.amount})`
      })
      .where(eq(budgetsTable.id, id));

    // 2. Insert into savingsTransactionsTable
    const txId = `stx_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const today = new Date().toISOString().slice(0, 10);
    const txRecord = {
      id: txId,
      savingsId: id,
      userId,
      type: 'withdraw',
      amount: parsed.data.amount,
      description: parsed.data.description || 'Withdrawal from savings',
      date: today
    };
    await db.insert(savingsTransactionsTable).values(txRecord);

    // 3. Log to general ledger (income) if requested
    let ledgerTx = null;
    if (parsed.data.logToLedger) {
      const ledgerId = `fin_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      ledgerTx = {
        id: ledgerId,
        userId,
        type: 'income' as const,
        amount: parsed.data.amount,
        category: pot.category || 'Savings',
        description: `Savings Withdrawal: ${pot.name}${parsed.data.description ? ` - ${parsed.data.description}` : ''}`,
        date: today,
        isSpecial: pot.isSpecial ?? 0,
        budgetId: pot.id
      };
      await db.insert(financeTable).values(ledgerTx);
    }

    const updatedPot = await db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.id, id))
      .get();

    return jsonOk(c, {
      pot: updatedPot,
      transaction: txRecord,
      ledgerTransaction: ledgerTx,
      message: 'Withdrawal recorded successfully'
    });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return jsonError(c, error?.message || 'Failed to record withdrawal', 'WITHDRAWAL_ERROR', 500);
  }
});

// ── DELETE /savings/:id ───────────────────────────────────────────
savingsRoute.delete('/savings/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const pot = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.id, id), eq(budgetsTable.userId, userId), eq(budgetsTable.type, 'savings')))
      .get();

    if (!pot) {
      return jsonError(c, 'Savings pot not found', 'NOT_FOUND', 404);
    }

    // Cascade delete transactions from savingsTransactionsTable
    await db.delete(savingsTransactionsTable).where(eq(savingsTransactionsTable.savingsId, id));
    await db.delete(budgetsTable).where(eq(budgetsTable.id, id));

    return jsonOk(c, { message: 'Savings pot deleted successfully' });
  } catch (error: any) {
    console.error('Delete savings error:', error);
    return jsonError(c, error?.message || 'Failed to delete savings pot', 'DELETE_ERROR', 500);
  }
});
