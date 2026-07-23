# Backend Architecture

## Overview

The backend is a custom Node.js / TypeScript application built with Fastify and Prisma ORM over PostgreSQL. It replaces the previous Supabase dependency and exposes a REST API consumed by the React frontend.

## Stack

- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x
- **Language**: TypeScript (CommonJS output)
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 16
- **Auth**: Argon2id + JWT access tokens + HttpOnly refresh-token cookies
- **Validation**: Zod
- **Container**: Docker Compose for local PostgreSQL

## Directory layout

```
server/
├── prisma/               # Schema and migrations
├── src/
│   ├── config/           # Environment validation
│   ├── plugins/          # CORS, cookies, rate limit
│   ├── middleware/       # JWT authentication
│   ├── modules/          # Route modules (health, auth, companies, ...)
│   ├── shared/           # Prisma client, errors, security, validation, AI helpers
│   ├── app.ts            # Fastify factory
│   └── server.ts         # Entry point
└── docs/                 # Architecture, API, DB and security docs
```

## Multitenancy

- Every business entity carries `tenantId` and `userId` derived from the authenticated session.
- The backend never trusts `tenantId` sent by the client.
- All queries are filtered by `tenantId` and `deletedAt: null`.

## Authentication flow

1. Register / login creates a `User`, a `Tenant` (registration), and a `UserSession`.
2. A short-lived access token (JWT, 15 min) is returned in the JSON response.
3. A long-lived refresh token is stored as an HttpOnly cookie and rotated on every use.
4. Refresh tokens are hashed (SHA-256) in the database and can be revoked.

## Security

- Passwords are hashed with Argon2id.
- CORS is restricted to `CORS_ORIGIN` and credentials are enabled.
- Rate limiting is applied globally.
- Sensitive actions are logged to `audit_logs`.
