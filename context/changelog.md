# 📜 LifeSolver Recreation Changelog

## [3.2.0] - Initial Monorepo Setup & Foundation
- Setup monorepo root with `pnpm` workspaces (`frontend`, `backend`, `extension`, `database`).
- Orchestration scripts in `scripts/` (`dev.js`, `deploy.js`, `apply-schema.js`, `health-check.js`, `flutter-emulator.js`).
- Created package structures for `backend/` (Cloudflare Worker Hono + Drizzle), `frontend/` (React 19 + Vite + Tailwind v4), `database/` (Drizzle Kit + SQLite), `extension/` (Chrome MV3), and `flutter/` (Riverpod + Drift).
- Codified 8 Core Verticals architecture and Feature-Per-File convention.
