# DevFactory — Progresso do Projeto

> Este arquivo é a **memória viva** do projeto.
> Todo agente deve **ler este arquivo antes** de executar qualquer ação.
> Todo agente deve **registrar aqui** o que fez ao concluir.

---

## Estado Atual do Projeto

**Fase:** Pré-desenvolvimento — Setup e configuração
**Data de início:** 2026-03-10
**MVP:** 20 stories em 4 épicos

---

## Épicos e Status

| Épico | Descrição | Status |
|-------|-----------|--------|
| Épico 1 | Infraestrutura base (STORY-001 a 005) | 🔄 Parcialmente configurado |
| Épico 2 | Importação de PRD (STORY-006 a 010) | ⏳ Pendente |
| Épico 3 | Mapa Hexagonal D3.js (STORY-011 a 015) | ⏳ Pendente |
| Épico 4 | Análise de Progresso (STORY-016 a 020) | ⏳ Pendente |

---

## Registro de Progresso

---

### 2026-03-11 @dev (Dex) — STORY-002 e STORY-003 concluídas

- STORY-002: Express + Prisma + middleware + rota /health validados (já implementados)
- STORY-003: Indexes adicionados ao schema Prisma conforme ARCHITECTURE.md
- Migration `add_indexes` aplicada no Railway PostgreSQL
- Prisma Client regenerado (v6.19.2)
- Status: ✅ Concluído

### 2026-03-10 @dev (Dex) — STORY-001 validada e concluída

- ESLint migrado para flat config (ESLint 9 + Next.js 16)
- Corrigido: variáveis `module` → `mod` no TreeEditor.tsx
- Lint: ✅ 0 erros | TypeScript: ✅ 0 erros
- Todos os critérios de aceite da STORY-001 verificados
- Arquivos: `eslint.config.js`, `package.json`, `TreeEditor.tsx`
- Status: ✅ Concluído

### 2026-03-10 @devops (Gage) — Git inicializado e código enviado ao GitHub

- Git local inicializado (`git init`)
- Remote configurado: `https://github.com/guilhermesimas542-lab/DevFactory.git`
- 1316 arquivos commitados — commit inicial
- Push realizado com sucesso para `main`
- Conta GitHub ativa: `guilhermesimas542-lab`
- Status: ✅ Concluído

---

### 2026-03-10 — @aiox-master (Orion) — Setup inicial do projeto

**O que foi feito:**
- Projeto inicializado com `npx aiox-core init devfactory`
- Estrutura base criada: `apps/web/` (Next.js) e `apps/api/` (Express + Prisma)
- Documentos criados: `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/STORIES.md`
- Schema do banco de dados criado com 8 tabelas (Prisma)
- Migration inicial executada (`apps/api/prisma/migrations/`)
- Banco SQLite local criado (`apps/api/prisma/dev.db`)

**Credenciais configuradas:**
- `apps/api/.env` — DATABASE_URL (Railway PostgreSQL) + GEMINI_API_KEY ✅
- `apps/web/.env.local` — NEXTAUTH_SECRET + NEXTAUTH_URL + NEXT_PUBLIC_API_URL + GITHUB_TOKEN ✅
- `.env` raiz — ANTHROPIC_API_KEY + EXA_API_KEY + GITHUB_TOKEN ✅

**Repositório GitHub:**
- URL: https://github.com/guilhermesimas542-lab/DevFactory.git
- Status: repositório criado, git local ainda **não inicializado**

**Regras de projeto configuradas:**
- `.claude/CLAUDE.md` — modus operandi, agentes, documentação contínua
- `.aiox/modus-operandi.md` — referência de comportamento dos agentes

**Arquivos criados/modificados:**
- `.claude/CLAUDE.md` — atualizado com modus operandi
- `.aiox/modus-operandi.md` — criado
- `.aiox/env-notes.md` — criado
- `docs/PROGRESS.md` — criado (este arquivo)

**Decisões tomadas:**
- Stack confirmada: Next.js 14 + Express + Prisma + PostgreSQL + D3.js
- Deploy: Vercel (frontend) + Railway (backend + banco)
- Banco de dev: SQLite local | Banco de prod: Railway PostgreSQL
- Não usar: Supabase, DeepSeek, OpenRouter, Sentry, N8N, ClickUp (fora do escopo do DevFactory)

**Próximos passos:**
1. Inicializar git local e conectar ao GitHub (`@devops`)
2. Começar STORY-001 — Setup Next.js já existente, validar critérios de aceite (`@dev`)
3. Configurar EXA MCP no Claude Code

**Status:** 🔄 Setup em andamento

---

## Decisões Arquiteturais Registradas

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-03-10 | Usar SQLite em dev, PostgreSQL em prod | Simplicidade local, robustez em produção |
| 2026-03-10 | Não usar Claude API no MVP (v1) | Custo e complexidade — usar heurísticas estáticas |
| 2026-03-10 | Deploy: Vercel + Railway | Free tier, CI/CD nativo, sem custo no MVP |
| 2026-03-10 | Análise de código: Babel Parser + heurísticas | Sem executar código, análise estática apenas |

---

## Glossário de Termos do Projeto

| Termo técnico | O que significa |
|---------------|----------------|
| `frontend` | A parte visual do projeto — o site que o usuário vê |
| `backend` | O servidor — processa dados nos bastidores |
| `banco de dados` | Onde as informações ficam guardadas |
| `migration` | Script que cria ou altera a estrutura do banco |
| `commit` | Salvar uma versão do código no histórico |
| `deploy` | Publicar o projeto online para usuários reais |
| `PRD` | Documento de requisitos — o "plano do produto" |
| `story` | Uma tarefa específica de desenvolvimento |
| `épico` | Um grupo de stories relacionadas |
