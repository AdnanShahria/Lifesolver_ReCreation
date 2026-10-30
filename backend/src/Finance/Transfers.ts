import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, sql, desc, or } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { accountsTable, transfersTable, financeTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const transfersRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

transfersRoute.use('*', authMiddleware, subscriptionMiddleware);

// ── Validation Schemas ──────────────────────────────────────────────
const createTransferSchema = z.object({
  fromAccountId: z.string().trim().min(1, 'Source account is required'),
  toAccountId: z.string().trim().min(1, 'Destination account is required'),
  amount: z.number().positive('Transfer amount must be greater than zero'),
  destinationAmount: z.number().positive('Destination amount must be greater than zero').optional(),
  exchangeRate: z.number().positive('Exchange rate must be greater than zero').optional().default(1.0),
  feeAmount: z.number().min(0, 'Fee cannot be negative').optional().default(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  notes: z.string().trim().optional().nullable()
});

// ── GET /transfers (List recent user transfers) ─────────────────────
transfersRoute.get('/transfers', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
    const accountId = c.req.query('accountId');

    const filters = [eq(transfersTable.userId, userId)];
    if (accountId) {
      filters.push(
        or(
          eq(transfersTable.fromAccountId, accountId),
          eq(transfersTable.toAccountId, accountId)
        )!
      );
    }

    const rows = await db
      .select()
      .from(transfersTable)
      .where(and(...filters))
      .orderBy(desc(transfersTable.date), desc(transfersTable.createdAt))
      .limit(limit);

    // Fetch user accounts to map account names cleanly
    const accounts = await db
      .select({
        id: accountsTable.id,
        name: accountsTable.name,
        currency: accountsTable.currency,
        color: accountsTable.color
      })
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId));

    const accountMap = new Map<string, { name: string; currency: string; color: string | null }>();
    for (const acc of accounts) {
      accountMap.set(acc.id, { name: acc.name, currency: acc.currency, color: acc.color });
    }

    const enhancedTransfers = rows.map((t) => {
      const fromAcc = accountMap.get(t.fromAccountId);
      const toAcc = accountMap.get(t.toAccountId);
      return {
        ...t,
        fromAccountName: fromAcc?.name || 'Unknown Account',
        fromAccountCurrency: fromAcc?.currency || 'USD',
        fromAccountColor: fromAcc?.color || '#8b5cf6',
        toAccountName: toAcc?.name || 'Unknown Account',
        toAccountCurrency: toAcc?.currency || 'USD',
        toAccountColor: toAcc?.color || '#8b5cf6'
      };
    });

    return jsonOk(c, {
      transfers: enhancedTransfers,
      totalTransfers: enhancedTransfers.length
    });
  } catch (error: any) {
    console.error('Fetch transfers error:', error);
    return jsonError(c, error?.message || 'Failed to fetch transfers', 'TRANSFERS_ERROR', 500);
  }
});

// ── POST /transfers (Execute Atomic Inter-Account Transfer) ──────────
transfersRoute.post('/transfers', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createTransferSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid transfer data', 'VALIDATION_ERROR', 400);
    }

    const {
      fromAccountId,
      toAccountId,
      amount,
      destinationAmount: rawDestAmount,
      exchangeRate: rawRate,
      feeAmount: rawFee,
      date: rawDate,
      notes
    } = parsed.data;

    if (fromAccountId === toAccountId) {
      return jsonError(c, 'Source and destination accounts must be different', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);

    // 1. Verify existence and ownership of both accounts
    const [fromAccount, toAccount] = await Promise.all([
      db
        .select()
        .from(accountsTable)
        .where(and(eq(accountsTable.id, fromAccountId), eq(accountsTable.userId, userId)))
        .get(),
      db
        .select()
        .from(accountsTable)
        .where(and(eq(accountsTable.id, toAccountId), eq(accountsTable.userId, userId)))
        .get()
    ]);

    if (!fromAccount) {
      return jsonError(c, 'Source account not found', 'NOT_FOUND', 404);
    }

    if (!toAccount) {
      return jsonError(c, 'Destination account not found', 'NOT_FOUND', 404);
    }

    const exchangeRate = rawRate ?? 1.0;
    const destinationAmount = rawDestAmount ?? Math.round(amount * exchangeRate * 100) / 100;
    const feeAmount = rawFee ?? 0;
    const totalDebit = Math.round((amount + feeAmount) * 100) / 100;
    const transferDate = rawDate || new Date().toISOString().slice(0, 10);
    const transferId = `trf_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    const transferRecord = {
      id: transferId,
      userId,
      fromAccountId,
      toAccountId,
      amount,
      destinationAmount,
      exchangeRate,
      feeAmount,
      date: transferDate,
      notes: notes || null
    };

    // 2. Prepare optional fee expense transaction in financeTable
    let feeTx: typeof financeTable.$inferInsert | null = null;
    if (feeAmount > 0) {
      const feeTxId = `fin_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      feeTx = {
        id: feeTxId,
        userId,
        accountId: fromAccountId,
        transferId: transferId,
        type: 'expense',
        amount: feeAmount,
        category: 'Bank/Transfer Fee',
        description: `Transfer fee: ${fromAccount.name} → ${toAccount.name}`,
        payee: 'Transfer Processing Fee',
        date: transferDate,
        isSpecial: 0,
        budgetId: null
      };
    }

    // 3. Perform atomic batch operations:
    //    a) Debit source account by (amount + feeAmount)
    //    b) Credit destination account by destinationAmount
    //    c) Insert into transfersTable
    //    d) Insert fee transaction into financeTable (if feeAmount > 0)
    const batchOperations: [any, ...any[]] = [
      db
        .update(accountsTable)
        .set({
          currentBalance: sql`${accountsTable.currentBalance} - ${totalDebit}`
        })
        .where(eq(accountsTable.id, fromAccountId)),
      db
        .update(accountsTable)
        .set({
          currentBalance: sql`${accountsTable.currentBalance} + ${destinationAmount}`
        })
        .where(eq(accountsTable.id, toAccountId)),
      db.insert(transfersTable).values(transferRecord)
    ];

    if (feeTx) {
      batchOperations.push(db.insert(financeTable).values(feeTx));
    }

    await db.batch(batchOperations);

    // 4. Fetch updated balances to return to client
    const [updatedFrom, updatedTo] = await Promise.all([
      db.select().from(accountsTable).where(eq(accountsTable.id, fromAccountId)).get(),
      db.select().from(accountsTable).where(eq(accountsTable.id, toAccountId)).get()
    ]);

    return jsonOk(
      c,
      {
        transfer: {
          ...transferRecord,
          fromAccountName: fromAccount.name,
          toAccountName: toAccount.name
        },
        fromAccount: updatedFrom,
        toAccount: updatedTo,
        feeTransaction: feeTx,
        message: 'Transfer completed successfully'
      },
      201
    );
  } catch (error: any) {
    console.error('Create transfer error:', error);
    return jsonError(c, error?.message || 'Failed to complete transfer', 'TRANSFER_ERROR', 500);
  }
});

// ── DELETE /transfers/:id (Revert Transfer atomically) ───────────────
transfersRoute.delete('/transfers/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const transfer = await db
      .select()
      .from(transfersTable)
      .where(and(eq(transfersTable.id, id), eq(transfersTable.userId, userId)))
      .get();

    if (!transfer) {
      return jsonError(c, 'Transfer not found', 'NOT_FOUND', 404);
    }

    const totalDebit = (transfer.amount || 0) + (transfer.feeAmount || 0);
    const destCredit = transfer.destinationAmount || 0;

    // Atomic reversal batch:
    // a) Credit source account by totalDebit
    // b) Debit destination account by destCredit
    // c) Delete associated fee transactions in financeTable
    // d) Delete transfer record
    const batchOperations: [any, ...any[]] = [
      db
        .update(accountsTable)
        .set({
          currentBalance: sql`${accountsTable.currentBalance} + ${totalDebit}`
        })
        .where(eq(accountsTable.id, transfer.fromAccountId)),
      db
        .update(accountsTable)
        .set({
          currentBalance: sql`${accountsTable.currentBalance} - ${destCredit}`
        })
        .where(eq(accountsTable.id, transfer.toAccountId)),
      db
        .delete(financeTable)
        .where(and(eq(financeTable.transferId, id), eq(financeTable.userId, userId))),
      db.delete(transfersTable).where(eq(transfersTable.id, id))
    ];

    await db.batch(batchOperations);

    return jsonOk(c, { message: 'Transfer reversed and deleted successfully' });
  } catch (error: any) {
    console.error('Delete transfer error:', error);
    return jsonError(c, error?.message || 'Failed to reverse transfer', 'DELETE_TRANSFER_ERROR', 500);
  }
});
