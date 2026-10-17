import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../_core/users';

export const budgetsTable = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'budget' | 'savings'
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').default(0),
  period: text('period'), // 'monthly' | 'weekly' | 'yearly' | null
  category: text('category'),
  startDate: text('start_date'),
  deadlineDate: text('deadline_date'),
  isSpecial: integer('is_special').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_budgets_user').on(table.userId)
]);

export const financeTable = sqliteTable('finance', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'income' | 'expense'
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  date: text('date').default(sql`(date('now'))`),
  isSpecial: integer('is_special').default(0), // 1 = capital/high-ticket ledger
  budgetId: text('budget_id').references(() => budgetsTable.id, { onDelete: 'set null' }),
  taskId: text('task_id'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_finance_user_date').on(table.userId, table.date),
  index('idx_finance_user_special').on(table.userId, table.isSpecial)
]);

export const savingsTransactionsTable = sqliteTable('savings_transactions', {
  id: text('id').primaryKey(),
  savingsId: text('savings_id').notNull().references(() => budgetsTable.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'deposit' | 'withdraw'
  amount: real('amount').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_savings_tx').on(table.savingsId)
]);

export const billsTable = sqliteTable('bills', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  category: text('category').default('Subscriptions'),
  recurrencePeriod: text('recurrence_period').default('monthly'), // 'monthly' | 'yearly' | 'weekly'
  dueDate: text('due_date').notNull(),
  autoPay: integer('auto_pay').default(0),
  status: text('status').default('unpaid'), // 'paid' | 'unpaid' | 'overdue'
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const loansTable = sqliteTable('loans', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'given' (lent) | 'taken' (borrowed)
  personName: text('person_name').notNull(),
  contactInfo: text('contact_info'),
  principalAmount: real('principal_amount').notNull(),
  paidAmount: real('paid_amount').default(0),
  interestRate: real('interest_rate').default(0),
  dueDate: text('due_date'),
  status: text('status').default('active'), // 'active' | 'settled' | 'overdue'
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export type FinanceEntry = typeof financeTable.$inferSelect;
export type Budget = typeof budgetsTable.$inferSelect;
export type SavingsTransaction = typeof savingsTransactionsTable.$inferSelect;
export type Bill = typeof billsTable.$inferSelect;
export type Loan = typeof loansTable.$inferSelect;
