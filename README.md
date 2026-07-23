# Lumyn Prospect AI

Frontend React + Vite + TypeScript + Tailwind CSS para o Lumyn Prospect AI.

## Arquitetura

- **Frontend**: React 18, Vite, Tailwind CSS, Zustand.
- **Backend**: Node.js, Fastify, Prisma, PostgreSQL.
- **Comunicação**: HTTP/JSON; autenticação via JWT access token + refresh token HttpOnly cookie.

## Setup

1. Copie `.env.example` para `.env` e ajuste `VITE_API_URL`.
2. Instale as dependências: `npm install`.
3. Inicie o backend (veja `server/README.md` ou `COMMANDS.md`).
4. Rode o frontend: `npm run dev`.

## Scripts

- `npm run dev` — servidor de desenvolvimento.
- `npm run build` — build de produção.
- `npm run lint:types` — checagem de TypeScript.
