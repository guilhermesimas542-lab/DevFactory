# MODUS OPERANDI — devfactory

Documento centralizado de registro de todas as ações, decisões e estado do projeto.

**Leia isto antes de qualquer ação.** Depois, registre sua ação aqui.

---

## 📊 ESTADO ATUAL

**Data:** 2026-03-11 (Sessão 9 — 8 Melhorias Concluídas)
**Branches ativos:** `main` (clean)
**Último commit:** a3824d1
**Status:** ✅ MVP COMPLETO — Todas as 20 stories implementadas e deployadas

### ✅ Concluído — MVP Completo

**Épico 1 — Infraestrutura Base**
- [x] STORY-001: Setup Next.js + TypeScript + Tailwind
- [x] STORY-002: Setup Express Backend + TypeScript + Prisma
- [x] STORY-003: Configurar PostgreSQL + Prisma Schema (8 tabelas)
- [x] STORY-004: Setup NextAuth.js + Login Simples
- [x] STORY-005: Deploy Vercel + Railway ✅

**Épico 2 — Importação de PRD**
- [x] STORY-006: Upload de PRD (frontend + backend)
- [x] STORY-007: Dashboard com listagem + página de resultado
- [x] STORY-008: Parser Markdown → JSON (prdParser.ts)
- [x] STORY-009: Criar Módulos no Banco (ProjectService.ts)
- [x] STORY-010: UI de Validação da Árvore (validate.tsx + TreeEditor)

**Épico 3 — Mapa Hexagonal**
- [x] STORY-011: Setup D3.js + Hook useD3
- [x] STORY-012: Hexagon Shape SVG Rendering (HexagonMap.tsx)
- [x] STORY-013: Force Layout + Conexões (forceLayout.ts)
- [x] STORY-014: Clique no Hexágono → Drawer/Modal
- [x] STORY-015: Zoom + Pan + Centralizar ✅ (implementado sessão 9)

**Épico 4 — Análise de Progresso**
- [x] STORY-016: GitHub Clone + File Reading (githubFetcher.ts)
- [x] STORY-017: Babel Parser — Extract AST (babelParser.ts)
- [x] STORY-018: Heurísticas de Matching PRD vs Code (heuristics.ts)
- [x] STORY-019: Analysis Engine — Full Pipeline (AnalysisEngine.ts)
- [x] STORY-020: API Endpoint GET /progress + Dashboard (progress.tsx)

**Extras implementados além do MVP:**
- [x] AI Panel (AIPanel.tsx) — Chat com Gemini sobre o projeto
- [x] Activity Log — Histórico de ações por projeto
- [x] Architecture Extraction — Extração de arquitetura via Gemini AI
- [x] GitHub Sync Automático — Job a cada 5 minutos
- [x] KanbanBoard — Visualização de stories em kanban
- [x] Alertas automáticos — gerados pelo AnalysisEngine
- [x] Glossário vivo — termos do projeto
- [x] Timeline de stories — visualização Gantt simplificado

### 🚀 Próximas Ações (v1.1)

1. ⏳ STORY-021-024: Agentes & Stories (Épico 5)
2. ⏳ Saúde do Código (análise estática avançada)
3. ⏳ Histórico de Evolução (snapshots diários)
4. ⏳ Multi-user com autenticação real

---

## 📝 LOG DE AÇÕES

### [2026-03-11] — Sessão 9 — 8 Melhorias Implementadas

**Descrição:**
Sessão de melhoria contínua — identificados 8 gaps reais e implementados em ciclos de planejamento + execução assíncrona.

**Melhorias implementadas:**

1. ✅ **PRD Viewer Completo** (commit `22ee440`)
   - Instalado react-markdown + remark-gfm + @tailwindcss/typography
   - Componente PRDViewer.tsx com modal fullscreen e botão copiar
   - Página [id].tsx: substituído `<pre>` 1000 chars por modal renderizado

2. ✅ **Trigger de Análise de Código** (commit `a165fa1`)
   - Endpoint `POST /api/projects/:id/analyze` criado
   - Função `analyzeProject()` no lib/api.ts
   - Card "Análise de Código" na página de detalhes do projeto

3. ✅ **Centralizar Mapa** (commit `934e2eb`)
   - Prop `onReady` adicionada ao HexagonMap
   - Função de center via D3 fitExtent + animação 500ms
   - Botão "Centralizar" funcional no map.tsx

4. ✅ **Fix Debug + Banner** (commit `2eaa804`)
   - 12 console.log/error removidos da página [id].tsx
   - Banner hardcoded "Arquivo importado com sucesso!" removido

5. ✅ **Dashboard com Stats** (commit `2eaa804`)
   - GET /projects retorna `_count.modules` e `github_repo_url`
   - Cards no dashboard mostram contagem de módulos e status GitHub

6. ✅ **Botão Analisar no Progress** (commit `a3824d1`)
   - Botão "🔍 Analisar Código" diretamente na página de progresso
   - Recarrega progresso automaticamente após análise

7. ✅ **Fix Timeline Type Safety** (commit `a3824d1`)
   - Removido `as any` cast na timeline
   - Interface Story alinhada com tipo da API

8. ✅ **Deploy + MODUS_OPERANDI** (esta sessão)
   - Documentação atualizada
   - Deploy via git push → Railway + Vercel CI/CD

---

### [Sessões 1-8] — Histórico Anterior

Ver commits anteriores no git log. Resumo: todo o MVP foi construído desde zero,
incluindo infraestrutura, auth, upload de PRD, mapa hexagonal com D3.js,
análise de código com Babel, GitHub sync, AI Panel com Gemini, e muito mais.

---

## 🔑 DECISÕES CRÍTICAS

- **Stack:** Next.js 14 + Express.js + PostgreSQL (Railway) + Vercel
- **Auth:** NextAuth.js v5 com CredentialsProvider (demo: test@example.com / 123456)
- **IA:** Gemini API para extração de arquitetura (não Claude, por custo)
- **Análise de código:** Babel Parser + heurísticas (não IA em v1)
- **Visualização:** D3.js v7 com force layout + hexágonos SVG

---

## 🌐 URLs de Produção

- **Frontend:** https://dev-factory-al5c.vercel.app
- **Backend:** https://dev-factory-al5c.up.railway.app
- **Health Check:** https://dev-factory-al5c.up.railway.app/api/health

---

## 📌 REFERÊNCIAS

- **Memória do projeto:** `/Users/guilhermesimas/.claude/projects/-Users-guilhermesimas-Documents-devfactory/memory/MEMORY.md`
- **PRD:** `docs/PRD.md`
- **Stories:** `docs/STORIES.md`
- **Arquitetura:** `docs/ARCHITECTURE.md`

---

**Mantido por:** Claude Code (Sessão 9)
**Última atualização:** 2026-03-11 — MVP completo + 8 melhorias
