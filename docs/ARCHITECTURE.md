# DevFactory — Architecture Document (v1.0)

**Versão:** 1.0
**Data:** 01 de Março de 2026
**Arquiteto:** Aria
**Status:** Pronto para Stories
**Baseado em:** PRD v1.1 (revisado por @pm)

---

## 1. Diagrama de Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                     │
│  Pages: /dashboard, /projects, /settings                     │
│  Components: HexagonMap (D3), ProgressBar, AlertsList        │
│  State: React Context + localStorage                         │
│  Deploy: Vercel                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │ HTTPS
                   ↓
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express.js)                    │
│  /api/projects, /api/modules, /api/analysis, /api/alerts    │
│  Services: ProjectService, AnalysisEngine, AlertEngine       │
│  Middleware: Auth (NextAuth), ErrorHandler, Logger           │
│  Deploy: Railway                                             │
└──────────────┬──────────────────────┬────────────────────────┘
               │                      │
               ↓                      ↓
    ┌──────────────────┐    ┌──────────────────┐
    │   PostgreSQL     │    │   GitHub API     │
    │   (Railway)      │    │  (Read-only)     │
    │                  │    │                  │
    │ Tables:          │    │ - Clone repo     │
    │ - projects       │    │ - List commits   │
    │ - modules        │    │ - Read files     │
    │ - components     │    │                  │
    │ - stories        │    │ Token: env var   │
    │ - alerts         │    │                  │
    │ - snapshots      │    └──────────────────┘
    │ - glossary_terms │
    └──────────────────┘
               ↑
               │
    ┌──────────────────┐
    │  Analysis Engine │
    │                  │
    │ 1. Babel Parser  │──→ Extract AST
    │ 2. Heuristics    │──→ Match PRD vs Code
    │ 3. Store Results │──→ DB
    └──────────────────┘
```

---

## 2. Stack Técnico — Decisões Justificadas

### Frontend: Next.js 14 + React 18

**Por que Next.js?**
- SSR permite page meta tags (importante para accessibility)
- Roteamento file-based simples
- Deploy Vercel = 1 comando
- TypeScript nativo
- Suporta middleware (autenticação)
- Zero-config com TypeScript + ESLint

**Alternativas rejeitadas:**
- ❌ Create React App — sem SSR, deployment manual
- ❌ Vue/Nuxt — linguagem diferente, aprende curva
- ✅ Next.js — default ideal para startups

**Componentes principais:**
- `/pages/dashboard` — Mapa hexagonal + progresso
- `/pages/projects` — Lista de projetos
- `/api/webhooks` — Integração com GitHub (futuro)
- `/components/HexagonMap` — D3.js rendering
- `/components/ProgressBar` — Barra visual
- `/lib/api.ts` — Client HTTP

---

### Visualização: D3.js v7

**Por que D3?**
- Controle fino sobre SVG
- Força-directed graphs nativamente
- Comunidade grande, documentação
- Alternativa (React Flow) é overkill para MVP

**Implementação:**
- `useD3` hook custom para montar/atualizar gráfo
- Dados: array de nós {id, nome, progresso, hierarquia}
- Força de atração entre nós conectados
- Zoom/pan via `d3-zoom`

**Não usar:** Animações complexas em v1 (custo de performance)

---

### Backend: Node.js + Express

**Por que Express?**
- Simples, familiar, production-ready
- Middleware pattern é natural
- Fácil de testar
- Ecossistema JS (mesmo como frontend)

**Alternativas rejeitadas:**
- ❌ NestJS — overhead para MVP
- ❌ FastAPI (Python) — linguagem diferente
- ✅ Express — pragmático

**Estrutura:**
```
src/
├── routes/
│   ├── projects.ts
│   ├── modules.ts
│   ├── analysis.ts
│   └── alerts.ts
├── services/
│   ├── ProjectService.ts
│   ├── AnalysisEngine.ts
│   ├── AlertEngine.ts
│   └── GlossaryService.ts
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── logger.ts
├── models/
│   ├── Project.ts
│   ├── Module.ts
│   └── Alert.ts
├── utils/
│   ├── parser.ts (Babel)
│   └── heuristics.ts
└── index.ts
```

---

### Banco de Dados: PostgreSQL

**Por que PostgreSQL?**
- ACID guarantees (importante para progresso)
- JSON columns para armazenar PRD original
- Índices para queries rápidas
- Railway free tier adequado
- Suporta full-text search (glossário futuro)

**Alternativas rejeitadas:**
- ❌ MongoDB — sem necessidade de flexibilidade de schema
- ❌ SQLite — não escalável para future v2+
- ✅ PostgreSQL — default seguro

**Conexão:**
- Use `pg` library (ou `prisma` para ORM)
- Connection pooling via Railway
- `.env` com `DATABASE_URL`

---

### Análise Estática: Babel Parser + Heurísticas

**Por que Babel?**
- Parser AST padrão JavaScript/TypeScript
- Rápido, confiável
- Npm: `@babel/parser`

**Alternativa (Tree-sitter):**
- ❌ Complexo, overhead para v1
- ✅ Babel suficiente

**Pipeline de análise:**

```
1. DOWNLOAD CODE
   ├── git clone (GitHub API)
   └── Extract arquivos .ts/.js

2. PARSE AST
   ├── Babel parser → AST completo
   └── Extrai: funções, rotas, componentes

3. EXTRACT PATTERNS
   ├── Procura por rotas (Express: router.get/post)
   ├── Procura por componentes (React: export default)
   ├── Procura por models (classes, interfaces)
   └── Procura por funções (export function)

4. MATCHING HEURÍSTICO
   ├── Nome da função ≈ nome no PRD?
   ├── Exemplo: "createUser" → "usuários"
   ├── Simples: substring matching + fuzzy
   └── Confidence score (0-100%)

5. STORE RESULTS
   ├── Save to DB
   ├── Calculate % per module
   └── Store confidence scores

6. ALERT GENERATION
   ├── PRD item sem código? → ALERT
   ├── Código sem PRD item? → ALERT
   └── Store in alerts table
```

**Heurísticas implementadas:**

```javascript
// patterns/naming.ts

// Mapeamento de padrões esperados
const PATTERN_MAPPING = {
  'auth': /auth|login|register|password|jwt/i,
  'pagamentos': /payment|stripe|invoice|billing/i,
  'usuarios': /user|profile|account|member/i,
  'api': /endpoint|route|controller|handler/i,
  'banco': /database|db|model|schema|migration/i,
};

// Função de scoring
function scoreMatch(prdfunctionality: string, codeFunction: string): number {
  const prdLower = pdfFunctionality.toLowerCase();
  const codeLower = codeFunction.toLowerCase();

  // Exact match = 100
  if (prdLower === codeLower) return 100;

  // Substring match = 80
  if (codeLower.includes(prdLower) || prdLower.includes(codeLower)) return 80;

  // Fuzzy match (Levenshtein) = 60-75
  const distance = levenshtein(prdLower, codeLower);
  if (distance < 3) return 75;
  if (distance < 5) return 60;

  // Pattern match = 70
  for (const [pattern, regex] of Object.entries(PATTERN_MAPPING)) {
    if (regex.test(prdLower) && regex.test(codeLower)) {
      return 70;
    }
  }

  return 0; // No match
}
```

---

## 3. Schema PostgreSQL (DDL)

```sql
-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  repository_url VARCHAR(500),
  local_folder VARCHAR(500),
  prd_original JSONB NOT NULL, -- Armazena PRD completo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Modules (hexágonos)
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  hierarchy VARCHAR(50) NOT NULL, -- 'critical', 'important', 'necessary', 'desirable', 'optional'
  parent_module_id INTEGER REFERENCES modules(id),
  progress_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Components (dentro de módulos)
CREATE TABLE components (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'function', 'component', 'route', 'model'
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'partial', 'implemented'
  code_reference VARCHAR(500), -- Arquivo onde foi encontrado
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stories (tarefas do PRD)
CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  epic VARCHAR(100), -- Ex: 'epic-2', 'epic-3'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  agent_responsible VARCHAR(100), -- 'dev', 'qa', 'devops'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- 'story_without_code', 'code_without_story', 'stagnation'
  severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high'
  message TEXT NOT NULL,
  module_id INTEGER REFERENCES modules(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analysis Results (histórico de análises)
CREATE TABLE analysis_results (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id),
  analyzed_function VARCHAR(255),
  prd_item VARCHAR(255),
  match_confidence DECIMAL(3, 2), -- 0.0 - 1.0
  analysis_data JSONB, -- Dados completos da análise
  created_at TIMESTAMP DEFAULT NOW()
);

-- Snapshots (histórico do progresso)
CREATE TABLE snapshots (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  overall_progress DECIMAL(5, 2),
  snapshot_data JSONB, -- Estado completo nesse momento
  created_at TIMESTAMP DEFAULT NOW()
);

-- Glossary Terms
CREATE TABLE glossary_terms (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  term VARCHAR(255) NOT NULL,
  definition TEXT NOT NULL,
  analogy TEXT,
  relevance TEXT,
  is_explored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, term)
);

-- Indexes para performance
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_modules_project_id ON modules(project_id);
CREATE INDEX idx_components_module_id ON components(module_id);
CREATE INDEX idx_stories_project_id ON stories(project_id);
CREATE INDEX idx_alerts_project_id ON alerts(project_id);
CREATE INDEX idx_alerts_unread ON alerts(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_analysis_project_module ON analysis_results(project_id, module_id);
```

---

## 4. Endpoints REST da API

### Projects

```http
GET /api/projects
  Response: { projects: Project[] }
  Headers: Authorization: Bearer {token}

POST /api/projects
  Body: { name: string, description?: string, repository_url?: string }
  Response: { id, name, ... }

GET /api/projects/:id
  Response: { id, name, description, prd_original, modules: Module[] }

PUT /api/projects/:id
  Body: { name?, description?, prd_original? }
  Response: { ...updated project }

DELETE /api/projects/:id
  Response: { success: true }
```

### Modules & Components

```http
GET /api/projects/:id/modules
  Query: ?hierarchy=critical,important (filtro opcional)
  Response: { modules: ModuleWithComponents[] }

POST /api/projects/:id/modules
  Body: { name, description, hierarchy, parent_module_id? }
  Response: { id, name, ... }

PUT /api/projects/:id/modules/:moduleId
  Body: { name?, description?, hierarchy?, progress_percentage? }
  Response: { ...updated module }

POST /api/projects/:id/modules/:moduleId/components
  Body: { name, type, description }
  Response: { id, name, ... }
```

### Analysis & Progress

```http
POST /api/projects/:id/analyze
  Body: {
    repository_url: string,
    github_token?: string
  }
  Response: {
    status: "analyzing",
    job_id: string
  }
  Note: Análise é assíncrona. Polling via WebSocket ou GET /api/analysis/:jobId

GET /api/projects/:id/progress
  Response: {
    overall_percentage: 45,
    by_module: {
      "auth": 80,
      "api": 45,
      ...
    },
    stories: {
      completed: 12,
      in_progress: 5,
      pending: 23
    }
  }

GET /api/projects/:id/deviations
  Response: {
    code_without_story: [...],
    story_without_code: [...]
  }
```

### Stories & Tracking

```http
GET /api/projects/:id/stories
  Query: ?status=pending,in_progress&agent=dev
  Response: { stories: Story[] }

POST /api/projects/:id/stories
  Body: { title, description, epic, status, agent_responsible }
  Response: { id, ... }

PUT /api/projects/:id/stories/:storyId
  Body: { status?, agent_responsible?, completed_at? }
  Response: { ...updated story }
```

### Alerts

```http
GET /api/projects/:id/alerts
  Query: ?read=false (listar apenas não lidos)
  Response: { alerts: Alert[], unread_count: 5 }

PUT /api/projects/:id/alerts/:alertId
  Body: { is_read: true }
  Response: { is_read: true }
```

### Glossary

```http
GET /api/projects/:id/glossary
  Response: { terms: GlossaryTerm[] }

POST /api/projects/:id/glossary
  Body: { term, definition, analogy?, relevance? }
  Response: { id, term, ... }

PUT /api/projects/:id/glossary/:termId
  Body: { is_explored: true }
  Response: { ...updated term }
```

---

## 5. Padrões de Código Backend

### Service Layer Pattern

```typescript
// services/ProjectService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProjectService {
  static async getProjectWithModules(projectId: number) {
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        modules: {
          include: {
            components: true,
          },
        },
      },
    });
  }

  static async createProject(data: {
    name: string;
    description?: string;
    repository_url?: string;
    prd_original: object;
  }) {
    return await prisma.project.create({ data });
  }

  // ... mais métodos
}
```

### Analysis Engine

```typescript
// services/AnalysisEngine.ts

import * as parser from '@babel/parser';
import * as traverse from '@babel/traverse';
import { scoreMatch } from '../utils/heuristics';

export class AnalysisEngine {
  static async analyzeRepository(
    projectId: number,
    githubToken: string,
    repositoryUrl: string
  ) {
    try {
      // 1. Clone repositório
      const repoPath = await this.cloneRepository(repositoryUrl, githubToken);

      // 2. Parse arquivos
      const files = await this.getJavaScriptFiles(repoPath);
      const ast = await this.parseFiles(files);

      // 3. Extract patterns
      const patterns = await this.extractPatterns(ast);

      // 4. Match com PRD
      const project = await this.getProject(projectId);
      const matches = await this.matchPatterns(patterns, project.prd_original);

      // 5. Store results
      await this.storeAnalysisResults(projectId, matches);

      // 6. Calculate progress
      await this.calculateProgress(projectId);

      return { success: true, results: matches };
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  private static async parseFiles(files: string[]): Promise<AST[]> {
    return files.map((file) => {
      const code = fs.readFileSync(file, 'utf-8');
      return parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });
    });
  }

  private static async extractPatterns(asts: AST[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    asts.forEach((ast) => {
      traverse.default(ast, {
        FunctionDeclaration(path) {
          patterns.push({
            type: 'function',
            name: path.node.id.name,
            file: path.key,
          });
        },
        ExportDefaultDeclaration(path) {
          if (path.node.declaration.type === 'FunctionDeclaration') {
            patterns.push({
              type: 'component',
              name: path.node.declaration.id.name,
              file: path.key,
            });
          }
        },
        CallExpression(path) {
          if (
            path.node.callee.property &&
            (path.node.callee.property.name === 'get' ||
              path.node.callee.property.name === 'post')
          ) {
            patterns.push({
              type: 'route',
              name: `${path.node.callee.property.name.toUpperCase()} ${path.node.arguments[0].value}`,
              file: path.key,
            });
          }
        },
      });
    });

    return patterns;
  }

  private static matchPatterns(patterns: Pattern[], prd: any): Match[] {
    const matches: Match[] = [];

    patterns.forEach((pattern) => {
      prd.modules.forEach((module: any) => {
        const confidence = scoreMatch(module.name, pattern.name);
        if (confidence > 50) {
          matches.push({
            pattern,
            module,
            confidence: confidence / 100,
          });
        }
      });
    });

    return matches;
  }
}
```

### Error Handler Middleware

```typescript
// middleware/errorHandler.ts

export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      code: statusCode,
      message,
      timestamp: new Date().toISOString(),
    },
  });
};
```

### Logging

```typescript
// middleware/logger.ts

export const logger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
};
```

---

## 6. Padrões Frontend

### React Hooks para D3

```typescript
// hooks/useD3.ts

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export const useD3 = (renderFn: (svg: d3.Selection<any, any, any, any>) => void, dependencies: any[]) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);
      renderFn(svg);
    }
  }, dependencies);

  return ref;
};
```

### HexagonMap Component

```typescript
// components/HexagonMap.tsx

import React from 'react';
import * as d3 from 'd3';
import { useD3 } from '../hooks/useD3';
import { Module } from '../types';

interface Props {
  modules: Module[];
  onModuleClick: (module: Module) => void;
}

export const HexagonMap: React.FC<Props> = ({ modules, onModuleClick }) => {
  const ref = useD3(
    (svg) => {
      // Simulated force layout
      const simulation = d3.forceSimulation(modules)
        .force('link', d3.forceLink().distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(400, 300));

      // Hexagon rendering
      const hexagons = svg
        .selectAll('g.hexagon')
        .data(modules)
        .enter()
        .append('g')
        .attr('class', 'hexagon')
        .on('click', (event, d) => onModuleClick(d));

      // Atualizar posições durante simulação
      simulation.on('tick', () => {
        hexagons.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });
    },
    [modules]
  );

  return <svg ref={ref} width={800} height={600} />;
};
```

---

## 7. Fluxo de Dados Críticos

### 1. Upload de PRD → Parsing → Árvore

```
User seleciona arquivo PRD
  ↓
Frontend (Next.js): POST /api/projects/:id/import-prd
  ↓
Backend (Express):
  1. Recebe arquivo
  2. Parse markdown/texto
  3. Extract estrutura (módulos, stories)
  4. Salva em projects.prd_original (JSONB)
  5. Cria módulos em modules table
  ↓
Database (PostgreSQL):
  INSERT INTO modules (project_id, name, hierarchy, progress)
  ↓
Frontend: Re-fetch modules
  ↓
D3.js renderiza hexágonos
```

### 2. Análise de Código → Matching → Progresso

```
User clica "Analisar Código"
  ↓
Frontend: POST /api/projects/:id/analyze
  ↓
Backend (assíncrono):
  1. Clone repositório via GitHub API
  2. Babel Parser extrai AST
  3. Heurísticas fazem matching
  4. Salva em analysis_results table
  5. Calcula progress_percentage por módulo
  ↓
Database: UPDATE modules SET progress_percentage = ?
           INSERT INTO alerts WHERE...
  ↓
Frontend (polling): GET /api/projects/:id/progress
  ↓
UI atualiza: hexágonos ficam verde (80%) / amarelo (50%) / vermelho (0%)
```

### 3. Detecção de Alertas

```
Após análise, Engine gera alertas:

1. Story sem código:
   - PRD lista "Autenticação"
   - Código não tem nada com "auth"
   - INSERT INTO alerts: "Autenticação sem código"

2. Código sem story:
   - Código tem função "sendEmail"
   - PRD não menciona "email"
   - INSERT INTO alerts: "sendEmail fora do escopo"

3. Stagnação:
   - Módulo em 30% por 7+ dias
   - INSERT INTO alerts: "Progresso estagnado"

Frontend polling: GET /api/projects/:id/alerts?read=false
UI mostra badges vermelhos
```

---

## 8. Decisões Arquiteturais — Trade-offs

| Decisão | Escolhido | Alternativa | Por quê? |
|---------|-----------|-------------|---------|
| Frontend framework | Next.js | React SPA | SSR + routing file-based |
| Visualização | D3.js | React Flow | Controle fino, comunidade |
| Backend | Express | NestJS | Simplicidade, velocidade |
| Banco | PostgreSQL | MongoDB | ACID, relações, índices |
| Análise | Babel | Tree-sitter | Babel é suficiente, menos overhead |
| Deploy frontend | Vercel | AWS | 1 comando, CI/CD nativo |
| Deploy backend | Railway | Heroku | Grátis, escalável, simples |
| Autenticação | NextAuth | Auth0 | Simples, self-hosted ready |
| ORM | Prisma | TypeORM | Simples, type-safe, migrations |

---

## 9. Performance & Caching

### Frontend Caching

```
- Cache de módulos no localStorage (invalidar on upload novo PRD)
- Cache de progresso por 5 minutos
- Virtualization para listas > 100 items (via react-window)
```

### Backend Caching

```
- Redis (futuro v1.1): cache de analysis results
- Database indexes em: project_id, module_id, status
- Query optimization: N+1 prevention via JOIN
```

### D3 Performance

```
- Limite máximo de nós renderizados: 150
- Se > 150 nós: fazer zoom automático para subgraph
- Debounce de zoom/pan events
```

---

## 10. Segurança

### Autenticação

```typescript
// NextAuth.js setup
export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validar credentials
        // Hash password com bcrypt
        // Retornar user ou null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};
```

### GitHub Token Encryption

```typescript
// Armazenar token criptografado no DB
import crypto from 'crypto';

function encryptToken(token: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY!);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptToken(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY!);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Input Validation

```typescript
// Zod schema para validação
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  repository_url: z.string().url().optional(),
  prd_original: z.record(z.any()), // Validar estrutura mais rigorosa depois
});

// Uso em API route:
const validated = CreateProjectSchema.parse(req.body);
```

---

## 11. Estrutura de Pastas do Projeto

```
devfactory/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── pages/
│   │   │   ├── index.tsx       # Página inicial
│   │   │   ├── dashboard.tsx   # Dashboard principal
│   │   │   ├── projects.tsx    # Lista de projetos
│   │   │   └── api/            # API routes (NextAuth, webhooks)
│   │   ├── components/
│   │   │   ├── HexagonMap.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── AlertsList.tsx
│   │   │   └── SidePanel.tsx
│   │   ├── hooks/
│   │   │   ├── useD3.ts
│   │   │   └── useApi.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   ├── styles/
│   │   │   └── globals.css (Tailwind)
│   │   └── public/
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── projects.ts
│       │   │   ├── modules.ts
│       │   │   ├── analysis.ts
│       │   │   └── alerts.ts
│       │   ├── services/
│       │   │   ├── ProjectService.ts
│       │   │   ├── AnalysisEngine.ts
│       │   │   └── AlertEngine.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── errorHandler.ts
│       │   │   └── logger.ts
│       │   ├── models/
│       │   │   └── index.ts    # Prisma schema
│       │   ├── utils/
│       │   │   ├── parser.ts
│       │   │   └── heuristics.ts
│       │   └── index.ts        # App setup
│       └── .env.example
│
├── docs/
│   ├── PRD.md                  # PRD v1.1
│   ├── ARCHITECTURE.md         # Este arquivo
│   └── STORIES.md              # Stories (criado por @sm)
│
├── package.json                # Root workspace
├── .gitignore
├── .env.example
└── README.md
```

---

## 12. Roadmap de Implementação (Épicos)

### Épico 1 — Infraestrutura Base (1-1.5 semanas)

- Setup Next.js + Tailwind
- Setup Express + Prisma
- PostgreSQL setup em Railway
- Vercel deploy (shell vazio)
- NextAuth.js básico

### Épico 2 — Importação de PRD (1.5-2 semanas)

- Upload UI para arquivo PRD
- Parser markdown
- Validação manual de árvore
- Salvar em DB

### Épico 3 — Mapa Hexagonal (2-2.5 semanas)

- D3.js setup
- Renderizar hexágonos
- Interações: clique, hover
- Painel lateral dinâmico

### Épico 4 — Análise de Progresso (2-2.5 semanas)

- GitHub clone + parsing
- Babel AST extraction
- Heurísticas matching
- Progress calculation

### Épico 5 — Agentes/Stories (1-1.5 semanas)

- UI de stories
- Timeline simples
- Filtros

---

## 13. Riscos Arquiteturais & Mitigações

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| **Análise estática imprecisa** | 🟡 MÉDIO | Confidence scores. Validação manual. v2 com Claude. |
| **D3 performance com 100+ nós** | 🟢 BAIXO | Test early. Subgraph zoom. Virtualization. |
| **GitHub API rate limit** | 🟡 MÉDIO | Cache análises. Usar token pessoal (higher limit). |
| **PostgreSQL connection limit** | 🟢 BAIXO | Railway free tier adequado. Connection pooling. |
| **Babel parser não suporta nova syntax** | 🟢 BAIXO | Plugins Babel. Fallback para regex se parse falhar. |

---

## 14. Próximas Ações

✅ **Arquitetura pronta.**

⏳ **Próximo:** @sm quebra Épicos em stories executáveis.

**Perguntas para @sm:**
- Como você priorizaria os Épicos? (Recomendação: 1 → 2 → 3 → 4 → 5)
- Cada Épico vira um story ou vários stories?
- Como rastreamos dependências entre stories?

---

**Arquitetura validada por @architect. Pronta para story breakdown.**

---

*Aria, arquitetando o futuro 🏗️*
