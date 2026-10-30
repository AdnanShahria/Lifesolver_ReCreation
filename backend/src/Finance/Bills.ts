import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { billsTable, financeTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const billsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

billsRoute.use('*', authMiddleware, subscriptionMiddleware);

const createBillSchema = z.object({
  name: z.string().trim().min(1, 'Bill name is required'),
  amount: z.number().positive('Bill amount must be greater than zero'),
  category: z.string().trim().optional().default('Subscriptions'),
  recurrencePeriod: z.enum(['monthly', 'yearly', 'weekly']).optional().default('monthly'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  autoPay: z.union([z.boolean(), z.number().int().min(0).max(1)]).optional().default(0)
});

const updateBillSchema = z.object({
  name: z.string().trim().min(1).optional(),
  amount: z.number().positive().optional(),
  category: z.string().trim().optional(),
  recurrencePeriod: z.enum(['monthly', 'yearly', 'weekly']).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD').optional(),
  autoPay: z.union([z.boolean(), z.number().int().min(0).max(1)]).optional(),
  status: z.enum(['paid', 'unpaid', 'overdue']).optional()
});

// ── GET /bills ────────────────────────────────────────────────────
billsRoute.get('/bills', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    const bills = await db
      .select()
      .from(billsTable)
      .where(eq(billsTable.userId, userId))
      .orderBy(desc(billsTable.dueDate));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enhancedBills = bills.map((bill) => {
      const due = new Date(bill.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isOverdue = bill.status !== 'paid' && daysRemaining < 0;
      const computedStatus = isOverdue ? 'overdue' : (bill.status || 'unpaid');

      return {
        ...bill,
        daysRemaining,
        isOverdue,
        computedStatus
      };
    });

    const totalBills = enhancedBills.length;
    const totalAmount = enhancedBills.reduce((acc, b) => acc + Number(b.amount || 0), 0);
    const paidAmount = enhancedBills
      .filter((b) => b.status === 'paid')
      .reduce((acc, b) => acc + Number(b.amount || 0), 0);
    const unpaidAmount = enhancedBills
      .filter((b) => b.status !== 'paid')
      .reduce((acc, b) => acc + Number(b.amount || 0), 0);
    const overdueCount = enhancedBills.filter((b) => b.isOverdue).length;

    return jsonOk(c, {
      bills: enhancedBills,
      summary: {
        totalBills,
        totalAmount,
        paidAmount,
        unpaidAmount,
        overdueCount
      }
    });
  } catch (error: any) {
    console.error('Fetch bills error:', error);
    return jsonError(c, error?.message || 'Failed to fetch bills', 'BILLS_ERROR', 500);
  }
});

// ── POST /bills ───────────────────────────────────────────────────
billsRoute.post('/bills', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createBillSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid bill data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const id = `bil_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const autoPayVal = typeof parsed.data.autoPay === 'boolean'
      ? (parsed.data.autoPay ? 1 : 0)
      : parsed.data.autoPay;

    const newBill = {
      id,
      userId,
      name: parsed.data.name,
      amount: parsed.data.amount,
      category: parsed.data.category || 'Subscriptions',
      recurrencePeriod: parsed.data.recurrencePeriod || 'monthly',
      dueDate: parsed.data.dueDate,
      autoPay: autoPayVal,
      status: 'unpaid'
    };

    await db.insert(billsTable).values(newBill);

    return jsonOk(c, { bill: newBill, message: 'Bill created successfully' }, 201);
  } catch (error: any) {
    console.error('Create bill error:', error);
    return jsonError(c, error?.message || 'Failed to create bill', 'BILLS_ERROR', 500);
  }
});

// ── POST /bills/:id/pay ───────────────────────────────────────────
billsRoute.post('/bills/:id/pay', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const bill = await db
      .select()
      .from(billsTable)
      .where(and(eq(billsTable.id, id), eq(billsTable.userId, userId)))
      .get();

    if (!bill) {
      return jsonError(c, 'Bill not found', 'NOT_FOUND', 404);
    }

    // 1. Mark bill status = 'paid'
    await db
      .update(billsTable)
      .set({ status: 'paid' })
      .where(eq(billsTable.id, id));

    // 2. Automatically insert an expense record into financeTable
    const todayStr = new Date().toISOString().slice(0, 10);
    const txId = `fin_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const newTx = {
      id: txId,
      userId,
      type: 'expense' as const,
      amount: bill.amount,
      category: bill.category || 'Bills',
      description: `Bill Payment: ${bill.name}`,
      date: todayStr,
      isSpecial: 0,
      budgetId: null,
      taskId: null
    };

    await db.insert(financeTable).values(newTx);

    const updatedBill = await db
      .select()
      .from(billsTable)
      .where(eq(billsTable.id, id))
      .get();

    return jsonOk(c, {
      bill: updatedBill,
      transaction: newTx,
      message: 'Bill marked as paid and logged to ledger'
    });
  } catch (error: any) {
    console.error('Pay bill error:', error);
    return jsonError(c, error?.message || 'Failed to record bill payment', 'BILLS_ERROR', 500);
  }
});

// ── PUT /bills/:id ────────────────────────────────────────────────
billsRoute.put('/bills/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateBillSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid bill updates', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const bill = await db
      .select()
      .from(billsTable)
      .where(and(eq(billsTable.id, id), eq(billsTable.userId, userId)))
      .get();

    if (!bill) {
      return jsonError(c, 'Bill not found', 'NOT_FOUND', 404);
    }

    const updates: Partial<typeof billsTable.$inferInsert> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.amount !== undefined) updates.amount = parsed.data.amount;
    if (parsed.data.category !== undefined) updates.category = parsed.data.category;
    if (parsed.data.recurrencePeriod !== undefined) updates.recurrencePeriod = parsed.data.recurrencePeriod;
    if (parsed.data.dueDate !== undefined) updates.dueDate = parsed.data.dueDate;
    if (parsed.data.autoPay !== undefined) {
      updates.autoPay = typeof parsed.data.autoPay === 'boolean'
        ? (parsed.data.autoPay ? 1 : 0)
        : parsed.data.autoPay;
    }
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;

    await db.update(billsTable).set(updates).where(eq(billsTable.id, id));

    const updatedBill = await db
      .select()
      .from(billsTable)
      .where(eq(billsTable.id, id))
      .get();

    return jsonOk(c, { bill: updatedBill, message: 'Bill updated successfully' });
  } catch (error: any) {
    console.error('Update bill error:', error);
    return jsonError(c, error?.message || 'Failed to update bill', 'BILLS_ERROR', 500);
  }
});

// ── DELETE /bills/:id ─────────────────────────────────────────────
billsRoute.delete('/bills/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const bill = await db
      .select()
      .from(billsTable)
      .where(and(eq(billsTable.id, id), eq(billsTable.userId, userId)))
      .get();

    if (!bill) {
      return jsonError(c, 'Bill not found', 'NOT_FOUND', 404);
    }

    await db.delete(billsTable).where(eq(billsTable.id, id));

    return jsonOk(c, { message: 'Bill deleted successfully' });
  } catch (error: any) {
    console.error('Delete bill error:', error);
    return jsonError(c, error?.message || 'Failed to delete bill', 'BILLS_ERROR', 500);
  }
});
