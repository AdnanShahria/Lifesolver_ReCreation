import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../_core/users';

export const focusSessionsTable = sqliteTable('focus_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  type: text('type').default('pomodoro').notNull(), // 'pomodoro' | 'deep_work'
  durationMinutes: integer('duration_minutes').notNull(),
  taskId: text('task_id'),
  completed: integer('completed').default(1),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const extensionUsageTable = sqliteTable('extension_usage', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  date: text('date').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_ext_usage_user_date').on(table.userId, table.date)
]);

export const frictionEventsTable = sqliteTable('friction_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  eventType: text('event_type').notNull(), // 'blocked_attempt' | 'detox_pass' | 'cooling_period'
  metadata: text('metadata'), // JSON
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export type FocusSession = typeof focusSessionsTable.$inferSelect;
export type ExtensionUsage = typeof extensionUsageTable.$inferSelect;
export type FrictionEvent = typeof frictionEventsTable.$inferSelect;
