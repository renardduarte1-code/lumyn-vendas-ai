# Security Model

## Authentication

- Passwords are hashed with Argon2id and never stored or logged in plain text.
- Access tokens are signed JWTs with a 15-minute lifetime.
- Refresh tokens are 512-bit random values hashed with SHA-256 and stored in PostgreSQL.
- Refresh tokens are delivered as `HttpOnly`, `SameSite=Strict` cookies scoped to `/auth`.
- Refresh tokens are rotated: a new token is issued on every refresh and the old one is revoked.

## Authorization

- `tenantId` and `userId` come from the validated JWT access token only.
- All data-access functions enforce `tenantId` filtering.
- A user can only read or modify resources belonging to the tenant present in their token.

## Transport

- `COOKIE_SECRET` signs cookies.
- CORS origin is configurable via `CORS_ORIGIN` and credentials are enabled.
- Rate limiting is enabled globally (100 requests per minute).

## Audit

Sensitive actions (register, login, logout, refresh, company creation, lead-list creation, agent runs) are inserted into `audit_logs` with `tenantId`, `userId`, action, entity type/id, IP and user-agent.
