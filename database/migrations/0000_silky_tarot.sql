CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`preferences` text DEFAULT '{}',
	`avatar_url` text,
	`is_verified` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`theme` text DEFAULT 'dark',
	`currency` text DEFAULT 'BDT',
	`language` text DEFAULT 'en',
	`notifications_enabled` integer DEFAULT 1,
	`monthly_budget` real DEFAULT 0,
	`dock_shortcuts` text DEFAULT '["planner","mind","finance","health"]',
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_user_id_unique` ON `settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `otps` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`otp_code` text NOT NULL,
	`purpose` text NOT NULL,
	`expires_at` text NOT NULL,
	`attempts` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `idx_otps_email_purpose` ON `otps` (`email`,`purpose`);--> statement-breakpoint
CREATE TABLE `billing_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`from_plan` text,
	`to_plan` text,
	`amount` real DEFAULT 0,
	`stripe_event_id` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`discount_pct` integer NOT NULL,
	`applies_to` text DEFAULT 'all',
	`max_uses` integer,
	`used_count` integer DEFAULT 0,
	`is_active` integer DEFAULT 1,
	`expires_at` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promo_codes_code_unique` ON `promo_codes` (`code`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text DEFAULT 'free' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`stripe_customer_id` text,
	`stripe_sub_id` text,
	`current_period_start` text,
	`current_period_end` text,
	`cancel_at_period_end` integer DEFAULT 0,
	`grace_period_end` text,
	`admin_override_plan` text,
	`admin_override_by` text,
	`admin_override_note` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_user_id_unique` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_subscriptions_user` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_subscriptions_status` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`date` text NOT NULL,
	`color` text DEFAULT 'violet',
	`task_id` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'general',
	`target_date` text,
	`progress_pct` integer DEFAULT 0,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `task_time_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`duration_seconds` integer,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_time_logs_task` ON `task_time_logs` (`task_id`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`due_date` text,
	`start_time` text,
	`end_time` text,
	`estimated_duration` integer,
	`actual_duration` integer,
	`context_type` text DEFAULT 'general',
	`context_id` text,
	`budget_id` text,
	`expected_cost` real,
	`finance_type` text,
	`parent_task_id` text,
	`order_index` integer DEFAULT 0,
	`labels` text,
	`reminder_time` text,
	`recurrence_rule` text,
	`is_pinned` integer DEFAULT 0,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_user_status` ON `tasks` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_user_due` ON `tasks` (`user_id`,`due_date`);--> statement-breakpoint
CREATE INDEX `idx_tasks_context` ON `tasks` (`context_type`,`context_id`);--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`favicon_url` text,
	`category` text DEFAULT 'general',
	`is_read` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`deck_name` text DEFAULT 'General',
	`repetitions` integer DEFAULT 0,
	`interval` integer DEFAULT 1,
	`ease_factor` real DEFAULT 2.5,
	`next_review_date` text NOT NULL,
	`note_id` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prompt` text NOT NULL,
	`content` text NOT NULL,
	`mood_score` integer DEFAULT 3,
	`energy_score` integer DEFAULT 3,
	`domain` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '',
	`tags` text,
	`is_pinned` integer DEFAULT 0,
	`color` text DEFAULT 'default',
	`is_archived` integer DEFAULT 0,
	`is_trashed` integer DEFAULT 0,
	`serial_number` integer DEFAULT 0,
	`updated_at` text DEFAULT (datetime('now')),
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notes_user_state` ON `notes` (`user_id`,`is_trashed`,`is_archived`);--> statement-breakpoint
CREATE TABLE `bills` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`category` text DEFAULT 'Subscriptions',
	`recurrence_period` text DEFAULT 'monthly',
	`due_date` text NOT NULL,
	`auto_pay` integer DEFAULT 0,
	`status` text DEFAULT 'unpaid',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`target_amount` real NOT NULL,
	`current_amount` real DEFAULT 0,
	`period` text,
	`category` text,
	`start_date` text,
	`deadline_date` text,
	`is_special` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_budgets_user` ON `budgets` (`user_id`);--> statement-breakpoint
CREATE TABLE `finance` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`date` text DEFAULT (date('now')),
	`is_special` integer DEFAULT 0,
	`budget_id` text,
	`task_id` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_finance_user_date` ON `finance` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_finance_user_special` ON `finance` (`user_id`,`is_special`);--> statement-breakpoint
CREATE TABLE `loans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`person_name` text NOT NULL,
	`contact_info` text,
	`principal_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0,
	`interest_rate` real DEFAULT 0,
	`due_date` text,
	`status` text DEFAULT 'active',
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `savings_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`savings_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`savings_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_savings_tx` ON `savings_transactions` (`savings_id`);--> statement-breakpoint
CREATE TABLE `gym_routines` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`exercises_json` text DEFAULT '[]',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `habit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`user_id` text NOT NULL,
	`completed_date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_habit_logs_user_date` ON `habit_logs` (`user_id`,`completed_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_habit_logs_date` ON `habit_logs` (`habit_id`,`completed_date`);--> statement-breakpoint
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`habit_name` text NOT NULL,
	`streak_count` integer DEFAULT 0,
	`best_streak` integer DEFAULT 0,
	`last_completed_date` text,
	`frequency` text DEFAULT 'daily',
	`target_days` text,
	`category` text DEFAULT 'general',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_habits_user` ON `habits` (`user_id`);--> statement-breakpoint
CREATE TABLE `vitals_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`water_liters` real DEFAULT 0,
	`protein_target_hit` integer DEFAULT 0,
	`sleep_hours` real DEFAULT 0,
	`sleep_score` integer DEFAULT 0,
	`readiness_score` integer DEFAULT 3,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_vitals_user_date` ON `vitals_logs` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `extension_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`domain` text NOT NULL,
	`duration_seconds` integer NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_ext_usage_user_date` ON `extension_usage` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `focus_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text DEFAULT 'pomodoro' NOT NULL,
	`duration_minutes` integer NOT NULL,
	`task_id` text,
	`completed` integer DEFAULT 1,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `friction_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`domain` text NOT NULL,
	`event_type` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_name` text NOT NULL,
	`category` text DEFAULT 'Other',
	`quantity` integer DEFAULT 1,
	`cost` real,
	`purchase_date` text,
	`store` text,
	`notes` text,
	`status` text DEFAULT 'active',
	`warranty_expiry` text,
	`finance_entry_id` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`finance_entry_id`) REFERENCES `finance`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_user` ON `inventory` (`user_id`);--> statement-breakpoint
CREATE TABLE `vault_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text DEFAULT 'Identity',
	`r2_key` text NOT NULL,
	`iv_hex` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text DEFAULT 'application/octet-stream',
	`expiry_date` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `warranties` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`inventory_id` text,
	`provider_name` text NOT NULL,
	`expiry_date` text NOT NULL,
	`policy_number` text,
	`document_url` text,
	`notified_30_days` integer DEFAULT 0,
	`notified_7_days` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `commitments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`contact_id` text,
	`description` text NOT NULL,
	`due_date` text,
	`status` text DEFAULT 'pending',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`relationship` text DEFAULT 'Friend',
	`email` text,
	`phone` text,
	`birthday` text,
	`anniversary` text,
	`outreach_cadence_days` integer DEFAULT 30,
	`last_contacted_date` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_contacts_user` ON `contacts` (`user_id`);--> statement-breakpoint
CREATE TABLE `outreach_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`channel` text DEFAULT 'Call',
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
