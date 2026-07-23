# API Contract

Base URL: `http://localhost:3000`

## Health

- `GET /health` -> `{ status: 'ok', timestamp: string }`

## Auth

All auth routes are prefixed `/auth`.

- `POST /auth/register` -> `{ accessToken, user, tenant }`
- `POST /auth/login` -> `{ accessToken, user, tenant }`
- `POST /auth/refresh` -> `{ accessToken, user, tenant }` (uses HttpOnly cookie)
- `POST /auth/logout` -> `{ message: 'Logged out' }` (requires Bearer token)
- `GET /auth/me` -> `{ accessToken, user, tenant }` (requires Bearer token)

## Companies

- `GET /companies?segment=&city=&limit=` -> `Company[]` (Bearer)
- `POST /companies` -> `Company` (Bearer)

## Lead Lists

- `GET /lead-lists` -> `LeadList[]` (Bearer)
- `POST /lead-lists` -> `LeadList` (Bearer)
- `POST /lead-lists/:id/companies` -> `LeadListItem` (Bearer)

## Agent Runs

- `POST /agent-runs` -> `{ id, parsed, estimatedCredits, requiresConfirmation, response }` (Bearer)

## Audit

- `POST /audit-logs` -> `AuditLog` (Bearer)

All protected routes require `Authorization: Bearer <accessToken>`.
