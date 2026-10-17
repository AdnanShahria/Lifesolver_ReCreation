import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from './users';

export const settingsTable = sqliteTable('settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => usersTable.id, { onDelete: 'cascade' }),
  theme: text('theme').default('dark'),
  currency: text('currency').default('BDT'),
  language: text('language').default('en'),
  notificationsEnabled: integer('notifications_enabled').default(1),
  monthlyBudget: real('monthly_budget').default(0),
  dockShortcuts: text('dock_shortcuts').default('["planner","mind","finance","health"]'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
});

export type Setting = typeof settingsTable.$inferSelect;
export type NewSetting = typeof settingsTable.$inferInsert;
