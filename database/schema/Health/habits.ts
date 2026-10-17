import { sqliteTable, text, integer, real, index, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../_core/users';

export const habitsTable = sqliteTable('habits', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  habitName: text('habit_name').notNull(),
  streakCount: integer('streak_count').default(0),
  bestStreak: integer('best_streak').default(0),
  lastCompletedDate: text('last_completed_date'),
  frequency: text('frequency').default('daily'),
  targetDays: text('target_days'), // JSON array: [1,3,5]
  category: text('category').default('general'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_habits_user').on(table.userId)
]);

export const habitLogsTable = sqliteTable('habit_logs', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habitsTable.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  completedDate: text('completed_date').notNull(), // 'YYYY-MM-DD'
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  index('idx_habit_logs_user_date').on(table.userId, table.completedDate),
  unique('uq_habit_logs_date').on(table.habitId, table.completedDate)
]);

export const gymRoutinesTable = sqliteTable('gym_routines', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // 'Push', 'Pull', 'Legs'
  exercisesJson: text('exercises_json').default('[]'),
  createdAt: text('created_at').default(sql`(datetime('now'))`)
});

export const vitalsLogsTable = sqliteTable('vitals_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  waterLiters: real('water_liters').default(0),
  proteinTargetHit: integer('protein_target_hit').default(0),
  sleepHours: real('sleep_hours').default(0),
  sleepScore: integer('sleep_score').default(0), // 1 to 100
  readinessScore: integer('readiness_score').default(3), // 1 to 5
  createdAt: text('created_at').default(sql`(datetime('now'))`)
}, (table) => [
  unique('uq_vitals_user_date').on(table.userId, table.date)
]);

export type Habit = typeof habitsTable.$inferSelect;
export type HabitLog = typeof habitLogsTable.$inferSelect;
export type GymRoutine = typeof gymRoutinesTable.$inferSelect;
export type VitalsLog = typeof vitalsLogsTable.$inferSelect;
