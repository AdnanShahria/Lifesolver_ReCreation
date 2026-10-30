# 🗄️ LifeSolver Relational Database Schema Overview

Primary Database: Cloudflare D1 (SQLite) with Drizzle ORM.
Replication / Backup: Turso libSQL via async Cloudflare Queues.

## Tables (26 Tables across Core & 8 Verticals):
1. **Core / Auth**: `users`, `settings`, `otps`, `subscriptions`, `promo_codes`, `billing_events`
2. **Planner**: `tasks`, `task_time_logs`, `goals`, `milestones`, `calendar_events`
3. **Mind**: `notes`, `bookmarks`, `flashcards`, `journal_entries`
4. **Finance**:
   - `financial_accounts`: Multi-account ledger (Cash, Bank, bKash, Nagad, PayPal, Wise, Crypto, Custom)
   - `account_transfers`: Dual-entry inter-account transfers with exchange rate & fee capture
   - `finance`: Transaction ledger with foreign key `account_id` and `transfer_id`
   - `budgets`: Spending limits and savings targets
   - `savings_transactions`: Deposits and withdrawals per savings pot
   - `bills`: Recurring subscriptions with autopay status
   - `loans`: Peer-to-peer receivables and payables (lent vs borrowed)
5. **Health**: `habits`, `habit_logs`, `gym_routines`, `gym_logs`, `vitals_logs`
6. **Focus**: `focus_sessions`, `extension_usage`, `friction_events`
7. **Assets**: `inventory`, `warranties`, `vault_documents`
8. **Network**: `contacts`, `commitments`, `outreach_logs`
9. **Mobile Drift Local**: `sync_outbox` (Client-side offline SQLite queue only)
