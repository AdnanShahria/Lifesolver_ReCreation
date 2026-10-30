-- Vertical 3: Financial Accounts & Transfers Migration
CREATE TABLE IF NOT EXISTS `financial_accounts` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE cascade,
  `name` text NOT NULL,
  `type` text NOT NULL,
  `subtype` text,
  `currency` text NOT NULL DEFAULT 'USD',
  `current_balance` real NOT NULL DEFAULT 0,
  `initial_balance` real NOT NULL DEFAULT 0,
  `credit_limit` real DEFAULT 0,
  `color` text DEFAULT '#8b5cf6',
  `icon` text DEFAULT 'Wallet',
  `is_active` integer NOT NULL DEFAULT 1,
  `exclude_from_net_worth` integer NOT NULL DEFAULT 0,
  `created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_accounts_user` ON `financial_accounts` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_accounts_user_type` ON `financial_accounts` (`user_id`, `type`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `account_transfers` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE cascade,
  `from_account_id` text NOT NULL REFERENCES `financial_accounts`(`id`) ON DELETE cascade,
  `to_account_id` text NOT NULL REFERENCES `financial_accounts`(`id`) ON DELETE cascade,
  `amount` real NOT NULL,
  `destination_amount` real NOT NULL,
  `exchange_rate` real DEFAULT 1.0,
  `fee_amount` real DEFAULT 0,
  `date` text NOT NULL,
  `notes` text,
  `created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transfers_user` ON `account_transfers` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transfers_from` ON `account_transfers` (`from_account_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_transfers_to` ON `account_transfers` (`to_account_id`);
--> statement-breakpoint
ALTER TABLE `finance` ADD `account_id` text REFERENCES `financial_accounts`(`id`) ON DELETE set null;
--> statement-breakpoint
ALTER TABLE `finance` ADD `transfer_id` text REFERENCES `account_transfers`(`id`) ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE `finance` ADD `payee` text;
--> statement-breakpoint
ALTER TABLE `finance` ADD `receipt_url` text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_finance_user_account` ON `finance` (`user_id`, `account_id`);
