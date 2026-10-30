import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../_core/users';

// ── 1. Task Folders ─────────────────────────────────
export const taskFoldersTable = sqliteTable('task_folders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').default(0),
  isCollapsed: integer('is_collapsed').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_task_folders_user').on(table.userId)
]);

// ── 2. Task Lists ───────────────────────────────────
export const taskListsTable = sqliteTable('task_lists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').default('#8b5cf6'),
  icon: text('icon').default('list'),
  folderId: text('folder_id').references(() => taskFoldersTable.id, { onDelete: 'set null' }),
  isInbox: integer('is_inbox').default(0),
  viewMode: text('view_mode').default('list'), // 'list' | 'kanban' | 'matrix' | 'calendar'
  orderIndex: integer('order_index').default(0),
  isArchived: integer('is_archived').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_task_lists_user').on(table.userId),
  index('idx_task_lists_folder').on(table.folderId)
]);

// ── 3. Task Columns ─────────────────────────────────
export const taskColumnsTable = sqliteTable('task_columns', {
  id: text('id').primaryKey(),
  listId: text('list_id').notNull().references(() => taskListsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  orderIndex: integer('order_index').default(0)
}, (table) => [
  index('idx_task_columns_list').on(table.listId)
]);

// ── 4. Tasks ────────────────────────────────────────
export const tasksTable = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  listId: text('list_id').references(() => taskListsTable.id, { onDelete: 'set null' }),
  columnId: text('column_id').references(() => taskColumnsTable.id, { onDelete: 'set null' }),
  parentTaskId: text('parent_task_id'),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('todo').notNull(), // 'todo' | 'in_progress' | 'done'
  priority: text('priority').default('medium').notNull(), // 'urgent' | 'high' | 'medium' | 'low'
  dueDate: text('due_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  estimatedDuration: integer('estimated_duration'), // minutes
  actualDuration: integer('actual_duration'), // minutes
  recurrenceRule: text('recurrence_rule'),
  repeatFrom: text('repeat_from').default('due_date'), // 'due_date' | 'completion_date'
  reminderTime: text('reminder_time'),
  isPinned: integer('is_pinned').default(0),
  isFloating: integer('is_floating').default(0),
  progress: integer('progress').default(0), // 0 to 100
  labels: text('labels'), // JSON array: ["tag1", "tag2"]
  budgetId: text('budget_id'),
  expectedCost: real('expected_cost'),
  financeType: text('finance_type'), // 'income' | 'expense' | null
  orderIndex: integer('order_index').default(0),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  // Preserving context fields
  contextType: text('context_type').default('general'),
  contextId: text('context_id')
}, (table) => [
  index('idx_tasks_user_status').on(table.userId, table.status),
  index('idx_tasks_user_due').on(table.userId, table.dueDate),
  index('idx_tasks_list').on(table.listId),
  index('idx_tasks_column').on(table.columnId),
  index('idx_tasks_parent').on(table.parentTaskId)
]);

// ── 5. Task Subtasks ────────────────────────────────
export const taskSubtasksTable = sqliteTable('task_subtasks', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasksTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  isCompleted: integer('is_completed').default(0),
  orderIndex: integer('order_index').default(0),
  dueDate: text('due_date'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_subtasks_task').on(table.taskId)
]);

// ── 6. Task Time Logs (Preserved) ───────────────────
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

// ── 7. Goals (Preserved) ────────────────────────────
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

// ── 8. Calendar Events (Preserved) ──────────────────
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

// ── Types ───────────────────────────────────────────
export type TaskFolder = typeof taskFoldersTable.$inferSelect;
export type NewTaskFolder = typeof taskFoldersTable.$inferInsert;

export type TaskList = typeof taskListsTable.$inferSelect;
export type NewTaskList = typeof taskListsTable.$inferInsert;

export type TaskColumn = typeof taskColumnsTable.$inferSelect;
export type NewTaskColumn = typeof taskColumnsTable.$inferInsert;

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;

export type TaskSubtask = typeof taskSubtasksTable.$inferSelect;
export type NewTaskSubtask = typeof taskSubtasksTable.$inferInsert;

export type TaskTimeLog = typeof taskTimeLogsTable.$inferSelect;
export type NewTaskTimeLog = typeof taskTimeLogsTable.$inferInsert;

export type Goal = typeof goalsTable.$inferSelect;
export type NewGoal = typeof goalsTable.$inferInsert;

export type CalendarEvent = typeof calendarEventsTable.$inferSelect;
export type NewCalendarEvent = typeof calendarEventsTable.$inferInsert;
