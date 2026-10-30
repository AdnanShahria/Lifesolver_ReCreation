-- LifeSolver Initial Development Database Seed
-- Populates Master User (password: Password123!), default settings, and sample vertical data

-- 1. Master User
INSERT OR IGNORE INTO users (
  id, name, email, password_hash, password_salt, preferences, avatar_url, is_verified, created_at
) VALUES (
  'usr_orbit_master_01',
  'Adnan Shahria',
  'adnan@orbit.dev',
  'e7e8e0e39f6cc18d0091b74e37f84bd51ec92f2f088b8796fcb9ad25bebcfb03',
  '316507852b7a98da430be9d1779fd454',
  '{"theme": "dark"}',
  NULL,
  1,
  datetime('now')
);

-- 2. User Settings
INSERT OR IGNORE INTO settings (
  id, user_id, theme, currency, language, notifications_enabled, monthly_budget, dock_shortcuts, updated_at
) VALUES (
  'set_orbit_master_01',
  'usr_orbit_master_01',
  'dark',
  'BDT',
  'en',
  1,
  35000,
  '["planner", "mind", "finance", "health", "focus"]',
  datetime('now')
);

-- 3. Elite Subscription
INSERT OR IGNORE INTO subscriptions (
  id, user_id, plan_id, status, created_at, updated_at
) VALUES (
  'sub_orbit_master_01',
  'usr_orbit_master_01',
  'elite',
  'active',
  datetime('now'),
  datetime('now')
);

-- 4. Sample Planner Tasks
INSERT OR IGNORE INTO tasks (
  id, user_id, title, description, status, priority, due_date, estimated_duration, actual_duration, created_at
) VALUES 
('tsk_sample_01', 'usr_orbit_master_01', 'Architect Cloudflare D1 Relational Engine', 'Verify all 32 tables with foreign keys and compound indexes', 'done', 'high', date('now'), 90, 90, datetime('now')),
('tsk_sample_02', 'usr_orbit_master_01', 'Build Cyber-Violet Authentication System', 'Web Crypto PBKDF2 with 100,000 iterations & HMAC-SHA256 JWTs', 'done', 'high', date('now'), 120, 120, datetime('now')),
('tsk_sample_03', 'usr_orbit_master_01', 'Connect Planner Kanban & Time Blocking', 'Hierarchical subtasks with drag-and-drop orchestration', 'in-progress', 'medium', date('now', '+1 day'), 60, 15, datetime('now'));

-- 5. Sample Habits
INSERT OR IGNORE INTO habits (
  id, user_id, habit_name, frequency, streak_count, best_streak, created_at
) VALUES
('hbt_sample_01', 'usr_orbit_master_01', 'Morning Deep Work Session (90m)', 'daily', 12, 18, datetime('now')),
('hbt_sample_02', 'usr_orbit_master_01', 'Cardio & Strength Training', 'daily', 5, 21, datetime('now')),
('hbt_sample_03', 'usr_orbit_master_01', 'Hydration Goal (3.5L)', 'daily', 14, 14, datetime('now'));

-- 6. Sample Finance Ledger Entries
INSERT OR IGNORE INTO finance (
  id, user_id, type, amount, category, description, date, is_special, created_at
) VALUES
('fin_sample_01', 'usr_orbit_master_01', 'income', 150000, 'Salary', 'Executive monthly allocation', date('now'), 0, datetime('now')),
('fin_sample_02', 'usr_orbit_master_01', 'expense', 1850, 'Cloud Infrastructure', 'Cloudflare Workers & D1 Edge subscription', date('now'), 0, datetime('now')),
('fin_sample_03', 'usr_orbit_master_01', 'expense', 4500, 'Health & Nutrition', 'Organic protein and recovery supplies', date('now'), 0, datetime('now'));
