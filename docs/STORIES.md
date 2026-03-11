# DevFactory — Stories & Backlog (MVP)

**Versão:** 1.1 (Revisado — MVP Agressivo)
**Data:** 01 de Março de 2026
**Scrum Master:** River
**Status:** 🔴 Todas Pendentes
**Total de Stories:** 20 (MVP) + 4 (v1.1)
**Estimativa Total:** 8-10 semanas (com 1 dev full-time)

---

## 📊 Índice por Épico

| Épico | Stories | Estimativa | Agente |
|-------|---------|-----------|--------|
| 1 — Infraestrutura Base | STORY-001 a STORY-005 | 1-1.5 sem | @dev, @devops |
| 2 — Importação de PRD | STORY-006 a STORY-010 | 1.5-2 sem | @dev |
| 3 — Mapa Hexagonal | STORY-011 a STORY-015 | 2-2.5 sem | @dev |
| 4 — Análise de Progresso | STORY-016 a STORY-020 | 2-2.5 sem | @dev |
| — | **TOTAL MVP** | **8-10 sem** | — |

**Fora do MVP (v1.1):**
- Épico 5 — Agentes & Stories (STORY-021 a STORY-024) — Será feito depois

---

## 🟢 Ordem de Execução (Respeita Dependências)

```
Semana 1: STORY-001 → STORY-002 → STORY-003 → STORY-004 → STORY-005
Semana 2: STORY-006 → STORY-007 → STORY-008 → STORY-009 → STORY-010
Semana 3-4: STORY-011 → STORY-012 → STORY-013 → STORY-014 → STORY-015
Semana 5-6: STORY-016 → STORY-017 → STORY-018 → STORY-019 → STORY-020
Semana 7-8: STORY-021 → STORY-022 → STORY-023 → STORY-024
Semana 9-10: Polish, testes, deploy final
```

---

# ÉPICO 1 — Infraestrutura Base

**Foco:** Setup de tecnologias, banco de dados, deploy básico
**Duração:** 1-1.5 semanas
**Bloqueador:** Nada depende antes deste épico
**Próximo:** Épico 2 (PRD Import)

---

## STORY-001: Setup Next.js com TypeScript + Tailwind

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟢 Simples
**Depende de:** Nada
**Módulo:** Épico 1 — Infraestrutura
**Semana:** 1

### Descrição
Criar projeto Next.js 14 do zero com TypeScript, ESLint e Tailwind CSS configurados. Estrutura de pastas pronta (pages, components, lib, styles).

### Critérios de Aceite
- [ ] Next.js 14 inicializado com `create-next-app`
- [ ] TypeScript strict mode configurado (`tsconfig.json`)
- [ ] ESLint + Prettier configurados
- [ ] Tailwind CSS v3 instalado e funcionando
- [ ] Pasta `/public` e `/docs` criadas
- [ ] `package.json` com scripts: dev, build, lint, typecheck
- [ ] `.gitignore` adequado (`.env.local`, `node_modules`, `.next`)
- [ ] Componente teste renderizando em `http://localhost:3000`

### Arquivos Envolvidos
- `package.json` (criado)
- `tsconfig.json` (criado)
- `next.config.js` (criado)
- `.eslintrc.json` (criado)
- `tailwind.config.js` (criado)
- `pages/index.tsx` (criado)
- `.gitignore` (criado)

### Notas Técnicas
- Use template default do `create-next-app`
- Adicionar scripts para `npm run typecheck`
- Estrutura de pastas: `/apps/web`

---

## STORY-002: Setup Express Backend com Prisma

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-001 (estrutura de pastas)
**Módulo:** Épico 1 — Infraestrutura
**Semana:** 1

### Descrição
Criar servidor Express.js com TypeScript, Prisma ORM, middleware básico (error handler, logger). Estrutura de serviços pronta.

### Critérios de Aceite
- [ ] Node.js + Express instalado
- [ ] TypeScript configurado para backend
- [ ] Prisma ORM instalado (sem banco ainda)
- [ ] Middleware básico: `errorHandler`, `logger`
- [ ] Estrutura de pastas: `/apps/api/src/{routes, services, middleware, models, utils}`
- [ ] Rota teste: `GET /health` retorna `{ status: "ok" }`
- [ ] Servidor rodando em `http://localhost:5000`
- [ ] `package.json` com scripts: dev, build, start

### Arquivos Envolvidos
- `/apps/api/package.json` (criado)
- `/apps/api/tsconfig.json` (criado)
- `/apps/api/src/index.ts` (criado)
- `/apps/api/src/middleware/errorHandler.ts` (criado)
- `/apps/api/src/middleware/logger.ts` (criado)
- `/apps/api/src/routes/health.ts` (criado)

### Notas Técnicas
- Express simples, sem frameworks adicionais
- Middleware em separado para reutilização
- Porta: 5000 (dev), 3001 (produção)

---

## STORY-003: Configurar PostgreSQL + Prisma Schema

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-002 (Prisma instalado)
**Módulo:** Épico 1 — Infraestrutura
**Semana:** 1

### Descrição
Configurar banco PostgreSQL (localmente ou Railway), criar schema Prisma com todas as 8 tabelas (projects, modules, components, stories, alerts, analysis_results, snapshots, glossary_terms). Migrations pronta.

### Critérios de Aceite
- [ ] PostgreSQL rodando (local ou Railway)
- [ ] Arquivo `.env` com `DATABASE_URL` configurado
- [ ] Schema Prisma criado em `prisma/schema.prisma`
- [ ] Todas as 8 tabelas definidas com relações corretas
- [ ] Indexes criados conforme ARCHITECTURE.md
- [ ] Migration inicial executada: `prisma migrate dev --name init`
- [ ] Prisma Client gerado
- [ ] `npx prisma studio` mostra tabelas vazias

### Arquivos Envolvidos
- `prisma/schema.prisma` (criado)
- `prisma/migrations/` (criado automaticamente)
- `.env.example` (criado, com DATABASE_URL placeholder)
- `.env.local` (criado, com valor real)

### Notas Técnicas
- Usar Railway free tier ou PostgreSQL local
- Schema exato em ARCHITECTURE.md seção 3
- Não popular dados ainda

---

## STORY-004: Setup NextAuth.js + Login Simples

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-001 (Next.js)
**Módulo:** Épico 1 — Infraestrutura
**Semana:** 1

### Descrição
Integrar NextAuth.js v5 com autenticação básica (CredentialsProvider). Páginas: `/login`, `/dashboard` (protegida). Middleware de auth.

### Critérios de Aceite
- [ ] NextAuth.js v5 instalado
- [ ] `pages/api/auth/[...nextauth].ts` criado
- [ ] CredentialsProvider com hardcoded user (demo)
- [ ] JWT strategy configurado
- [ ] `pages/login.tsx` com formulário simples
- [ ] `pages/dashboard.tsx` com `useSession()` + redirect se não autenticado
- [ ] `middleware.ts` validando tokens
- [ ] `.env.local` com `NEXTAUTH_SECRET`

### Arquivos Envolvidos
- `pages/api/auth/[...nextauth].ts` (criado)
- `pages/login.tsx` (criado)
- `pages/dashboard.tsx` (criado)
- `middleware.ts` (criado)
- `.env.example` (atualizado com NEXTAUTH_SECRET)

### Notas Técnicas
- Demo user: email: `test@example.com` / password: `123456`
- v1: não validar contra banco (será v2)
- JWT secret: gerar com `openssl rand -base64 32`

---

## STORY-005: Deploy Vercel (Frontend) + Railway (Backend)

**Status:** 🔴 Pendente
**Agente:** @devops
**Complexidade:** 🟡 Médio
**Depende de:** STORY-001, STORY-002, STORY-003, STORY-004
**Módulo:** Épico 1 — Infraestrutura
**Semana:** 1.5

### Descrição
Configurar deploy: Next.js → Vercel, Express + PostgreSQL → Railway. CI/CD básico com GitHub Actions. Variáveis de ambiente em cada plataforma.

### Critérios de Aceite
- [ ] GitHub repositório criado e conectado
- [ ] Vercel conectado ao repositório (`main` branch)
- [ ] Railway projeto criado com PostgreSQL
- [ ] Railway conectado ao repositório (`main` branch)
- [ ] Variáveis de ambiente setadas em Vercel: `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`
- [ ] Variáveis de ambiente setadas em Railway: `DATABASE_URL`, `JWT_SECRET`
- [ ] Deploy inicial bem-sucedido em ambas plataformas
- [ ] Frontend acessível em `https://devfactory.vercel.app` (ou seu domínio)
- [ ] Backend acessível em `https://{railway-app}.up.railway.app`

### Arquivos Envolvidos
- `.github/workflows/deploy.yml` (criado)
- `vercel.json` (criado)
- `railway.toml` (criado)
- `.env.example` (finalizado)

### Notas Técnicas
- Vercel auto-detecta Next.js
- Railway auto-detecta Node.js + PostgreSQL
- GitHub: criar personal access token
- Primeiro deploy pode demorar 5-10 min

---

# ÉPICO 2 — Importação de PRD

**Foco:** Upload, parsing, validação e persistência de PRD
**Duração:** 1.5-2 semanas
**Bloqueador:** Épico 1 (infraestrutura)
**Próximo:** Épico 3 (mapa hexagonal)

---

## STORY-006: Criar Página de Upload de PRD (Frontend)

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟢 Simples
**Depende de:** STORY-005 (deploy funcionando)
**Módulo:** Épico 2 — Importação
**Semana:** 2

### Descrição
Página `/projects` com formulário: input de arquivo (markdown/texto), submit, feedback visual. Enviar arquivo para backend via `POST /api/projects/import-prd`.

### Critérios de Aceite
- [ ] Página `/projects.tsx` criada
- [ ] Input file: aceita `.md` e `.txt`
- [ ] Botão "Importar PRD"
- [ ] Loading state durante upload
- [ ] Mensagem de sucesso/erro
- [ ] Chamada `POST /api/projects/import-prd` com FormData
- [ ] Redirecionamento para dashboard após sucesso

### Arquivos Envolvidos
- `pages/projects.tsx` (criado)
- `components/UploadForm.tsx` (criado)
- `lib/api.ts` (atualizado com `uploadPRD()`)

### Notas Técnicas
- Tailwind para estilização
- `<input type="file" accept=".md,.txt" />`
- FormData para enviar arquivo

---

## STORY-007: Endpoint Backend para Receber PRD

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟢 Simples
**Depende de:** STORY-005, STORY-006
**Módulo:** Épico 2 — Importação
**Semana:** 2

### Descrição
Rota `POST /api/projects/import-prd` que recebe arquivo, valida tipo (md/txt), armazena arquivo temporário, retorna `{ projectId, status: 'uploaded' }`.

### Critérios de Aceite
- [ ] Rota criada em `routes/projects.ts`
- [ ] Middleware de validação (apenas .md/.txt)
- [ ] Arquivo salvo em `/tmp` ou S3 (por enquanto local)
- [ ] Retorna `{ projectId, status }`
- [ ] Erro se tipo inválido: `{ error: 'Invalid file type' }`
- [ ] Teste manual com `curl` ou Postman

### Arquivos Envolvidos
- `src/routes/projects.ts` (criado)
- `src/middleware/validateFile.ts` (criado)
- `src/utils/fileStorage.ts` (criado)

---

## STORY-008: Parser de Markdown → Estrutura JSON

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-007
**Módulo:** Épico 2 — Importação
**Semana:** 2

### Descrição
Função `parsePRDMarkdown(content: string)` que extrai: título, visão, módulos (hierarquia), stories, dependências. Retorna `{ projeto, módulos, stories }` estruturado.

### Critérios de Aceite
- [ ] Parser detecta cabeçalhos (H1, H2, H3)
- [ ] Extrai "Visão" (primeira seção)
- [ ] Extrai "Módulos" com hierarquia (Crítico/Importante/etc)
- [ ] Extrai "Stories" com dependências
- [ ] Retorna JSON estruturado
- [ ] Trata PRDs malformados gracefully (retorna parcial com warnings)
- [ ] Teste com PRD de exemplo

### Arquivos Envolvidos
- `src/utils/prdParser.ts` (criado)
- `src/types/index.ts` (atualizado com tipos PRD)
- `tests/prdParser.test.ts` (criado)

### Notas Técnicas
- Usar regex ou biblioteca `remark` (markdown parser)
- Não use IA, análise estática apenas
- Suportar formato simples (não necessário suportar todo markdown complexo)

---

## STORY-009: Criar Módulos no Banco a partir de PRD Parseado

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-008
**Módulo:** Épico 2 — Importação
**Semana:** 2

### Descrição
Função que pega saída do parser e cria registros em PostgreSQL: insere projeto, cria módulos com hierarquia, cria componentes vazios. Retorna `projectId` pronto.

### Critérios de Aceite
- [ ] Function `createProjectFromParsedPRD(parsedData, userId)`
- [ ] Insere em `projects` table com `prd_original` (JSONB)
- [ ] Insere módulos em `modules` table com hierarquia
- [ ] Insere componentes em `components` table (status: 'pending')
- [ ] Retorna `projectId`
- [ ] Transação: tudo ou nada (rollback se falhar)
- [ ] Teste com dados reais

### Arquivos Envolvidos
- `src/services/ProjectService.ts` (criado)
- `src/models/index.ts` (Prisma models)

### Notas Técnicas
- Usar Prisma `$transaction` para atomicidade
- User ID: por enquanto hardcoded (v2 = autenticação real)

---

## STORY-010: UI de Validação da Árvore Parseada

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-009
**Módulo:** Épico 2 — Importação
**Semana:** 2

### Descrição
Dashboard após upload: mostra árvore de módulos extraída do PRD, permite user: deletar nós, renomear, ajustar hierarquia. Botão "Confirmar" → salva no banco.

### Critérios de Aceite
- [ ] Página `/projects/:id/validate` mostra árvore como lista ou árvore
- [ ] Cada nó pode ser expandido (collapse/expand)
- [ ] Botão delete por nó (com confirmação)
- [ ] Input editar nome do nó
- [ ] Dropdown para mudar hierarquia (Crítico → Importante)
- [ ] Botão "Confirmar" → POST `/api/projects/:id/validate` → salva
- [ ] Feedback visual: "Salvo com sucesso"

### Arquivos Envolvidos
- `pages/projects/[id]/validate.tsx` (criado)
- `components/TreeEditor.tsx` (criado)
- `lib/api.ts` (função `validateProjectTree()`)
- `src/routes/projects.ts` (endpoint POST `/projects/:id/validate`)

---

# ÉPICO 3 — Mapa Hexagonal

**Foco:** Visualização D3.js, interações, componentes internos
**Duração:** 2-2.5 semanas
**Bloqueador:** Épico 2 (módulos no banco)
**Próximo:** Épico 4 (análise)

---

## STORY-011: Setup D3.js + Hook useD3

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-001 (Next.js)
**Módulo:** Épico 3 — Mapa Hexagonal
**Semana:** 3

### Descrição
Instalar D3.js v7, criar hook `useD3` que gerencia SVG, force simulation. Componente teste renderiza.

### Critérios de Aceite
- [ ] `npm install d3` no frontend
- [ ] Hook `hooks/useD3.ts` criado
- [ ] Hook aceita render function e dependencies
- [ ] Hook retorna ref para SVG
- [ ] Componente teste `<D3Test />` renderiza círculos em força
- [ ] Zoom/pan funciona
- [ ] Sem erros no console

### Arquivos Envolvidos
- `hooks/useD3.ts` (criado)
- `components/D3Test.tsx` (criado, será deletado depois)

### Notas Técnicas
- D3 v7+ com módulos (import específico)
- Tipo `SVGSVGElement` para ref
- Evitar re-renders desnecessários

---

## STORY-012: Hexagon Shape SVG Rendering

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-011
**Módulo:** Épico 3 — Mapa Hexagonal
**Semana:** 3

### Descrição
Função que desenha hexágonos em D3 com dados `{ id, nome, progresso, hierarquia }`. Cores por hierarquia, barra de progresso interna.

### Critérios de Aceite
- [ ] Função `drawHexagon(d3Selection, data)`
- [ ] Cada hexágono é grupo SVG com path (forma hexágono) + text
- [ ] Cores: Crítico (vermelho) | Importante (laranja) | Necessário (azul) | Desejável (verde) | Opcional (cinza)
- [ ] Progresso visualizado como barra dentro hexágono
- [ ] Hover: mudança de cor (highlight)
- [ ] Click-ready (evento pronto para binding)

### Arquivos Envolvidos
- `components/HexagonMap.tsx` (criado)
- `lib/hexagon.ts` (função drawHexagon)
- `constants/colors.ts` (paleta de cores)

### Notas Técnicas
- Hexágono: path SVG (6 pontos)
- Progresso: barra `<rect>` animada
- Sem animações complexas (performance)

---

## STORY-013: Force Layout + Conexões entre Módulos

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🔴 Complexo
**Depende de:** STORY-012
**Módulo:** Épico 3 — Mapa Hexagonal
**Semana:** 3

### Descrição
Integrar `d3.forceSimulation` com dados de módulos. Desenhar linhas conectando módulos dependentes. Animação da simulação suave.

### Critérios de Aceite
- [ ] Dados: array de nós (módulos) + array de links (dependências)
- [ ] Force layout: charge, link distance, center force
- [ ] Linhas SVG conectando nós
- [ ] Simulação rodando e convergindo
- [ ] Performance: < 100ms por frame (60 FPS)
- [ ] Testado com 30+ módulos
- [ ] Sem lag visível

### Arquivos Envolvidos
- `components/HexagonMap.tsx` (atualizado)
- `lib/forceLayout.ts` (simulação isolada)

### Notas Técnicas
- Parâmetros: charge = -300, linkDistance = 100
- Tick listener atualiza posições cada frame
- Debate: fixar nó central? (Por enquanto não)

---

## STORY-014: Clique no Hexágono → Painel Lateral

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟢 Simples
**Depende de:** STORY-012
**Módulo:** Épico 3 — Mapa Hexagonal
**Semana:** 3

### Descrição
Ao clicar hexágono, painel lateral abre mostrando: nome módulo, descrição, lista de componentes internos, % progresso.

### Critérios de Aceite
- [ ] Listener de click em hexágonos
- [ ] Estado: `selectedModuleId`
- [ ] Painel lateral renderizado se algo selecionado
- [ ] Painel mostra: nome, descrição, componentes (com status)
- [ ] Botão close no painel
- [ ] Painel fica à direita (% da tela)
- [ ] Sem quebra do layout

### Arquivos Envolvidos
- `components/HexagonMap.tsx` (atualizado)
- `components/SidePanel.tsx` (criado)
- `components/ComponentsList.tsx` (criado)

---

## STORY-015: Zoom + Pan + Interações

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-013
**Módulo:** Épico 3 — Mapa Hexagonal
**Semana:** 3.5

### Descrição
Implementar zoom (scroll wheel) e pan (drag no canvas). Reset button para voltar ao zoom 1x. Tooltip ao hover.

### Critérios de Aceite
- [ ] Zoom: scroll wheel muda scale (0.5x a 3x)
- [ ] Pan: drag no SVG move view
- [ ] Botão "Reset Zoom" retorna 1x
- [ ] Tooltip ao hover mostra nome + progresso
- [ ] Zoom suave, não jerky
- [ ] Sem bugs com múltiplas interações simultâneas

### Arquivos Envolvidos
- `components/HexagonMap.tsx` (atualizado)
- `lib/d3-behaviors.ts` (zoom, pan behavior)

---

# ÉPICO 4 — Análise de Progresso

**Foco:** GitHub integration, Babel parsing, heurísticas, progresso calculation
**Duração:** 2-2.5 semanas
**Bloqueador:** Épico 2 (módulos no banco) + Épico 3 (visualização)
**Próximo:** Épico 5 (agentes/stories)

---

## STORY-016: GitHub Clone + File Reading

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-005 (deploy pronto)
**Módulo:** Épico 4 — Análise
**Semana:** 4

### Descrição
Função que faz clone de repositório GitHub (via API ou git), lê arquivos JavaScript/TypeScript localmente, retorna conteúdo.

### Critérios de Aceite
- [ ] Função `cloneGitHubRepo(repoUrl, githubToken)`
- [ ] Usa GitHub API (não git CLI, para evitar deps pesadas)
- [ ] Cria pasta temporária `/tmp/devfactory-{projectId}`
- [ ] Baixa arquivos `.js`, `.ts`, `.jsx`, `.tsx`
- [ ] Retorna: `{ files: [{path, content}, ...] }`
- [ ] Cleanup: delete `/tmp/` depois
- [ ] Suporta private repos (com token)

### Arquivos Envolvidos
- `src/utils/githubFetcher.ts` (criado)
- `src/types/index.ts` (tipos de resposta)

### Notas Técnicas
- GitHub API: `GET /repos/{owner}/{repo}/contents/`
- Recursivo para subpastas
- Ignore node_modules, .git
- Rate limit: 5000 requests/hora com token

---

## STORY-017: Babel Parser — Extract AST

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-016
**Módulo:** Épico 4 — Análise
**Semana:** 4

### Descrição
Parser que usa Babel para extrair AST de cada arquivo, identifica: funções (export), componentes (React), rotas (Express), modelos.

### Critérios de Aceite
- [ ] Instalar `@babel/parser`
- [ ] Função `parseFiles(files)` retorna AST por arquivo
- [ ] Traverse AST para encontrar:
  - FunctionDeclarations (export)
  - ExportDefaultDeclaration
  - VariableDeclaration (const)
  - ClassDeclaration
- [ ] Extrai nome, tipo, linha onde foi encontrado
- [ ] Retorna: `{ type, name, file, line }`
- [ ] Trata syntax errors gracefully

### Arquivos Envolvidos
- `src/utils/babelParser.ts` (criado)
- `src/types/index.ts` (tipos Pattern)

### Notas Técnicas
- Babel: `import * as parser from '@babel/parser'`
- Plugins: typescript, jsx
- Não executar código, apenas parse

---

## STORY-018: Heurísticas de Matching PRD vs Code

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟡 Médio
**Depende de:** STORY-017
**Módulo:** Épico 4 — Análise
**Semana:** 4

### Descrição
Função `scoreMatch(prdItem, codeItem)` que retorna 0-100 de confiança se código implementa item do PRD. Usa: substring, fuzzy, pattern matching.

### Critérios de Aceite
- [ ] Exact match (100): `"autenticação"` == `"autenticacao"`
- [ ] Substring match (80): `"user"` ⊃ `"createUser"`
- [ ] Fuzzy match (60-75): Levenshtein distance < 3
- [ ] Pattern match (70): regex patterns (auth, user, payment)
- [ ] Retorna score 0-100
- [ ] Testado com 20+ exemplos reais

### Arquivos Envolvidos
- `src/utils/heuristics.ts` (criado)
- `tests/heuristics.test.ts` (criado)

### Notas Técnicas
- Implementar Levenshtein distance (ou usar lib `string-similarity`)
- Ignorecase sempre
- Pattern mapping em constantes

---

## STORY-019: Analysis Engine — Full Pipeline

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🔴 Complexo
**Depende de:** STORY-016, STORY-017, STORY-018
**Módulo:** Épico 4 — Análise
**Semana:** 4.5

### Descrição
Serviço que orquestra: clone → parse → extract → match → score → store resultados no DB. Calcula % progresso por módulo.

### Critérios de Aceite
- [ ] Classe `AnalysisEngine` com método `analyze(projectId, repoUrl, token)`
- [ ] 1. Clone repositório (STORY-016)
- [ ] 2. Parse arquivos (STORY-017)
- [ ] 3. Extract patterns
- [ ] 4. Match contra PRD (STORY-018)
- [ ] 5. Store em `analysis_results` table
- [ ] 6. Update `modules.progress_percentage`
- [ ] 7. Gera alertas se necessário
- [ ] Retorna: `{ success, module_progress, alerts }`

### Arquivos Envolvidos
- `src/services/AnalysisEngine.ts` (criado)
- `src/routes/analysis.ts` (criado)

### Notas Técnicas
- Assíncrono (pode demorar 30s - 5min)
- Não bloquear, usar background job (futuro)
- Por enquanto: wait for completion

---

## STORY-020: API Endpoint GET /progress + Dashboard

**Status:** 🔴 Pendente
**Agente:** @dev
**Complexidade:** 🟢 Simples
**Depende de:** STORY-019
**Módulo:** Épico 4 — Análise
**Semana:** 5

### Descrição
Endpoint `GET /api/projects/:id/progress` retorna % geral + por módulo + desvios. Frontend dashboard mostra barras de progresso.

### Critérios de Aceite
- [ ] Endpoint criado em `routes/projects.ts`
- [ ] Resposta: `{ overall: 45, by_module: {auth: 80, api: 30}, deviations: [] }`
- [ ] Frontend: página `/dashboard` mostra:
  - Barra de progresso geral
  - Cards por módulo com % e barra
  - Lista de stories: concluídas | pendentes
- [ ] Atualizar hexágonos do mapa com cores baseado em progresso
- [ ] Polling automático a cada 30s (ou manual button)

### Arquivos Envolvidos
- `src/routes/projects.ts` (endpoint GET /progress)
- `pages/dashboard.tsx` (atualizado)
- `components/ProgressBar.tsx` (criado)
- `components/ModuleCard.tsx` (criado)

---

# 📋 Resumo de Dependências

```
STORY-001 (Next.js) ─┐
STORY-002 (Express) ─┼→ STORY-005 (Deploy)
STORY-003 (DB)    ──┼→        ↓
STORY-004 (Auth)  ──┘    STORY-006 (Upload)
                         ↓
                    STORY-007 (Endpoint)
                    ↓
                    STORY-008 (Parser)
                    ↓
                    STORY-009 (Save to DB)
                    ↓
                    STORY-010 (Validation UI) ─┐
                                                ├→ STORY-011 (D3.js)
STORY-001 (Next.js) ───────────────────────────┤  ↓
                                                ├→ STORY-012 (Hexagon)
                    STORY-001 ─────────────────┤  ↓
                                                └→ STORY-013 (Forces)
                                                   ↓
                                            STORY-014 (Panel)
                                            ↓
                                            STORY-015 (Zoom/Pan)

                    STORY-010 ──→ STORY-016 (GitHub Clone)
                    ↓                      ↓
                    STORY-009 ──→ STORY-017 (Babel Parser)
                                  ↓
                                  STORY-018 (Heuristics)
                                  ↓
                                  STORY-019 (Analysis Engine)
                                  ↓
                                  STORY-020 (Progress API)

MVP COMPLETO ✅
```

**Fora do MVP (v1.1):**
- STORY-021: Stories CRUD
- STORY-022: Stories List
- STORY-023: Timeline
- STORY-024: Alertas

---

# ✅ Checklist de Inicialização

Antes de começar STORY-001:
- [ ] Projeto criado em `/Users/guilhermesimas/Documents/devfactory/`
- [ ] GitHub repo inicializado
- [ ] Node.js 18+ instalado
- [ ] Vercel account criado e conectado
- [ ] Railway account criado
- [ ] Documentação lida: PRD.md, ARCHITECTURE.md

---

# 📈 Progresso do Projeto

| Status | Count | % |
|--------|-------|---|
| 🔴 Pendente | 20 | 100% |
| 🟡 Em Progresso | 0 | 0% |
| 🟢 Concluído | 0 | 0% |
| ⏸️ Bloqueado | 0 | 0% |

**Total Estimado (MVP):** 8-10 semanas | **Semanas Decorridas:** 0 | **Semanas Restantes:** 8-10

**v1.1 (Fora do MVP):** 4 stories (Épico 5) — Timeline, Alertas, Stories CRUD

---

*River, removendo obstáculos 🌊*

**✅ MVP PRONTO PARA @dev COMEÇAR COM STORY-001!**
