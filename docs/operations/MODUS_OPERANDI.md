# MODUS OPERANDI — devfactory

Documento centralizado de registro de todas as ações, decisões e estado do projeto.

**Leia isto antes de qualquer ação.** Depois, registre sua ação aqui.

---

## 📊 ESTADO ATUAL

**Data:** 2026-03-02
**Branches ativos:** `main` (clean)
**Último commit:** `docs: add .env.example with database configuration template` (5c80439)
**Status:** 🟡 STORY-004 Concluída | STORY-005 (Deploy Railway + Vercel) Bloqueada por config

### ✅ Concluído (Épico 1 — Infraestrutura Base)

- [x] STORY-001: Setup Next.js + TypeScript + Tailwind
- [x] STORY-002: Setup Express Backend + TypeScript + Prisma
- [x] STORY-003: Configurar PostgreSQL + Prisma Schema (8 tabelas)
- [x] STORY-004: Setup NextAuth.js + Login Simples

### 🔴 Bloqueadores Atuais

**STORY-005 (Deploy Vercel + Railway) está BLOQUEADA por:**
1. ⏳ Vercel conta criada? (não configurado)
2. ⏳ Railway conta + PostgreSQL setup? (não configurado)
3. ⏳ GitHub repositório criado? (local apenas)
4. ⏳ NEXTAUTH_SECRET gerado? (temporário apenas)
5. ⏳ DATABASE_URL PostgreSQL Production? (local SQLite apenas)

**Impedimento identificado:** Railway configuration não foi finalizada. Paramos aqui.

### 📋 Próximas Ações

1. **URGENTE:** Terminar configuração Railway (PostgreSQL production)
2. **URGENTE:** Criar Vercel account + token
3. **URGENTE:** Criar GitHub repo (backup + CI/CD)
4. **DEPOIS:** STORY-005 Deploy (Frontend + Backend)
5. **DEPOIS:** STORY-006+ Importação de PRD

---

## 📝 LOG DE AÇÕES

### [2026-02-28 a 2026-03-01] — @dev — Épico 1: Infraestrutura Base (CONCLUÍDO)

**Descrição:**
Criação de toda a infraestrutura base do projeto DevFactory conforme PRD v1.1 e ARCHITECTURE.md.

**O que foi feito:**
1. ✅ STORY-001: Inicializado Next.js 14 com TypeScript, ESLint, Tailwind CSS
2. ✅ STORY-002: Setup Express backend com TypeScript, middleware (logger, errorHandler), rota /health
3. ✅ STORY-003: Configurado Prisma ORM com schema PostgreSQL (8 tabelas)
4. ✅ STORY-004: Integrado NextAuth.js v5 com demo user (test@example.com / 123456)

**Resultados:**
- Estrutura de pastas criada: `/apps/web/` (Next.js) + `/apps/api/` (Express)
- Databases schema pronto (projects, modules, components, stories, alerts, analysis_results, snapshots, glossary_terms)
- Middleware de autenticação funcional
- 20+ commits com histórico limpo

**Arquivos principais criados:**
- `apps/web/pages/{index,dashboard,login}.tsx`
- `apps/api/src/{routes,services,middleware,utils}/`
- `prisma/schema.prisma` (8 models)
- `.env.example` (template)

**Próxima ação recomendada:**
@dev → STORY-005 (Deploy Vercel + Railway) — **MAS REQUER CONFIGURAÇÃO EXTERNA PRIMEIRO**

---

### [2026-03-02] — @pm / @architect — Análise Completa do Projeto

**Descrição:**
Leitura e mapeamento completo do estado do projeto antes de continuar com STORY-005.

**Resultados:**
- ✅ PRD v1.1 analisado (product requirements, stack, roadmap)
- ✅ ARCHITECTURE.md analisado (decisões, schema, endpoints, patterns)
- ✅ STORIES.md analisado (20 stories MVP, dependências, estimativas)
- ✅ Histórico de commits mapeado (17 commits desde início)
- ✅ Bloqueadores identificados (Railway config)

**Identificação do ponto de parada:**
- Infraestrutura local: 100% completa (SQLite, dev environment)
- Infraestrutura produção: 0% completa (Railway, Vercel não configurados)

**Próxima ação recomendada:**
@devops → Configurar Railway + PostgreSQL production + Vercel antes de STORY-005

---

## 🔑 DECISÕES CRÍTICAS

### Infraestrutura (Épico 1)
- ✅ **Frontend:** Next.js 14 + React 18 + Tailwind CSS v3
- ✅ **Backend:** Express.js + TypeScript + Prisma ORM
- ✅ **Auth:** NextAuth.js v5 com CredentialsProvider (demo user)
- ✅ **Database schema:** 8 tabelas (projects, modules, components, stories, alerts, analysis_results, snapshots, glossary_terms)
- ⏳ **Deployment:** Vercel (frontend) + Railway (backend + PostgreSQL) — **PENDENTE CONFIGURAÇÃO**

### Por que paramos em Railway?
Quando foi criado o schema PostgreSQL (STORY-003), o projeto foi configurado com **SQLite local** para desenvolvimento. Para avançar com STORY-005 (deploy real), é necessário:
1. Criar conta Railway
2. Provisionar PostgreSQL em Railway
3. Obter CONNECTION_STRING production
4. Configurar variáveis de ambiente em Railway e Vercel
5. Fazer deploy inicial (teste)

---

## 🚀 CONTEXTO DO PROJETO

**O que sabemos até agora:**
- Localização: `/Users/guilhermesimas/Documents/devfactory`
- Git: repositório limpo, branch main
- Projetos sob esse diretório: aios-core, meu-projeto-aios, etc

**O que precisamos saber:**
- Objetivos principais?
- Qual projeto é o foco?
- Qual é o escopo de desenvolvimento?
- Quem são os stakeholders?

---

## 📌 REFERÊNCIAS

- **Regra 10 (Ativa):** Documento de Modus Operandi
- **Memória do projeto:** `/Users/guilhermesimas/.claude/projects/-Users-guilhermesimas-Documents-devfactory/memory/MEMORY.md`
- **Regras globais:** `~/.claude/rules/user-rules.md`

---

**Mantido por:** AIOS Agents
**Última atualização:** 2026-03-02 (Orion, aios-master)
