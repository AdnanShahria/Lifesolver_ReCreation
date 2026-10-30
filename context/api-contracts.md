# 🌐 LifeSolver API Contracts

All endpoints live under `/api/*` on the Cloudflare Worker (`api.lifesolver.app`).
Admin endpoints live under `/adm/api/*`.

## Standard Response Envelopes
- Success: `{ "ok": true, "data": ... }`
- Cursor List: `{ "ok": true, "data": [...], "nextCursor": "string | null" }`
- Error: `{ "ok": false, "error": "ERROR_CODE", "message": "Human readable detail" }`

## Common Headers
- `Authorization: Bearer <JWT>`
- `Content-Type: application/json`
- Admin session: `Cookie: ls_adm_session=<HMAC-Signed-Token>`

---

## Finance & Universal Multi-Account Endpoints

### 1. Financial Accounts (`/api/finance/accounts`)
- **GET `/api/finance/accounts`**:
  - Lists all active financial accounts for the user (Bank, bKash, Nagad, PayPal, Cash, Crypto, Custom).
  - If user has no accounts, auto-seeds 4 starter accounts (Cash Wallet, Main Bank, bKash Mobile Wallet, PayPal USD).
  - Response: `{ "ok": true, "data": { "accounts": FinancialAccount[], "totalConvertedBalance": number, "summary": AccountsSummary } }`
- **POST `/api/finance/accounts`**:
  - Creates a new financial account.
  - Body: `{ name: string, type: AccountType, subtype?: string, currency: string, initialBalance?: number, creditLimit?: number, color?: string, icon?: string }`
- **PUT `/api/finance/accounts/:id`**:
  - Updates mutable account properties (name, color, icon, creditLimit, excludeFromNetWorth).
- **DELETE `/api/finance/accounts/:id`**:
  - Deletes an account and associated ledger cascades.
- **POST `/api/finance/accounts/:id/adjust`**:
  - Directly sets `currentBalance` to reconcile discrepancies without skewing revenue/expense reports.
  - Body: `{ newBalance: number, notes?: string }`

### 2. Dual-Entry Inter-Account Transfers (`/api/finance/transfers`)
- **POST `/api/finance/transfers`**:
  - Atomically moves funds from source to destination account.
  - Decrements `fromAccount.currentBalance` by `(amount + feeAmount)`.
  - Increments `toAccount.currentBalance` by `destinationAmount`.
  - Records transfer log and creates an expense record for `feeAmount` under category `'Bank/Transfer Fee'` if fee > 0.
  - Body: `{ fromAccountId: string, toAccountId: string, amount: number, destinationAmount?: number, exchangeRate?: number, feeAmount?: number, date?: string, notes?: string }`
- **GET `/api/finance/transfers`**:
  - Lists historical inter-account transfers with populated account names and currencies.
- **DELETE `/api/finance/transfers/:id`**:
  - Reverses transfer balances atomically and deletes transfer record.

### 3. Ledger & Real-Time Cashflow (`/api/finance/ledger`)
- **GET `/api/finance/ledger`**:
  - Query params: `?accountId=...`, `?type=income|expense`, `?category=...`, `?isSpecial=0|1`, `?limit=...`, `?cursor=...`.
  - Returns transactions joined with `accountName` and `accountColor`, alongside real-time calculated balances (`totalBalance`, `regularBalance`, `specialBalance`, `netSavingsRate`).
- **POST `/api/finance/ledger`**:
  - Creates an income or expense transaction.
  - If `accountId` is provided, automatically increments (`income`) or decrements (`expense`) the account's `currentBalance` in real time.

