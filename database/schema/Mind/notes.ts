import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../_core/users';

export const notesTable = sqliteTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').default(''),
  tags: text('tags'), // JSON array: ["tag1"]
  isPinned: integer('is_pinned').default(0),
  color: text('color').default('default'),
  isArchived: integer('is_archived').default(0),
  isTrashed: integer('is_trashed').default(0),
  serialNumber: integer('serial_number').default(0),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_notes_user_state').on(table.userId, table.isTrashed, table.isArchived)
]);

export const bookmarksTable = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  faviconUrl: text('favicon_url'),
  category: text('category').default('general'),
  isRead: integer('is_read').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const flashcardsTable = sqliteTable('flashcards', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  front: text('front').notNull(),
  back: text('back').notNull(),
  deckName: text('deck_name').default('General'),
  repetitions: integer('repetitions').default(0),
  interval: integer('interval').default(1), // days
  easeFactor: real('ease_factor').default(2.5),
  nextReviewDate: text('next_review_date').notNull(),
  noteId: text('note_id').references(() => notesTable.id, { onDelete: 'set null' }),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const journalEntriesTable = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  content: text('content').notNull(),
  moodScore: integer('mood_score').default(3), // 1 to 5
  energyScore: integer('energy_score').default(3), // 1 to 5
  domain: text('domain'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export type Note = typeof notesTable.$inferSelect;
export type Bookmark = typeof bookmarksTable.$inferSelect;
export type Flashcard = typeof flashcardsTable.$inferSelect;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;
