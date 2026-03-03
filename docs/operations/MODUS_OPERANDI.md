# MODUS OPERANDI — devfactory

Documento centralizado de registro de todas as ações, decisões e estado do projeto.

**Leia isto antes de qualquer ação.** Depois, registre sua ação aqui.

---

## 📊 ESTADO ATUAL

**Data:** 2026-03-02 14:35
**Branches ativos:** `main` (clean)
**Último commit:** Deploy verificado e funcionando
**Status:** 🟢 ÉPICO 1 COMPLETO | STORY-005 ✅ CONCLUÍDA | INICIANDO STORY-006

### ✅ Concluído (Épico 1 — Infraestrutura Base)

- [x] STORY-001: Setup Next.js + TypeScript + Tailwind
- [x] STORY-002: Setup Express Backend + TypeScript + Prisma
- [x] STORY-003: Configurar PostgreSQL + Prisma Schema (8 tabelas)
- [x] STORY-004: Setup NextAuth.js + Login Simples
- [x] STORY-005: Deploy Vercel + Railway ✅

### ✅ STORY-005 (Deploy) — Verificação Final

**Frontend:** https://dev-factory-al5c.vercel.app ✅
**Backend:** https://dev-factory-al5c.up.railway.app ✅
**Health Check:** /api/health respondendo ✅
**Autenticação:** NextAuth.js funcionando ✅
**Comunicação:** Frontend ↔ Backend OK ✅

**Nota:** NEXTAUTH_SECRET foi mantido como: `9LKqxcoLi1n6jYtrb20Xt2x3CfvFZOK/XlPNoNYgSo=` (valor já configurado em Vercel)

### 🚀 Próximas Ações

**STORY-006:** Criar Página de Upload de PRD (Frontend)
→ Começar AGORA

**Roadmap:**
1. ✅ STORY-005: Deploy (CONCLUÍDO)
2. 🔄 STORY-006-010: Importação de PRD (próximas)
3. ⏳ STORY-011-015: Mapa Hexagonal
4. ⏳ STORY-016-020: Análise de Progresso

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
Leitura e mapeamento completo do estado do projeto.

**Resultados:**
- ✅ PRD v1.1 analisado
- ✅ ARCHITECTURE.md analisado
- ✅ STORIES.md analisado (20 stories MVP)
- ✅ Histórico de commits mapeado
- ✅ Bloqueadores identificados

---

### [2026-03-02] — @devops — STORY-005 (Deploy) — Configuração Inicial

**Descrição:**
Preparação completa para deploy em Railway (backend) + Vercel (frontend).

**O que foi feito:**
1. ✅ Criado arquivo .gitignore robusto (protege .env e secrets)
2. ✅ Gerado NEXTAUTH_SECRET seguro: `yNm/nDObXGJTxc/0RXXNeDYN02CNBs/RiUyfTd3m27A=`
3. ✅ Atualizado apps/web/.env.local com credenciais
4. ✅ Atualizado apps/api/.env com DATABASE_URL do Railway
5. ✅ Atualizado .env.example de ambos apps com instruções
6. ✅ Criado guia passo-a-passo detalhado (docs/SETUP_DEPLOY.md)
7. ✅ Criado guia visual para Railway + Vercel (docs/RAILWAY_VERCEL_SETUP.md)
8. ✅ Commitado para GitHub

**Arquivos criados/modificados:**
- `.gitignore` (novo) — protege credenciais
- `docs/SETUP_DEPLOY.md` (novo) — guia completo
- `docs/RAILWAY_VERCEL_SETUP.md` (novo) — guia passo-a-passo visual
- `apps/web/.env.local` (atualizado)
- `apps/api/.env` (atualizado)
- `apps/web/.env.example` (atualizado com comentários)
- `apps/api/.env.example` (atualizado com comentários)

**Git Commit:**
```
feat: [STORY-005] Configurar variáveis de ambiente para deploy Vercel + Railway
```

**Credenciais Guardadas com Segurança:**
- `~/.devfactory-secrets.txt` (local, não-commitado)

**Próxima ação recomendada:**
Usuário → Seguir guia em `docs/RAILWAY_VERCEL_SETUP.md` (Railway + Vercel setup manual nos dashboards)

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
