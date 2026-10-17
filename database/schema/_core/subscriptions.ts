import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from './users';

export const subscriptionsTable = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => usersTable.id, { onDelete: 'cascade' }),
  planId: text('plan_id').default('free').notNull(), // 'free' | 'pro' | 'elite'
  status: text('status').default('active').notNull(), // 'active' | 'past_due' | 'canceled' | 'trialing'
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubId: text('stripe_sub_id'),
  currentPeriodStart: text('current_period_start'),
  currentPeriodEnd: text('current_period_end'),
  cancelAtPeriodEnd: integer('cancel_at_period_end').default(0),
  gracePeriodEnd: text('grace_period_end'),
  adminOverridePlan: text('admin_override_plan'), // 'free' | 'pro' | 'elite' | null
  adminOverrideBy: text('admin_override_by'),
  adminOverrideNote: text('admin_override_note'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_subscriptions_user').on(table.userId),
  index('idx_subscriptions_status').on(table.status)
]);

export const promoCodesTable = sqliteTable('promo_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountPct: integer('discount_pct').notNull(),
  appliesTo: text('applies_to').default('all'),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0),
  isActive: integer('is_active').default(1),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const billingEventsTable = sqliteTable('billing_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  fromPlan: text('from_plan'),
  toPlan: text('to_plan'),
  amount: real('amount').default(0),
  stripeEventId: text('stripe_event_id'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type PromoCode = typeof promoCodesTable.$inferSelect;
export type BillingEvent = typeof billingEventsTable.$inferSelect;
