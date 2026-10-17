# 🔒 LifeSolver Security Model

1. **Authentication**: Real HMAC-SHA256 JWTs via `@tsndr/cloudflare-worker-jwt`. Expiry validated on every request.
2. **Password Security**: Web Crypto PBKDF2 (SHA-256, 100,000 iterations, 16-byte cryptographically secure random salt per user).
3. **Zero Backdoors**: Hardcoded passwords eliminated. Admin panel gated by HMAC cookie and multi-step verification.
4. **Parameterized SQL**: 100% Drizzle ORM parameterized statements on Cloudflare D1.
5. **Server-Side Computed Streaks & Balances**: Client cannot spoof habit streak counts or wallet balances.
6. **Zero-Knowledge Vault**: AES-GCM-256 encryption in the browser with user's client-side key before storage in Cloudflare R2.
