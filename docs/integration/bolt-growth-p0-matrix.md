# Matriz de Incorporação — Bolt Growth OS P0

Origem: `Lumyn_Vendas_Bolt_P0_Validated.zip`
SHA-256: `a6e52b0cd6716e918e2ab00ec1aa7a4f39560988c381f7e9ccea6499737700e0`
Extraído em: `_imports/bolt-growth-os-p0/Lumyn_Vendas_Bolt_P0/reference-project` (fora do runtime, ignorado pelo git)
Branch: `feature/bolt-growth-ui-p0` (base `feature/postgresql-runtime-validation` @ `dbc181b`)

Decisões aprovadas pelo usuário:
- Tema: escuro Bolt **adaptado**, com o roxo Lumyn (`#6d5dfc`) como cor de marca no lugar do azul.
- Marca exibida: **LUMYN VENDAS AI**.

Classificações:
- `REUTILIZAR` — componente visual genérico seguro, adaptado ao projeto.
- `ADAPTAR` — página/estrutura útil, reescrita para consumir contratos reais.
- `NÃO INCORPORAR` — mock, configuração conflitante ou funcionalidade sem backend.

## Layout e design system

| Item da referência | Classificação | Justificativa | Destino |
| --- | --- | --- | --- |
| `src/index.css` (tokens: glass-card, metric-card, sidebar-item, badge, btn, animações) | REUTILIZAR (adaptado) | Tokens visuais genéricos; cores azul/ciano trocadas pelo roxo Lumyn; diff controlado sobre `src/styles.css` | `src/styles.css` |
| `tailwind.config.js` (cores surface/brand/neon, sombras glow, animações) | REUTILIZAR (adaptado) | Extensões de tema genéricas; `brand` remapeado para a paleta roxa Lumyn existente | `tailwind.config.ts` |
| `src/components/layout/Sidebar.tsx` | ADAPTAR | Estrutura colapsável útil; itens de navegação reduzidos apenas às rotas funcionais; removido status fictício "Autopilot Ativo" | `src/components/Layout.tsx` |
| `src/components/layout/Header.tsx` | ADAPTAR | Estrutura útil; removidos busca não funcional, sino de notificações falso e badge "IA Ativa"; usuário/tenant reais do `authStore` | `src/components/Layout.tsx` |
| `index.html` (título) | REUTILIZAR | Título do produto | `index.html` |
| Fonte Inter via Google Fonts (`@import` remoto) | NÃO INCORPORAR | Dependência de rede em runtime; projeto já usa Inter via stack de sistema | — |

## Componentes UI

| Item | Classificação | Justificativa | Destino |
| --- | --- | --- | --- |
| `ui/MetricCard.tsx` | REUTILIZAR (adaptado) | Apresentacional puro; cor padrão roxa; tipagem preservada | `src/components/ui/MetricCard.tsx` |
| `ui/StatusBadge.tsx` → `StatusBadge` | ADAPTAR | Config de status reduzida aos estados reais do backend (`dataQualityStatus`, `status`, `source`); estados de mock (demo, won, generating…) removidos | `src/components/ui/StatusBadge.tsx` |
| `ui/StatusBadge.tsx` → `ScoreBadge` | REUTILIZAR (adaptado) | Consome `leadScore` real calculado pelo backend | `src/components/ui/StatusBadge.tsx` |
| `ui/StatusBadge.tsx` → `TempBadge` | NÃO INCORPORAR | `LeadTemperature` é conceito exclusivo do mock; sem contrato real | — |
| `ui/StatusBadge.tsx` → `ChannelBadge` | NÃO INCORPORAR | Canais (Instagram/TikTok/…) só existem no mock | — |
| `ui/AIInsightBox.tsx` | REUTILIZAR (adaptado) | Apresentacional puro; usado para exibir a resposta real do `/agent-runs` | `src/components/ui/AIInsightBox.tsx` |
| `ui/SimpleBarChart.tsx` → `SimpleBarChart` | REUTILIZAR (adaptado) | Apresentacional puro; alimentado por agregação real de `/companies` (empresas por segmento) | `src/components/ui/SimpleBarChart.tsx` |
| `ui/SimpleBarChart.tsx` → `HorizontalBarChart`, `DonutChart` | NÃO INCORPORAR (nesta fase) | Sem série de dados real que os justifique no P0; evitar código morto | — |

## Páginas da referência

| Página | Classificação | Justificativa | Destino |
| --- | --- | --- | --- |
| `pages/Dashboard.tsx` | ADAPTAR | Estrutura de métricas útil; KPIs reescritos com dados reais (créditos/plano do tenant, contagens de `/companies` e `/lead-lists`, distribuição por segmento) | `src/pages/DashboardPage.tsx` |
| `pages/Leads.tsx` | ADAPTAR | Tabela/estrutura útil; reescrita sobre a `CompaniesPage` existente consumindo `/companies` | `src/pages/CompaniesPage.tsx` |
| `pages/Pipeline.tsx` | NÃO INCORPORAR | Kanban depende de estágios de lead inexistentes no backend | — (P1) |
| `pages/SDR.tsx` | NÃO INCORPORAR | Sem contrato real de copiloto/conversas | — (P1+) |
| `pages/Autopilot.tsx` | NÃO INCORPORAR | Automação inexistente no backend; exibi-la seria funcionalidade falsa | — (P1+) |
| `pages/SocialGrowth.tsx` | NÃO INCORPORAR | Sem backend de conteúdo/social | — (P1+) |
| `pages/Campaigns.tsx` | NÃO INCORPORAR | Sem backend de campanhas | — (P1+) |
| `pages/Products.tsx` | NÃO INCORPORAR | Catálogo de produtos da holding é conteúdo mock | — (P1+) |
| `pages/EcosystemHub.tsx` | NÃO INCORPORAR | Visão de holding sem dados reais | — (P1+) |
| `pages/CrossSell.tsx` | NÃO INCORPORAR | Sem contrato de oportunidades | — (P1+) |
| `pages/Conversations.tsx` | NÃO INCORPORAR | Sem inbox/canal real | — (P1+) |
| `pages/Reports.tsx` | NÃO INCORPORAR | Relatórios avançados sem endpoints agregadores | — (P1+) |
| `pages/Settings.tsx` | NÃO INCORPORAR | Toggles/integrações fictícios; `SettingsPage` atual (dados reais + logout) apenas restilizada | `src/pages/SettingsPage.tsx` (restyle) |

Os módulos "NÃO INCORPORAR" permanecem apenas na área de referência `_imports/` (fora do git e do runtime). Nenhum deles entra na navegação, em rotas ocultas ou como telas desabilitadas com dados fictícios.

## Dados, tipos e configuração

| Item | Classificação | Justificativa |
| --- | --- | --- |
| `src/data/mockData.ts` | NÃO INCORPORAR | Proibido pelo manifesto; nenhuma importação em runtime |
| `src/types/index.ts` (referência) | NÃO INCORPORAR | Tipos moldados ao mock; os tipos reais vêm de `src/types/index.ts` atual (contratos Prisma/API) |
| `src/App.tsx` (referência) | NÃO INCORPORAR | Sem autenticação; o `App.tsx` atual com bloqueio por auth é preservado |
| `package.json` / `package-lock.json` (referência) | NÃO INCORPORAR | Nenhuma dependência da referência instalada (lucide-react/react já existem no projeto) |
| Configs de build (vite/tsconfig/eslint/postcss da referência) | NÃO INCORPORAR | Conflitantes com o build atual |
| `@supabase/supabase-js` | NÃO INCORPORAR | Já removido da cópia sanitizada; proibido reintroduzir |

## Preservado sem regressão (arquitetura atual)

- `src/App.tsx` — bloqueio por autenticação e roteamento por estado.
- `src/lib/tokenStore.ts` — token de acesso somente em memória.
- `src/lib/apiClient.ts` — refresh automático single-flight, cookie HttpOnly.
- `src/state/authStore.ts` — login/registro/logout/restauração de sessão.
- Backend Fastify + Prisma + PostgreSQL, multitenancy derivado do banco (não do JWT/frontend).
- Testes existentes de frontend (`tests/auth.test.ts`) e backend (`server/tests/auth.test.ts`).
