# Checklist de Homologação — MVP 1

## Autenticação

- [ ] Cadastro funciona.
- [ ] Login funciona.
- [ ] Logout funciona.
- [ ] Sessão persiste após F5.
- [ ] Usuário sem sessão não acessa área interna.

## Multitenancy

- [ ] Todo usuário possui tenant_id.
- [ ] Empresas ficam isoladas por tenant.
- [ ] Listas ficam isoladas por tenant.
- [ ] Créditos ficam isolados por tenant.
- [ ] Logs ficam isolados por tenant.

## Empresas

- [ ] Cadastrar empresa.
- [ ] Listar empresas.
- [ ] Filtrar empresas.
- [ ] Calcular score.
- [ ] Registrar fonte.

## Listas

- [ ] Criar lista.
- [ ] Adicionar empresa.
- [ ] Remover empresa.
- [ ] Evitar duplicidade.
- [ ] Exportar CSV.

## Agente IA

- [ ] Interpretar “encontre 20 clínicas de estética em Brasília”.
- [ ] Extrair quantidade.
- [ ] Extrair segmento.
- [ ] Extrair cidade.
- [ ] Estimar créditos.
- [ ] Registrar execução.

## Créditos

- [ ] Mostrar saldo.
- [ ] Estimar consumo.
- [ ] Debitar consumo.
- [ ] Registrar ledger.
- [ ] Bloquear ação sem saldo.

## Compliance

- [ ] Campo source obrigatório em dados coletados.
- [ ] Campo opt_out existe.
- [ ] Exportação respeita opt_out.
- [ ] Auditoria registra ação crítica.
