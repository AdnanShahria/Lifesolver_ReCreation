import { Hono } from 'hono';
import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../_core/db';
import { financeTable } from '@lifesolver/database';
import { jsonOk, jsonError } from '../_core/response';
import { authMiddleware } from '../_core/auth.middleware';
import { subscriptionMiddleware } from '../_core/subscription.middleware';
import type { Env, AppVariables } from '../types';

export const analyticsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>();

analyticsRoute.use('*', authMiddleware, subscriptionMiddleware);

function getMonthString(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 1));
  return d.toISOString().slice(0, 7); // 'YYYY-MM'
}

function getMonthLabel(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 1));
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// ── GET /analytics ────────────────────────────────────────────────
analyticsRoute.get('/analytics', async (c) => {
  try {
    const userId = c.get('userId')!;
    const db = getDb(c.env);

    const now = new Date();
    const curYear = now.getUTCFullYear();
    const curMonth = now.getUTCMonth();

    const currentMonthStr = getMonthString(curYear, curMonth);
    const prevMonthStr = getMonthString(curYear, curMonth - 1);
    const sixMonthsAgoStr = getMonthString(curYear, curMonth - 5);

    // 1. Group expenses by category for current month
    const currentMonthExpenseRows = await db
      .select({
        category: financeTable.category,
        total: sql<number>`SUM(${financeTable.amount})`
      })
      .from(financeTable)
      .where(
        and(
          eq(financeTable.userId, userId),
          eq(financeTable.type, 'expense'),
          sql`${financeTable.date} LIKE ${currentMonthStr + '%'}`
        )
      )
      .groupBy(financeTable.category);

    // 2. Group expenses by category for previous month
    const prevMonthExpenseRows = await db
      .select({
        category: financeTable.category,
        total: sql<number>`SUM(${financeTable.amount})`
      })
      .from(financeTable)
      .where(
        and(
          eq(financeTable.userId, userId),
          eq(financeTable.type, 'expense'),
          sql`${financeTable.date} LIKE ${prevMonthStr + '%'}`
        )
      )
      .groupBy(financeTable.category);

    // 3. Current & Previous month incomes
    const currentMonthIncomeRow = await db
      .select({ total: sql<number>`SUM(${financeTable.amount})` })
      .from(financeTable)
      .where(
        and(
          eq(financeTable.userId, userId),
          eq(financeTable.type, 'income'),
          sql`${financeTable.date} LIKE ${currentMonthStr + '%'}`
        )
      )
      .get();

    const prevMonthIncomeRow = await db
      .select({ total: sql<number>`SUM(${financeTable.amount})` })
      .from(financeTable)
      .where(
        and(
          eq(financeTable.userId, userId),
          eq(financeTable.type, 'income'),
          sql`${financeTable.date} LIKE ${prevMonthStr + '%'}`
        )
      )
      .get();

    const currentIncome = Number(currentMonthIncomeRow?.total || 0);
    const prevIncome = Number(prevMonthIncomeRow?.total || 0);

    const currentExpense = currentMonthExpenseRows.reduce((sum, r) => sum + Number(r.total || 0), 0);
    const prevExpense = prevMonthExpenseRows.reduce((sum, r) => sum + Number(r.total || 0), 0);

    const currentNet = currentIncome - currentExpense;
    const prevNet = prevIncome - prevExpense;

    const expenseMoMPercent = prevExpense > 0
      ? Math.round(((currentExpense - prevExpense) / prevExpense) * 100)
      : (currentExpense > 0 ? 100 : 0);

    const incomeMoMPercent = prevIncome > 0
      ? Math.round(((currentIncome - prevIncome) / prevIncome) * 100)
      : (currentIncome > 0 ? 100 : 0);

    const netSavingsRate = currentIncome > 0
      ? Math.round(((currentIncome - currentExpense) / currentIncome) * 100)
      : 0;

    // 4. Combined Category Breakdown
    const prevMap = new Map<string, number>();
    for (const r of prevMonthExpenseRows) {
      prevMap.set(r.category, Number(r.total || 0));
    }

    const categoryBreakdown = currentMonthExpenseRows.map((r) => {
      const amount = Number(r.total || 0);
      const prevAmount = prevMap.get(r.category) || 0;
      const diff = amount - prevAmount;
      const changePercent = prevAmount > 0
        ? Math.round((diff / prevAmount) * 100)
        : (amount > 0 ? 100 : 0);
      const percentageOfTotal = currentExpense > 0
        ? Math.round((amount / currentExpense) * 100)
        : 0;

      return {
        category: r.category,
        currentAmount: amount,
        previousAmount: prevAmount,
        diff,
        changePercent,
        percentageOfTotal
      };
    }).sort((a, b) => b.currentAmount - a.currentAmount);

    for (const [cat, prevAmt] of prevMap.entries()) {
      if (!currentMonthExpenseRows.some((r) => r.category === cat)) {
        categoryBreakdown.push({
          category: cat,
          currentAmount: 0,
          previousAmount: prevAmt,
          diff: -prevAmt,
          changePercent: -100,
          percentageOfTotal: 0
        });
      }
    }

    // 5. 6-Month Cashflow History
    const sixMonthHistoryRows = await db
      .select({
        month: sql<string>`SUBSTR(${financeTable.date}, 1, 7)`,
        type: financeTable.type,
        total: sql<number>`SUM(${financeTable.amount})`
      })
      .from(financeTable)
      .where(
        and(
          eq(financeTable.userId, userId),
          sql`SUBSTR(${financeTable.date}, 1, 7) >= ${sixMonthsAgoStr}`
        )
      )
      .groupBy(sql`SUBSTR(${financeTable.date}, 1, 7)`, financeTable.type);

    const cashflowHistory = [];
    for (let i = 5; i >= 0; i--) {
      const monthKey = getMonthString(curYear, curMonth - i);
      const monthLabel = getMonthLabel(curYear, curMonth - i);

      const incRow = sixMonthHistoryRows.find((r) => r.month === monthKey && r.type === 'income');
      const expRow = sixMonthHistoryRows.find((r) => r.month === monthKey && r.type === 'expense');

      const inc = Number(incRow?.total || 0);
      const exp = Number(expRow?.total || 0);
      const net = inc - exp;
      const savingsRate = inc > 0 ? Math.round((net / inc) * 100) : 0;

      cashflowHistory.push({
        month: monthKey,
        label: monthLabel,
        income: inc,
        expense: exp,
        net,
        savingsRate
      });
    }

    return jsonOk(c, {
      monthOverMonth: {
        currentMonth: currentMonthStr,
        previousMonth: prevMonthStr,
        currentIncome,
        previousIncome: prevIncome,
        incomeMoMPercent,
        currentExpense,
        previousExpense: prevExpense,
        expenseMoMPercent,
        currentNet,
        previousNet: prevNet,
        netSavingsRate
      },
      categoryBreakdown,
      cashflowHistory,
      topSpendingCategory: categoryBreakdown.length > 0 ? categoryBreakdown[0] : null
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return jsonError(c, error?.message || 'Failed to fetch financial analytics', 'ANALYTICS_ERROR', 500);
  }
});
