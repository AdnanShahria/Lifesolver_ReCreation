# 📱 LifeSolver Flutter Mobile Architecture

1. **State Management**:
   - `flutter_riverpod` (AsyncNotifierProvider) for reactive, type-safe state across all 8 verticals.

2. **Offline-First Persistence**:
   - `drift` local SQLite database.
   - `sync_outbox` table queues mutations when offline (POST, PUT, DELETE).
   - Sync service drains outbox on connectivity restored.

3. **Security & Biometrics**:
   - `flutter_secure_storage` stores the JWT token.
   - `local_auth` provides biometric authentication (Fingerprint / Face ID) on app resume.
