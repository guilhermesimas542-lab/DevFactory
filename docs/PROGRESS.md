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

### 2026-03-11 @dev (Dex) — Model Selector UI (tipo Cursor) implementado ✅

- Criado `ModelContext.tsx` para gerenciar estado global de seleção
- Criado `ModelSelector.tsx` com interface Cursor-style (dropdown search + toggles)
- Integrado ModelSelector na topbar do ProjectLayout
- ModelProvider envolvendo toda a aplicação em `_app.tsx`
- AIPanel atualizado para usar modelo selecionado no chat
- Página do mapa (map.tsx) atualizada para usar modelo selecionado na extração
- Auto mode implementado (seleciona melhor provider disponível)
- Preferência de modelo persistida em localStorage
- UI features:
  - ✅ Busca de modelos
  - ✅ Toggle "Auto mode"
  - ✅ Lista de modelos com checkmark no selecionado
  - ✅ Indicador visual de status (ponto verde)
  - ✅ Dark mode support
- TypeScript: ✅ 0 erros
- Commits: 1 (feat: add model selector UI for LLM switching)
- Status: ✅ Concluído

**Como funciona:**
1. Clica no botão do modelo no topbar (ex: "Mixtral 8x7B (Groq)")
2. Abre dropdown com opções
3. Seleciona o modelo desejado
4. Próximas chamadas de IA usam o modelo selecionado
5. Auto mode opcional para deixar o sistema escolher

---

### 2026-03-11 @dev (Dex) — Multi-LLM Support (Groq + Gemini) implementado ✅

- Criado `AIProviderFactory.ts` com suporte a múltiplos providers
- Refatorado `ArchitectureService` para usar providers plugáveis
- Refatorado `ChatService` para usar providers plugáveis
- Adicionado endpoint GET `/api/chat/providers` para listar providers disponíveis
- Atualizado frontend `lib/api.ts` com funções para alternar entre LLMs
- Groq SDK instalado e integrado (mixtral-8x7b-32768)
- Groq configurado como provider padrão (free tier sem quota limit)
- Fallback automático para Gemini se Groq indisponível
- Componente `AIPanel` atualizado para suportar escolha de LLM
- TypeScript: ✅ 0 erros em ambas as apps
- Commit push realizado na branch `chore/mvp-complete`
- Status: ✅ Concluído

**Como usar:**
- Backend: `/api/projects/{id}/extract-architecture` + `{ provider: "groq" }` (POST)
- Backend: `/api/chat` + `{ provider: "groq", ...}` (POST)
- Frontend: `extractArchitecture(projectId, "groq")` ou `extractArchitecture(projectId)` (default)
- Frontend: `sendChatMessage(projectId, msg, history, "groq")`

---

### 2026-03-11 @devops (Gage) — Deploy Vercel CORRIGIDO E FUNCIONANDO ✅

- `vercel.json` simplificado para apenas `{ "framework": "nextjs" }`
- Removido: `buildCommand` customizado (causava conflito com monorepo)
- Removido: `outputDirectory` customizado (Vercel detecta automaticamente)
- Root Directory já estava configurado em `apps/web` no dashboard Vercel
- `git push` realizado com vercel.json atualizado
- Redeploy executado — **Status: READY** 🚀
- DevFactory está **ONLINE** no Vercel!
- Status: ✅ COMPLETO — Deploy funcionando

---

### 2026-03-11 @ux-design-expert (Uma) — Design System Migration completa

- Sistema de tokens implementado em `globals.css` (CSS custom properties completas)
- `tailwind.config.ts` estendido com cores `df-*` mapeadas para variáveis CSS
- Tema dark aplicado em **10 arquivos**: globals.css, tailwind.config, ProjectLayout, dashboard, login, [id].tsx, progress.tsx, stories.tsx, alerts.tsx, glossary.tsx
- Componentes `ProgressBar` e `ModuleCard` redesenhados com dark theme
- Utilitários criados: `.df-card`, `.df-badge-*`, `.df-btn-primary`, `.df-btn-ghost`, `.df-input`, `.df-spinner`
- Fontes: DM Sans (sans) + JetBrains Mono (mono) via Google Fonts
- Sidebar redesenhada no `ProjectLayout` com nav items, logo, breadcrumb topbar
- Animações: fadeUp com delays escalonados
- Status: ✅ Concluído

---

### 2026-03-11 @dev (Dex) — Épicos 2, 3 e 4 validados — TODAS as stories concluídas

- STORY-006: Página /projects + UploadForm ✅
- STORY-007: POST /api/projects/import-prd + multer ✅
- STORY-008: parsePRDMarkdown() ✅
- STORY-009: createProjectFromParsedPRD() com transação Prisma ✅
- STORY-010: /projects/[id]/validate + TreeEditor ✅
- STORY-011: useD3 hook ✅
- STORY-012: drawHexagons() + HexagonMap ✅
- STORY-013: forceLayout + links ✅
- STORY-014: SidePanel + click handler ✅
- STORY-015: zoom/pan (HexagonMap) ✅
- STORY-016: cloneGitHubRepo() ✅
- STORY-017: parseFiles() com Babel ✅
- STORY-018: scoreMatch() com fuzzy/substring ✅
- STORY-019: AnalysisEngine.analyze() ✅
- STORY-020: GET /progress + dashboard ✅
- TypeScript: 0 erros em web e api
- Status: ✅ MVP COMPLETO

### 2026-03-11 @devops (Gage) — STORY-005 concluída — Deploy configurado

- Vercel (frontend) + Railway (backend) já conectados e em produção
- Criado `vercel.json` com config de build
- Criado `railway.toml` com config de deploy e healthcheck
- Criado `.github/workflows/ci.yml` — CI automático no push
- Status: ✅ Concluído — Épico 1 COMPLETO

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
