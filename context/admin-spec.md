# 🛡️ LifeSolver Admin Matrix Specification

1. **Security & Session Model**:
   - Gated behind `admin.middleware.ts`.
   - Requires time-limited HMAC-SHA256 signed cookie (`ls_adm_session`).
   - Zero hardcoded backdoors or unauthenticated admin routes.

2. **Cockpit Capabilities**:
   - **Telemetry**: Real-time probe of D1, KV, R2, Vectorize, and Queue bindings.
   - **User Override**: Direct plan modification (Free / Pro / Elite) with instant KV cache invalidation.
   - **Plan Config Manager**: Edit limits and features dynamically in KV without redeploying code.
   - **Promo Codes**: Create and track discount codes.
