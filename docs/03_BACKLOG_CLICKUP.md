# Backlog (resumido)

## Em andamento / concluído

- [x] Remover dependências ativas do Supabase.
- [x] Estruturar backend Node.js/Fastify.
- [x] Configurar PostgreSQL local com Docker Compose.
- [x] Modelar schema Prisma com multitenancy.
- [x] Implementar autenticação (Argon2, JWT, refresh token HttpOnly).
- [x] Implementar rotas de health, auth, companies, lead-lists, agent-runs e audit.
- [x] Criar `apiClient` e `authStore` no frontend.
- [x] Migrar páginas e serviços do frontend para a API HTTP.
- [ ] Criar migration inicial do Prisma e rodar `prisma generate`.
- [ ] Validação de build frontend e backend.
- [ ] Deploy em ambiente de staging.

## Futuro

- Implementar importação CSV e enriquecimento de leads.
- Adicionar Google OAuth via tabela `OAuthAccount`.
- Painel de automações e campanhas.
- Métricas e dashboard executivo.
