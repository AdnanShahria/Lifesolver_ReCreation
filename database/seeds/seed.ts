/**
 * LifeSolver Initial Development Database Seeder
 * Populates test user, default settings, and sample core vertical data.
 */
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../schema/index';

export async function seed(db: ReturnType<typeof drizzle>) {
  console.log('🌱 Seeding LifeSolver development database...');

  const userId = 'usr_orbit_master_01';
  
  // 1. Seed Master User
  await db.insert(schema.usersTable).values({
    id: userId,
    name: 'Adnan Shahria',
    email: 'adnan@orbit.dev',
    passwordHash: 'dummy_hash_for_dev_seed',
    passwordSalt: 'dummy_salt_for_dev_seed',
    isVerified: 1
  }).onConflictDoNothing();

  // 2. Seed Default Settings
  await db.insert(schema.settingsTable).values({
    id: 'set_orbit_master_01',
    userId,
    theme: 'dark',
    currency: 'BDT',
    language: 'en',
    monthlyBudget: 35000,
    dockShortcuts: JSON.stringify(['planner', 'mind', 'finance', 'health', 'focus'])
  }).onConflictDoNothing();

  // 3. Seed Subscription
  await db.insert(schema.subscriptionsTable).values({
    id: 'sub_orbit_master_01',
    userId,
    planId: 'elite',
    status: 'active'
  }).onConflictDoNothing();

  console.log('✅ LifeSolver Database seed complete.');
}
