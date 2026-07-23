# Database Guide

## Prisma

The schema is declared in `server/prisma/schema.prisma`. It covers:

- Identity and auth (`Tenant`, `User`, `OAuthAccount`, sessions, refresh tokens)
- Sales and prospecting (`Company`, `Contact`, `Lead`, `LeadList`, `Opportunity`, ...)
- Growth (`Campaign`, `AutomationFlow`, `LandingPage`, ...)
- AI (`AiAgent`, `AiAgentRun`, `AiAction`, `AiApproval`, `AiUsageLog`)
- Governance (`AuditLog`, `CreditsLedger`, `FeatureFlag`, `WebhookEvent`)

## Local PostgreSQL

Start the database:

```bash
cd server
docker compose up -d
```

Create / apply migrations:

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma generate
```

Migrations are prepared locally and are not executed against a remote database.

## Connection

Set `DATABASE_URL` in `server/.env` (copy from `server/.env.example`).
