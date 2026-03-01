# DevFactory — Roadmap Executivo

**Status do MVP**: 4/20 stories ✅ | 20% completo | Sem bloqueios conhecidos

---

## 📊 Status Geral

```
Épico 1 — Infraestrutura Base (4 stories)
├─ [x] STORY-001: Setup Next.js (30 min)
├─ [x] STORY-002: Setup Express (25 min)
├─ [x] STORY-003: Prisma + Schema (40 min)
├─ [x] STORY-004: NextAuth + Login (45 min)
└─ [ ] STORY-005: Deploy Vercel (20 min) — PRONTO, aguarda config

Épico 2 — Importação PRD (5 stories)
├─ [ ] STORY-006: Upload PRD (30 min)
├─ [ ] STORY-007: Parse Babel (25 min)
├─ [ ] STORY-008: Validar Schema (20 min)
├─ [ ] STORY-009: Store DB (25 min)
└─ [ ] STORY-010: E2E Test (30 min)

Épico 3 — Mapa Hexagonal (5 stories)
├─ [ ] STORY-011: D3.js Components (40 min)
├─ [ ] STORY-012: Colors/Status (20 min)
├─ [ ] STORY-013: Interactivity (25 min)
├─ [ ] STORY-014: Animation (20 min)
└─ [ ] STORY-015: Database Integration (30 min)

Épico 4 — Análise de Progresso (5 stories)
├─ [ ] STORY-016: Babel Code Extraction (35 min)
├─ [ ] STORY-017: Fuzzy Matching (30 min)
├─ [ ] STORY-018: Progress Calc (20 min)
├─ [ ] STORY-019: Store Analysis (25 min)
└─ [ ] STORY-020: Claude Glossary API (30 min) — Requer API key

Épico 5 (v1.1 — Futuro)
└─ [ ] Alertas, Stories Timeline, Tracking (removido do MVP)
```

---

## 🎯 Próxima Ação — Escolha 1:

### **Opção A: Setup Rápido (RECOMENDADO)**
Deploy em produção já, depois continua com features

```
1. Configure Vercel + Railway + PostgreSQL (30 min)
2. Faça STORY-005 (Deploy) — 20 min
3. Continue com STORY-006 em paralelo (Épico 2)
```

**Resultado**: Infraestrutura pronta, sistema em produção, zero bloqueios

---

### **Opção B: Feature-First (RÁPIDO)**
Pule deploy agora, foque em features localmente

```
1. Faça STORY-006 a 010 (Épico 2 — Importação PRD)
2. Faça STORY-011 a 015 (Épico 3 — Mapa Hexagonal)
3. Faça STORY-016 a 019 (Épico 4 — Análise)
4. Deploy depois em STORY-005 (quando estiver 100% pronto)
```

**Resultado**: MVP completo localmente, deploy vem ao final

---

## 🔧 Integrações: O Que Você Precisa Fazer

### Antes de STORY-005 (opcional se pular):
- [ ] Vercel account + token
- [ ] Railway account + token  
- [ ] PostgreSQL connection string

### Antes de STORY-020 (obrigatório):
- [ ] Anthropic API key

### Recomendado (não bloqueia nada):
- [ ] GitHub repositório (backup)

---

## ⏱️ Estimativa Total (20 stories)

| Épico | Stories | Duração Est. | Status |
|-------|---------|------------|--------|
| 1 | 5 | 2.5h | ✅ 4/5 DONE |
| 2 | 5 | 2.5h | ⏳ READY |
| 3 | 5 | 2.5h | ⏳ READY |
| 4 | 5 | 2.5h | ⏳ READY |
| **TOTAL** | **20** | **10h** | **20% DONE** |

> **Paralelo possível**: Épicos 2, 3, 4 podem rodar em paralelo (sem dependência real). Épico 1 é sequencial.

---

## 📋 Arquivos de Referência

- `docs/INTEGRATIONS.md` — Guia completo de integrações (Vercel, Railway, PostgreSQL, Anthropic, GitHub)
- `docs/STORY_DEPENDENCIES.md` — Mapa story-by-story com todas as dependências
- `docs/PRD.md` — Product Requirements Document
- `docs/ARCHITECTURE.md` — Arquitetura técnica completa
- `docs/STORIES.md` — Lista de 20 stories do MVP

---

## 💬 Resumo: Próximas 48h

**Se fizer Opção A** (Setup + Deploy):
- Hoje: Configure Vercel + Railway (30 min) + STORY-005 (20 min)
- Amanhã: STORY-006 a 010 (2.5h)
- Amanhã+: STORY-011 a 020 (7.5h)

**Se fizer Opção B** (Feature-First):
- Hoje: STORY-006 a 008 (1.5h)
- Amanhã: STORY-009 a 015 (2.5h)
- Próximo: STORY-016 a 020 (2.5h) + Deploy (20 min)

---

## 🚀 Comande Agora

Qual opção você prefere?

```
A → Setup Vercel + Railway (30 min) + continue STORY-005
B → Skip deploy, faça STORY-006-010 (features)
```

Digita a letra!
