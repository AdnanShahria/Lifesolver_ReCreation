import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { loansTable, financeTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const loansRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

loansRoute.use('*', authMiddleware, subscriptionMiddleware);

const createLoanSchema = z.object({
  type: z.enum(['given', 'taken']),
  personName: z.string().trim().min(1, 'Person name is required'),
  contactInfo: z.string().trim().optional().nullable(),
  principalAmount: z.number().positive('Principal amount must be greater than zero'),
  interestRate: z.number().min(0).optional().default(0),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD').optional().nullable(),
  notes: z.string().trim().optional().nullable()
});

const repayLoanSchema = z.object({
  repaymentAmount: z.number().positive('Repayment amount must be greater than zero'),
  logToLedger: z.boolean().optional().default(false)
});

// ── GET /loans ────────────────────────────────────────────────────
loansRoute.get('/loans', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    const loans = await db
      .select()
      .from(loansTable)
      .where(eq(loansTable.userId, userId))
      .orderBy(desc(loansTable.createdAt));

    let totalReceivable = 0; // Unpaid given loans (money owed to user)
    let totalPayable = 0;    // Unpaid taken loans (money user owes)

    const enhancedLoans = loans.map((loan) => {
      const paidAmount = Number(loan.paidAmount || 0);
      const principalAmount = Number(loan.principalAmount || 0);
      const remainingAmount = Math.max(0, principalAmount - paidAmount);
      const progressPercent = principalAmount > 0
        ? Math.min(100, Math.round((paidAmount / principalAmount) * 100))
        : 0;

      if (loan.status !== 'settled') {
        if (loan.type === 'given') {
          totalReceivable += remainingAmount;
        } else if (loan.type === 'taken') {
          totalPayable += remainingAmount;
        }
      }

      return {
        ...loan,
        paidAmount,
        principalAmount,
        remainingAmount,
        progressPercent
      };
    });

    const netDebt = totalPayable - totalReceivable;

    return jsonOk(c, {
      loans: enhancedLoans,
      summary: {
        totalReceivable,
        totalPayable,
        netDebt,
        totalLoansCount: enhancedLoans.length,
        settledCount: enhancedLoans.filter((l) => l.status === 'settled').length
      }
    });
  } catch (error: any) {
    console.error('Fetch loans error:', error);
    return jsonError(c, error?.message || 'Failed to fetch loans', 'LOANS_ERROR', 500);
  }
});

// ── POST /loans ───────────────────────────────────────────────────
loansRoute.post('/loans', async (c) => {
  try {
    const userId = c.get('userId')!;
    const body = await c.req.json();
    const parsed = createLoanSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid loan data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const id = `loan_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    const newLoan = {
      id,
      userId,
      type: parsed.data.type,
      personName: parsed.data.personName,
      contactInfo: parsed.data.contactInfo || null,
      principalAmount: parsed.data.principalAmount,
      paidAmount: 0,
      interestRate: parsed.data.interestRate ?? 0,
      dueDate: parsed.data.dueDate || null,
      status: 'active',
      notes: parsed.data.notes || null
    };

    await db.insert(loansTable).values(newLoan);

    return jsonOk(c, { loan: newLoan, message: 'Loan created successfully' }, 201);
  } catch (error: any) {
    console.error('Create loan error:', error);
    return jsonError(c, error?.message || 'Failed to create loan', 'LOANS_ERROR', 500);
  }
});

// ── POST /loans/:id/repay ─────────────────────────────────────────
loansRoute.post('/loans/:id/repay', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = repayLoanSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(c, parsed.error.issues[0]?.message || 'Invalid repayment data', 'VALIDATION_ERROR', 400);
    }

    const db = getDb(c.env);
    const loan = await db
      .select()
      .from(loansTable)
      .where(and(eq(loansTable.id, id), eq(loansTable.userId, userId)))
      .get();

    if (!loan) {
      return jsonError(c, 'Loan record not found', 'NOT_FOUND', 404);
    }

    const currentPaid = Number(loan.paidAmount || 0);
    const newPaidAmount = currentPaid + parsed.data.repaymentAmount;
    const newStatus = newPaidAmount >= loan.principalAmount ? 'settled' : loan.status;

    // 1. Update loan paidAmount & status
    await db
      .update(loansTable)
      .set({
        paidAmount: newPaidAmount,
        status: newStatus
      })
      .where(eq(loansTable.id, id));

    // 2. Log to general ledger if requested
    let ledgerTx = null;
    if (parsed.data.logToLedger) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const txId = `fin_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      const isGiven = loan.type === 'given';
      const txType = isGiven ? ('income' as const) : ('expense' as const);
      const desc = isGiven
        ? `Loan Repayment Received from: ${loan.personName}`
        : `Loan Repayment Paid to: ${loan.personName}`;

      ledgerTx = {
        id: txId,
        userId,
        type: txType,
        amount: parsed.data.repaymentAmount,
        category: 'Debt / Loans',
        description: desc,
        date: todayStr,
        isSpecial: 0,
        budgetId: null,
        taskId: null
      };

      await db.insert(financeTable).values(ledgerTx);
    }

    const updatedLoan = await db
      .select()
      .from(loansTable)
      .where(eq(loansTable.id, id))
      .get();

    return jsonOk(c, {
      loan: updatedLoan,
      transaction: ledgerTx,
      message: newStatus === 'settled' ? 'Loan fully settled!' : 'Loan repayment recorded successfully'
    });
  } catch (error: any) {
    console.error('Repay loan error:', error);
    return jsonError(c, error?.message || 'Failed to record loan repayment', 'LOANS_ERROR', 500);
  }
});

// ── DELETE /loans/:id ─────────────────────────────────────────────
loansRoute.delete('/loans/:id', async (c) => {
  try {
    const userId = c.get('userId')!;
    const id = c.req.param('id');
    const db = getDb(c.env);

    const loan = await db
      .select()
      .from(loansTable)
      .where(and(eq(loansTable.id, id), eq(loansTable.userId, userId)))
      .get();

    if (!loan) {
      return jsonError(c, 'Loan record not found', 'NOT_FOUND', 404);
    }

    await db.delete(loansTable).where(eq(loansTable.id, id));

    return jsonOk(c, { message: 'Loan deleted successfully' });
  } catch (error: any) {
    console.error('Delete loan error:', error);
    return jsonError(c, error?.message || 'Failed to delete loan', 'LOANS_ERROR', 500);
  }
});
