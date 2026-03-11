# DevFactory — Dependências por Story

> **Objetivo**: Mapear exatamente o que cada story precisa para não haver bloqueios

---

## ✅ CONCLUÍDAS (Épico 1 — Infraestrutura Base)

### STORY-001: Setup Next.js + TypeScript + Tailwind
- **Status**: ✅ DONE
- **Git**: `feat: [STORY-001] Setup Next.js com TypeScript + Tailwind`
- **Dependencies**: Nenhuma
- **Bloqueia**: STORY-002, STORY-004

### STORY-002: Setup Express Backend + TypeScript
- **Status**: ✅ DONE
- **Git**: `feat: [STORY-002] Setup Express backend com TypeScript`
- **Dependencies**: Nenhuma
- **Bloqueia**: STORY-003, STORY-005

### STORY-003: Prisma ORM + Schema Database
- **Status**: ✅ DONE
- **Git**: `feat: [STORY-003] Prisma schema com 8 modelos`
- **Dependencies**: STORY-002
- **Bloqueia**: STORY-005, STORY-006+

### STORY-004: Setup NextAuth.js + Login Simples
- **Status**: ✅ DONE
- **Git**: `feat: [STORY-004] Setup NextAuth.js com login simples`
- **Dependencies**: STORY-001
- **Bloqueia**: STORY-005, todas stories posteriores

---

## 🔄 PRÓXIMAS (Épico 1 continuação — Deploy)

### STORY-005: Deploy Vercel (Frontend)
- **Status**: ⏳ PRÓXIMA
- **O que fazer**: Conectar repositório GitHub e fazer deploy do Next.js
- **Dependencies**: 
  - ✅ STORY-001, STORY-004 (feitas)
  - ⏳ GitHub repositório criado
  - ⏳ Vercel conta + token
  - ⏳ NEXTAUTH_SECRET configurado
- **Bloqueia**: Nenhuma (paralelo é OK)
- **Duração estimada**: 15 min (config) + 5 min (deploy automático)
- **Pro Tip**: Pode pular se quiser continue localmente

---

### STORY-006-010: Importação de PRD (Épico 2)

#### STORY-006: Upload de Arquivo PRD
- **Status**: ⏳ READY (sem dependências externas)
- **O que fazer**: Criar form de upload + endpoint /api/prd/upload
- **Dependencies**: 
  - ✅ STORY-002, STORY-003, STORY-004 (feitas)
  - 🟢 Nenhuma externa
- **Bloqueia**: STORY-007
- **Duração**: 30 min

#### STORY-007: Parse PRD com Babel Parser
- **Status**: ⏳ READY
- **O que fazer**: Receber arquivo, parsear JSON, validar schema
- **Dependencies**:
  - ✅ STORY-006 (feita)
  - 🟢 Nenhuma externa (Babel já instalado)
- **Bloqueia**: STORY-008
- **Duração**: 25 min
- **Packages já instalado**: `@babel/parser`, `@babel/traverse`

#### STORY-008: Validar PRD contra Schema
- **Status**: ⏳ READY
- **O que fazer**: Validar estrutura, campos obrigatórios, tipos
- **Dependencies**:
  - ✅ STORY-007 (feita)
  - 🟢 Nenhuma externa (usar Zod ou JSON Schema)
- **Bloqueia**: STORY-009
- **Duração**: 20 min

#### STORY-009: Armazenar PRD no Banco
- **Status**: ⏳ READY
- **O que fazer**: INSERT na tabela Project + relacionados (Module, etc)
- **Dependencies**:
  - ✅ STORY-008 (feita)
  - ✅ STORY-003 (schema) — FEITA
  - ⏳ DATABASE_URL configurado (SQLite local OK por enquanto)
- **Bloqueia**: STORY-010, STORY-016+
- **Duração**: 25 min

#### STORY-010: Teste E2E Upload → DB
- **Status**: ⏳ READY
- **O que fazer**: Teste completo: upload → parse → validate → store
- **Dependencies**:
  - ✅ STORY-006 a STORY-009 (todas feitas)
  - ✅ SQLite rodando (local OK)
- **Bloqueia**: STORY-016 (análise depende disso)
- **Duração**: 30 min

---

## 🎨 PRÓXIMAS (Épico 3 — Mapa Hexagonal)

### STORY-011-015: Visualização Hexagonal

#### STORY-011: Estrutura de Componentes D3.js
- **Status**: ⏳ READY
- **O que fazer**: Criar componente React que renderiza hexágonos com D3.js
- **Dependencies**:
  - ✅ STORY-001 (Next.js) — FEITA
  - 🟢 D3.js (npm install d3)
  - 🟢 Nenhuma externa
- **Bloqueia**: STORY-012
- **Duração**: 40 min

#### STORY-012: Cores por Status (critical/important/necessary/...)
- **Status**: ⏳ READY
- **O que fazer**: Mapear status de módulos para cores, legenda
- **Dependencies**:
  - ✅ STORY-011 (feita)
  - 🟢 Tailwind colors (já configurado)
- **Bloqueia**: STORY-013
- **Duração**: 20 min

#### STORY-013: Interatividade (hover/click)
- **Status**: ⏳ READY
- **O que fazer**: Click em hexágono mostra detalhes, hover muda cor
- **Dependencies**:
  - ✅ STORY-012 (feita)
  - 🟢 Nenhuma externa
- **Bloqueia**: STORY-014
- **Duração**: 25 min

#### STORY-014: Animação de Carregamento
- **Status**: ⏳ READY
- **O que fazer**: Animar hexágonos ao aparecer, transições suaves
- **Dependencies**:
  - ✅ STORY-013 (feita)
  - 🟢 Framer Motion ou CSS (já suportados)
- **Bloqueia**: STORY-015
- **Duração**: 20 min

#### STORY-015: Integração com Dados do Banco
- **Status**: ⏳ READY
- **O que fazer**: Fetch modules do banco → renderizar hexágonos
- **Dependencies**:
  - ✅ STORY-009 (dados no banco) — FEITA
  - ✅ STORY-014 (visual pronto) — será feita
  - ⏳ Endpoint GET /api/projects/{id}/modules (será criado)
- **Bloqueia**: STORY-016
- **Duração**: 30 min

---

## 📊 PRÓXIMAS (Épico 4 — Análise de Progresso)

### STORY-016-020: Matching + Heurísticas + Claude API

#### STORY-016: Extração de Funções do Código
- **Status**: ⏳ READY
- **O que fazer**: Usar Babel Parser para extrair funções, classes, exports
- **Dependencies**:
  - ✅ STORY-002 (código backend) — FEITA
  - 🟢 Babel já instalado
  - 🟢 Nenhuma externa
- **Bloqueia**: STORY-017
- **Duração**: 35 min

#### STORY-017: Heurísticas de Matching (v1)
- **Status**: ⏳ READY
- **O que fazer**: Comparar nome função com nome tarefa (fuzzy match)
- **Dependencies**:
  - ✅ STORY-009 (tarefas no banco) — FEITA
  - ✅ STORY-016 (funções extraídas) — será feita
  - 🟢 npm: `fuse.js` (fuzzy search)
- **Bloqueia**: STORY-018
- **Duração**: 30 min

#### STORY-018: Cálculo de Progresso por Módulo
- **Status**: ⏳ READY
- **O que fazer**: % = (histórias matched / total) * 100
- **Dependencies**:
  - ✅ STORY-017 (matching) — será feita
  - ✅ STORY-015 (hexágonos com dados) — será feita
- **Bloqueia**: STORY-019
- **Duração**: 20 min

#### STORY-019: Armazenar Resultados de Análise
- **Status**: ⏳ READY
- **O que fazer**: INSERT em AnalysisResult + Snapshot
- **Dependencies**:
  - ✅ STORY-018 (cálculos) — será feita
  - ✅ STORY-003 (schema) — FEITA
  - ⏳ DATABASE_URL (SQLite local OK)
- **Bloqueia**: STORY-020
- **Duração**: 25 min

#### STORY-020: Geração de Glossário com Claude API
- **Status**: ⏳ REQUER CONFIG
- **O que fazer**: Enviar termos → Claude → gerar definições + analogias
- **Dependencies**:
  - ✅ STORY-009 (extrair termos do PRD) — FEITA
  - 🔴 **ANTHROPIC_API_KEY** (precisa ser configurado)
  - 🟢 npm: `@anthropic-ai/sdk` (instalar antes)
- **Bloqueia**: Nenhuma (final do MVP)
- **Duração**: 30 min
- **Custo**: ~$0.10-0.50 por rodada (glossário é baixo volume)

---

## 🎯 RESUMO: O Que Você Precisa Fazer AGORA

Para **não bloquear nenhuma story** dos próximos passos:

### Imediato (próximas 2 horas):
```
[ ] Crie conta Vercel (GitHub login é mais fácil)
[ ] Crie conta Railway (GitHub login)
[ ] No Railway, crie novo projeto e adicione PostgreSQL service
[ ] Copie a CONNECTION_STRING PostgreSQL fornecida
[ ] Crie conta Anthropic (opcional mas recomendado)
[ ] Gere API Key
```

### Depois (antes de STORY-020):
```
[ ] Crie repositório GitHub (devfactory)
[ ] Configure remote local: git remote add origin https://github.com/YOUR_USER/devfactory.git
[ ] git push -u origin main (para fazer backup)
```

### NO CÓDIGO (eu faço):
```
[ ] Atualizar apps/web/.env.local com segredos quando pronto
[ ] Atualizar apps/api/.env com DATABASE_URL PostgreSQL
[ ] Instalar @anthropic-ai/sdk quando chegar em STORY-020
[ ] Criar GitHub Actions workflow para deploy (STORY-005)
```

---

## 🚀 Próximo Passo

**Opção A (Recomendado)**: Configure Vercel + Railway agora, continue com STORY-006
- Leva 30 min de setup
- Libera STORY-005 quando pronto
- Não bloqueia STORY-006-015

**Opção B (Rápido)**: Pule STORY-005, continue com STORY-006-015 localmente
- STORY-006-015 rodam perfeitamente em SQLite local
- Deploy vem depois
- Só volta em STORY-020 para Anthropic API

Qual você quer fazer?
