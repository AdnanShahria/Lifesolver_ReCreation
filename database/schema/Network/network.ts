import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../_core/users';

export const contactsTable = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  relationship: text('relationship').default('Friend'), // 'Friend' | 'Family' | 'Colleague' | 'Mentor'
  email: text('email'),
  phone: text('phone'),
  birthday: text('birthday'), // 'MM-DD' or 'YYYY-MM-DD'
  anniversary: text('anniversary'),
  outreachCadenceDays: integer('outreach_cadence_days').default(30), // reminder every N days
  lastContactedDate: text('last_contacted_date'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_contacts_user').on(table.userId)
]);

export const commitmentsTable = sqliteTable('commitments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  contactId: text('contact_id').references(() => contactsTable.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  dueDate: text('due_date'),
  status: text('status').default('pending'), // 'pending' | 'fulfilled'
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const outreachLogsTable = sqliteTable('outreach_logs', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contactsTable.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  channel: text('channel').default('Call'), // 'Call' | 'Message' | 'In-person' | 'Email'
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export type Contact = typeof contactsTable.$inferSelect;
export type Commitment = typeof commitmentsTable.$inferSelect;
export type OutreachLog = typeof outreachLogsTable.$inferSelect;
