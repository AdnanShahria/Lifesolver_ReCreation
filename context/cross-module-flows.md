# 🔄 LifeSolver Cross-Module Integration Matrix

This document maps all state flows connecting the 8 Core Verticals:

1. **Planner ↔ Finance**:
   - Marking a task with an expected cost as `done` can automatically log an expense in the Cash Ledger.
   - Budgets link directly to planned projects and milestones.

2. **Planner ↔ Mind**:
   - High-yield study chapters or note checklists can be exported into daily Planner tasks with estimated durations.

3. **Mind ↔ Copilot**:
   - Orbit AI digests note highlights and extracts SuperMemo SM-2 spaced repetition cards.
   - Vectorize indexes note content embeddings for semantic RAG retrieval.

4. **Health ↔ Mind (Journal)**:
   - Daily mood and energy ratings correlate with habit streaks and sleep scores in the weekly AI synthesis.

5. **Focus ↔ Extension ↔ Health**:
   - Extension screen time telemetry and friction events sync to Cloudflare D1.
   - Screen time graphs display total daily focus minutes versus blocked distractions.

6. **Assets ↔ Finance ↔ Vault**:
   - Purchasing equipment logs a cash ledger entry.
   - Warranties generate countdown alerts 30 days and 7 days prior to expiry.
   - Encrypted document vault stores receipts and certificates with client-side AES-GCM-256.

7. **Network ↔ Planner**:
   - Commitment reminders with friends, family, or mentors automatically inject into the daily schedule.
