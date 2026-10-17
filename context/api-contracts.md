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
