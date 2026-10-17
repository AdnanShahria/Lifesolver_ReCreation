import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  preferences: text('preferences').default('{}'),
  avatarUrl: text('avatar_url'),
  isVerified: integer('is_verified').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_users_email').on(table.email)
]);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
