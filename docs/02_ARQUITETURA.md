# Arquitetura

## Visão geral

O projeto foi migrado de Supabase para um backend próprio.

- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand.
- **Backend**: Node.js + Fastify + Prisma ORM + PostgreSQL.
- **Comunicação**: REST/JSON. O frontend nunca acessa o banco diretamente.
- **Multitenancy**: `tenantId` é derivado da sessão autenticada no backend.
- **Autenticação**: Argon2id para senhas, JWT access token, refresh token rotacionável em cookie HttpOnly.

## Camadas do backend

- `config` — validação de variáveis de ambiente.
- `plugins` — CORS, cookie, rate limit.
- `middleware` — validação JWT.
- `modules` — rotas por domínio (auth, companies, lead-lists, agent-runs, audit).
- `shared` — Prisma client, segurança, validação Zod, parsers e scoring.

## Segurança

- Todas as senhas são hasheadas com Argon2id.
- Tokens de acesso têm vida curta (15 min).
- Refresh tokens são HttpOnly, SameSite=Strict e rotacionados.
- Logs de auditoria são gravados no banco para ações sensíveis.
