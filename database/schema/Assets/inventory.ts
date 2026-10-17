import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../_core/users';
import { financeTable } from '../Finance/finance';

export const inventoryTable = sqliteTable('inventory', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(),
  category: text('category').default('Other'),
  quantity: integer('quantity').default(1),
  cost: real('cost'),
  purchaseDate: text('purchase_date'),
  store: text('store'),
  notes: text('notes'),
  status: text('status').default('active'), // 'active' | 'maintenance' | 'sold' | 'discarded'
  warrantyExpiry: text('warranty_expiry'),
  financeEntryId: text('finance_entry_id').references(() => financeTable.id, { onDelete: 'set null' }),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_inventory_user').on(table.userId)
]);

export const warrantiesTable = sqliteTable('warranties', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  inventoryId: text('inventory_id').references(() => inventoryTable.id, { onDelete: 'cascade' }),
  providerName: text('provider_name').notNull(),
  expiryDate: text('expiry_date').notNull(),
  policyNumber: text('policy_number'),
  documentUrl: text('document_url'),
  notified30Days: integer('notified_30_days').default(0),
  notified7Days: integer('notified_7_days').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const vaultDocumentsTable = sqliteTable('vault_documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category').default('Identity'), // 'Identity' | 'Legal' | 'Financial' | 'Health'
  r2Key: text('r2_key').notNull(),
  ivHex: text('iv_hex').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').default('application/octet-stream'),
  expiryDate: text('expiry_date'), // stored unencrypted for renewal reminders
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export type InventoryItem = typeof inventoryTable.$inferSelect;
export type Warranty = typeof warrantiesTable.$inferSelect;
export type VaultDocument = typeof vaultDocumentsTable.$inferSelect;
