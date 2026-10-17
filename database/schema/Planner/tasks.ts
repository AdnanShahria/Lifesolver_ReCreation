import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../_core/users';

export const tasksTable = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('todo').notNull(), // 'todo' | 'in-progress' | 'done'
  priority: text('priority').default('medium').notNull(), // 'low' | 'medium' | 'high' | 'urgent'
  dueDate: text('due_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  estimatedDuration: integer('estimated_duration'), // minutes
  actualDuration: integer('actual_duration'),
  contextType: text('context_type').default('general'),
  contextId: text('context_id'),
  budgetId: text('budget_id'),
  expectedCost: real('expected_cost'),
  financeType: text('finance_type'), // 'income' | 'expense' | null
  parentTaskId: text('parent_task_id'),
  orderIndex: integer('order_index').default(0),
  labels: text('labels'), // JSON array: ["tag1"]
  reminderTime: text('reminder_time'),
  recurrenceRule: text('recurrence_rule'),
  isPinned: integer('is_pinned').default(0),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_tasks_user_status').on(table.userId, table.status),
  index('idx_tasks_user_due').on(table.userId, table.dueDate),
  index('idx_tasks_context').on(table.contextType, table.contextId)
]);

export const taskTimeLogsTable = sqliteTable('task_time_logs', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasksTable.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  durationSeconds: integer('duration_seconds'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_time_logs_task').on(table.taskId)
]);

export const goalsTable = sqliteTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').default('general'),
  targetDate: text('target_date'),
  progressPct: integer('progress_pct').default(0),
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const calendarEventsTable = sqliteTable('calendar_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  date: text('date').notNull(),
  color: text('color').default('violet'),
  taskId: text('task_id'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;
export type TaskTimeLog = typeof taskTimeLogsTable.$inferSelect;
export type Goal = typeof goalsTable.$inferSelect;
export type CalendarEvent = typeof calendarEventsTable.$inferSelect;
