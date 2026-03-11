# DevFactory — Product Requirements Document (PRD) — v1.1 REVISADO

**Versão:** 1.1 (Revisada por @pm)
**Data:** 01 de Março de 2026
**Autores:** Cláudio + Claude
**Status:** Pronto para Arquitetura
**Estimativa:** 8-10 semanas (MVP)

---

## 1. Visão Geral

### O que é o DevFactory?

DevFactory é um dashboard interativo que permite a qualquer pessoa — mesmo sem conhecimento técnico — acompanhar visualmente o progresso de projetos de software, entender como cada parte do sistema se conecta, e aprender sobre desenvolvimento no processo.

### Problema que resolve

Pessoas não-técnicas que usam agentes de IA (Cursor, Claude Code, Lovable, etc.) para construir software enfrentam três problemas críticos:

1. **Cegueira operacional** — Não sabem o que está pronto, o que falta, e o que está quebrado
2. **Perda de contexto** — A IA perde o fio da meada entre sessões, gerando código que diverge do objetivo original (PRD)
3. **Código frágil** — Sem conhecimento técnico, acumulam código desnecessário, inseguro e mal estruturado

**DevFactory resolve isso dando visibilidade total ao projeto através de um mapa visual interativo com explicações em linguagem acessível.**

### Proposta de valor

> "Você não precisa aprender a escrever código. Você precisa saber o que está sendo construído e por quê."

---

## 2. Público-alvo

### Versão 1 — Pessoal (Este PRD)

**Usuário primário:** Cláudio
**Tipo:** Empreendedor que usa agentes de IA para construir projetos (sites, apps, APIs, automações)
**Workflow:**
- Agentes criam PRD
- Quebram em stories
- Executam código
- Cláudio acompanha progresso no dashboard

**Necessidades:**
- Visibilidade clara do que está pronto
- Controle sobre desvios (código que não estava no PRD)
- Aprendizado passivo sobre os componentes do sistema
- Detecção de problemas antes de virar dívida técnica

---

## 3. Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|--------|-----------|--------------|
| Frontend | Next.js 14 + React 18 | SSR, roteamento, deploy fácil Vercel |
| Visualização | D3.js (v7) | Grafos robustos, comunidade grande, controle fino |
| Estilização | Tailwind CSS v3 | Rápido, responsivo, consistente |
| Backend | Node.js + Express | Mesmo ecossistema JS, simple, produção-ready |
| Banco de dados | PostgreSQL (Supabase ou Railway) | Relacional robusto, free tier suficiente v1 |
| Autenticação | NextAuth.js v5 | Preparado para multi-user (v2+) |
| Análise de código | Babel Parser + Tree-sitter | AST parsing sem executar código |
| IA (Futuro) | Claude API (Sonnet) | Glossário v1, análise avançada v2+ |
| Deploy | Vercel (frontend) + Railway (backend+DB) | Grátis/barato, escalável, CI/CD nativo |
| Versionamento | GitHub API (leitura) | Tracking de mudanças, commits |

---

## 4. Funcionalidades — Priorização MoSCoW

### ⭐ MUST HAVE (MVP — Sem isso não lança)

#### 4.1 Importação e Parsing de PRD
**Épico 2 — Prioridade 1**

- Upload de arquivo PRD (markdown ou texto)
- Parser automático que extrai: objetivo, módulos, stories esperadas, dependências
- Validação manual obrigatória (usuário aprova/ajusta árvore gerada)
- Gera modelo hierárquico: Projeto → Módulo → Componente → Tasks

**Racional:** Sem isso, não há árvore para comparar contra código.

**Gaps resolvidos:**
- ✅ Template de PRD fornecido junto com app (exemplo pronto)
- ✅ UI de validação intuitiva (arrastar, deletar, renomear)

---

#### 4.2 Mapa Hexagonal Interativo
**Épico 3 — Prioridade 1**

- Visualização do projeto como organograma de hexágonos conectados
- Cada hexágono representa um módulo (ex: "Autenticação", "API de Pagamentos")
- Sistema de cores por hierarquia: 🔴 Crítico | 🟠 Importante | 🔵 Necessário | 🟢 Desejável | ⚪ Opcional
- Barra de progresso em cada hexágono
- Interações:
  - Clique: expande painel lateral com componentes internos
  - Hover: preview rápido do status
  - Zoom/pan: navegação do mapa
  - Clique na cor: explica por que aquele nó tem aquela hierarquia

**Racional:** Visão macro do projeto. Primeira coisa que usuário vê.

**v1 simplificado:**
- ✅ D3.js com força de atração (graph força-based)
- ✅ Hexágonos como SVG paths
- ✅ Painel lateral HTML simples
- ⏭️ Linhas de dependência animadas = v1.1

---

#### 4.3 Progresso — PRD vs. Realidade
**Épico 4 — Prioridade 1**

**Fluxo:**
1. Integração com GitHub API: ler repositório do usuário
2. Análise estática com Babel Parser (JavaScript/TypeScript)
3. Detectar: rotas definidas, modelos de dados, funções/endpoints, componentes
4. Matching contra PRD: "Qual story do PRD corresponde a este código?"
5. Gerar % de progresso por módulo e geral

**Matching semântico (v1 — SIMPLIFICADO):**
- Compare nomes de funcionalidades com nomes de arquivos/funções
- Use heurísticas: `AuthController` ≈ "autenticação", `paymentService` ≈ "pagamentos"
- Marque como "Implementado" apenas se tiver código correspondente
- Marque como "Parcial" se tiver estrutura mas sem testes

**Detecção de desvios:**
- Código novo que não está no PRD original → listar como "Fora do escopo"
- Story do PRD com 0% progresso após X semanas → alerta

**Racional:** Core do app. Sem isso, é só um visualizador vazio.

**Observação crítica:**
- ❌ NÃO use Claude API em v1 para matching (caro, lento, impreciso)
- ✅ Use análise estática + heurísticas
- ⏭️ Claude API para matching avançado = v2

---

#### 4.4 Dashboard de Progresso
**Épico 4 — Continuação**

- Barra de progresso geral do projeto (0-100%)
- Progresso por módulo em cards
- Lista de stories: Concluídas | Em andamento | Pendentes | Bloqueadas
- Desvios detectados (% de código fora do PRD)
- Estimativa de esforço restante (baseado em velocity)

---

#### 4.5 Aba PRD — Documento Original
**Épico 4 — Continuação**

- Exibir o PRD original (markdown rendered)
- Marcar com ✅/⏳/❌ cada item conforme progresso
- Serve como "source of truth" visual

---

### 🟡 SHOULD HAVE (Importante, pode sair se apertar)

#### 4.6 Agentes e Stories
**Épico 5 — Prioridade 2**

- Timeline simples de stories executadas
- Filtros por status, agente, módulo
- Marca data de início/conclusão
- ⏭️ Detecção de retrabalho = v1.1

**Racional:** Menos crítico que progresso. Usuário consegue usar app sem isso.

---

#### 4.7 Alertas Inteligentes
**Épico 7 — Prioridade 2**

**Alertas básicos (v1):**
- Story marcada concluída mas código não encontrado
- Módulo com 0% progresso há 7+ dias
- Novo código que não corresponde a story do PRD

**Não incluir em v1:**
- Alertas de performance
- Detecção de dependências circulares
- Análise de complexidade

**Racional:** Primeiras 3 alertas resolvem 80% dos problemas.

---

#### 4.8 Dependências Externas
**Épico 10 — Prioridade 2**

- Checklist simples: variáveis de ambiente, chaves de API, domains, contas
- Status: Pendente | Configurado | Verificado
- Link para documentação de cada dependência

**Racional:** Reduz "esqueci de configurar X" syndrome.

---

### 🟢 COULD HAVE (Desejável, v1.1+)

#### 4.9 Saúde do Código
**Épico 6 — Prioridade 3**

**v1.1 — Análise estática apenas:**
- Código morto (funções nunca chamadas)
- Duplicação (blocos similares)
- Complexidade (funções > 50 linhas)
- Score de saúde (0-100)

**v2 — Com Claude API:**
- Segurança básica (senhas hardcoded, endpoints sem auth)
- Overcoding

**Racional:** Nice to have. Pode vir depois.

---

#### 4.10 Histórico de Evolução
**Épico 8 — Prioridade 3**

- Snapshots diários do estado do projeto (JSON)
- Timeline visual: "Semana 1: 10% → Semana 2: 25% → Semana 3: 45%"
- Gráfico de progresso ao longo do tempo

**Racional:** Visualiza tendências. Menos crítico que mapa e progresso.

---

#### 4.11 Glossário Vivo
**Épico 9 — Prioridade 3**

**v1 — Manual:**
- Usuário define termos do projeto manualmente
- Cada termo tem: definição, analogia, relevância
- Aba "Aprender" mostra todos os termos organizados por módulo

**v2 — Semi-automático:**
- Claude API extrai termos do código
- Gera definições automaticamente

**Racional:** Educativo, não crítico para funcionalidade.

---

### ❌ WON'T HAVE (Fora de v1)

- ❌ Ações no código via dashboard (gerar prompts para agentes)
- ❌ Análise avançada com Claude (vulnerabilidades, patterns)
- ❌ Multi-user com autenticação real
- ❌ Subscription/planos
- ❌ Integração com Cursor/Claude Code diretamente
- ❌ Escola de IA integrada

---

## 5. Modelo de Dados (Resumido)

```
Projeto
├── id, nome, repositório_url, pasta_local
├── prd_original (texto)
│
├── Módulo
│   ├── id, nome, hierarquia (crítico/importante/necessário/desejável/opcional)
│   ├── progresso_percentual
│   └── Componente
│       ├── nome, tipo, descrição
│       └── status (implementado/parcial/pendente)
│
├── Story
│   ├── id, título, módulo_id, status
│   ├── agente_responsável, data_início, data_conclusão
│
├── Alerta
│   ├── id, tipo, severidade, módulo_id, lido
│
└── Snapshot (histórico)
    ├── data, progresso_geral, dados_completos
```

**Schema PostgreSQL:** Será definido por @architect.

---

## 6. Requisitos Não-Funcionais

| Requisito | Especificação |
|-----------|--------------|
| Performance | Dashboard carrega < 3s (com cache) |
| Responsividade | Desktop (prioridade) + tablet |
| Acessibilidade | Cores WCAG AA, navegação teclado |
| Segurança | GitHub token criptografado, HTTPS, sem secrets em código |
| Escalabilidade | Suportar 50+ projetos com 100+ módulos cada |
| Disponibilidade | 99%+ uptime (Vercel + Railway) |
| Idioma | Português BR (i18n preparado para futuro) |

---

## 7. Estimativa Realista — Épicos

| # | Épico | Semanas | Bloqueadores | Responsável |
|---|-------|---------|-------------|-------------|
| 1 | Infraestrutura base | 1-1.5 | Nenhum | @devops |
| 2 | Importação de PRD | 1.5-2 | Nenhum | @dev |
| 3 | Mapa hexagonal | 2-2.5 | Épico 2 pronto | @dev (frontend) |
| 4 | Progresso (análise) | 2-2.5 | Épico 2, 3 prontos | @dev (backend) |
| 5 | Agentes/Stories | 1-1.5 | Épico 4 pronto | @dev |
| 6 | Saúde do código | 1 | Épico 4 pronto | @dev (⏭️ v1.1) |
| 7 | Alertas | 0.5-1 | Épico 4, 5 prontos | @dev |
| 8 | Histórico | 1-1.5 | Épico 4 pronto | @dev (⏭️ v1.1) |
| 9 | Glossário | 0.5-1 | Nenhum | @dev |
| 10 | Dependências ext. | 0.5-1 | Nenhum | @dev |
| — | **TOTAL MVP** | **8-10 semanas** | — | — |

**Com 1 dev full-time.** Épicos em paralelo onde possível (Épicos 6, 8, 9, 10 podem sair de v1 e ir para v1.1).

---

## 8. Riscos e Mitigações

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| **Análise estática imprecisa** — AST parser não detecta 100% do código | 🟡 MÉDIO | Use combinação: Babel + heurísticas de naming. Validação manual do usuário. v2 com Claude. |
| **Claude API costs** — Roda análises frequentemente | 🔴 CRÍTICO | ✅ NÃO usar em v1. Só análise estática. Claude apenas para glossário (barato). |
| **PRDs mal estruturados** — Parser gera árvore errada | 🟡 MÉDIO | Template padrão fornecido. Validação manual obrigatória. |
| **Deploy + secrets** — Railway/Vercel exigem setup | 🟡 MÉDIO | `.env.example` claro. Documentação passo-a-passo com screenshots. |
| **Escalação do mapa D3** — 100+ nós fica lento | 🟢 BAIXO | Começar com force-based simples. Otimizar depois se necessário. |
| **Falta de dados reais** — PRD exemplo não é suficiente | 🟢 BAIXO | Usar DevFactory para gerenciar DevFactory (inception). Feedback real rápido. |

---

## 9. Métricas de Sucesso (v1)

- ✅ Conseguir importar PRD e gerar árvore em < 5 minutos
- ✅ Progresso ter margem de erro < 20% vs. percepção manual
- ✅ Identificar 80%+ dos módulos e conexões do projeto
- ✅ Todas as explicações acessíveis para leigo
- ✅ Reduzir tempo gasto em "onde o projeto está?" de 30min → 2min
- ✅ Zero código morto não detectado

---

## 10. Dependências Críticas

1. **GitHub API access** — Usuário precisa gerar token (documentado)
2. **PostgreSQL setup** — Railway tem free tier, pronto-para-usar
3. **Vercel + Railway deploy** — Ambos têm free tier, CI/CD nativo
4. **Node.js 18+** — Standard
5. **Babel Parser + TypeScript Compiler API** — NPM packages, grátis

**Nenhuma dependência paga ou bloqueante em v1.**

---

## 11. Roadmap

| Fase | Foco | Duração |
|------|------|---------|
| **v1 (MVP)** | Mapa + Progresso básico | 8-10 sem |
| **v1.1** | Saúde do código + Histórico + UX polish | 2-3 sem |
| **v2** | Claude API integrada, análise avançada, alertas inteligentes | 4-6 sem |
| **v3** | Multi-user, autenticação real, planos | 4-6 sem |
| **v4** | Comunidade, marketplace, escola de IA | TBD |

---

## 12. Decisões Finalizadas (Handoff para @architect)

✅ **Definidas:**
- Stack: Next.js + Node + PostgreSQL + Vercel + Railway
- MVP: 5 Épicos must-have (reduzido de 10)
- Análise: estática em v1, Claude API em v2
- Estimativa: 8-10 semanas (revisada)
- Deploy: free tier ambas plataformas

⏳ **Pendente para @architect:**
- Schema PostgreSQL exato
- Endpoints API (lista completa)
- Arquitetura de cache (Redis necessário?)
- Fluxo de análise estática (Babel + heurísticas, detalhado)
- Modelo de dados completo com relações

---

**PRD pronto para arquitetura.**

---

*Ironicamente, o DevFactory será usado para gerenciar o desenvolvimento do próprio DevFactory (inception certified).*
