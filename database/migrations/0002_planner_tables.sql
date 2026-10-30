-- Vertical 1: Planner Tables Migration
CREATE TABLE IF NOT EXISTS `task_folders` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE cascade,
  `name` text NOT NULL,
  `order_index` integer DEFAULT 0,
  `is_collapsed` integer DEFAULT 0,
  `created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_task_folders_user` ON `task_folders` (`user_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `task_lists` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE cascade,
  `name` text NOT NULL,
  `color` text DEFAULT '#8b5cf6',
  `icon` text DEFAULT 'list',
  `folder_id` text REFERENCES `task_folders`(`id`) ON DELETE set null,
  `is_inbox` integer DEFAULT 0,
  `view_mode` text DEFAULT 'list',
  `order_index` integer DEFAULT 0,
  `is_archived` integer DEFAULT 0,
  `created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_task_lists_user` ON `task_lists` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_task_lists_folder` ON `task_lists` (`folder_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `task_columns` (
  `id` text PRIMARY KEY NOT NULL,
  `list_id` text NOT NULL REFERENCES `task_lists`(`id`) ON DELETE cascade,
  `name` text NOT NULL,
  `order_index` integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_task_columns_list` ON `task_columns` (`list_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `task_subtasks` (
  `id` text PRIMARY KEY NOT NULL,
  `task_id` text NOT NULL REFERENCES `tasks`(`id`) ON DELETE cascade,
  `title` text NOT NULL,
  `is_completed` integer DEFAULT 0,
  `order_index` integer DEFAULT 0,
  `due_date` text,
  `created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_task_subtasks_task` ON `task_subtasks` (`task_id`);
--> statement-breakpoint
ALTER TABLE `tasks` ADD `list_id` text REFERENCES `task_lists`(`id`) ON DELETE set null;
--> statement-breakpoint
ALTER TABLE `tasks` ADD `column_id` text REFERENCES `task_columns`(`id`) ON DELETE set null;
--> statement-breakpoint
ALTER TABLE `tasks` ADD `repeat_from` text DEFAULT 'due_date';
--> statement-breakpoint
ALTER TABLE `tasks` ADD `is_floating` integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `tasks` ADD `progress` integer DEFAULT 0;
