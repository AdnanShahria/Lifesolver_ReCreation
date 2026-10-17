import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const otpsTable = sqliteTable('otps', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  otpCode: text('otp_code').notNull(),
  purpose: text('purpose').notNull(), // 'verification' | 'reset_password' | 'detox'
  expiresAt: text('expires_at').notNull(),
  attempts: integer('attempts').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_otps_email_purpose').on(table.email, table.purpose)
]);

export type Otp = typeof otpsTable.$inferSelect;
export type NewOtp = typeof otpsTable.$inferInsert;
