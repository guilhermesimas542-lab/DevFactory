# DevFactory — AI-Powered Project Management & Analysis Platform

🚀 **Status**: MVP Complete (20/20 Stories) — Ready for Production

---

## O que é DevFactory?

**DevFactory** é uma plataforma que transforma **especificações de produtos** (PRD) em **planos de desenvolvimento** estruturados e **acompanha o progresso** do projeto em tempo real via GitHub.

### Problema que resolve:
- 📄 Documentação de PRD fica "morta" — não sincroniza com código
- 🔄 Risco de divergência entre plano e implementação
- ❌ Falta visibilidade: qual story está feita? qual está bloqueada?

### Solução:
- 📤 **Upload do PRD** (Markdown) → plataforma extrai stories automaticamente
- 🗺️ **Mapa hexagonal interativo** (D3.js) mostrando hierarquia de módulos
- 📊 **Dashboard de progresso** atualizado em tempo real via GitHub webhooks
- 🤖 **Análise automática de código** para detectar stories completas
- 📚 **Base de conhecimento** integrada para onboarding

---

## 🎯 Features do MVP

### ✅ Core Features (20 Stories)

| Épico | Feature | Status |
|-------|---------|--------|
| **1** | Infraestrutura (Next.js, Express, Prisma, Deploy) | ✅ |
| **2** | Upload & Parse de PRD → Stories | ✅ |
| **3** | Mapa Hexagonal Interativo (D3.js) | ✅ |
| **4** | Análise de Progresso (GitHub + Code Analysis) | ✅ |

### ✅ Features Adicionais Implementadas

- 🔗 **GitHub Webhook Integration** — Stories atualizam automaticamente via commits
- 🤖 **Multi-LLM Support** — Groq (free tier) + Gemini fallback
- 📚 **Learning/Knowledge Base** — Documentação integrada
- 🎨 **Design System** — Dark theme completo
- 🖱️ **Model Selector** — Cursor-style LLM switcher
- 🌳 **Cascading Detail Panel** — Navegação hierárquica

---

## 🏗️ Arquitetura

### Tech Stack

```
Frontend (Next.js 14 + React 18)
├─ Pages: /projects, /projects/[id], /learn, etc
├─ Components: D3.js HexagonMap, TreeEditor, AIPanel
├─ Auth: NextAuth.js
└─ Styling: Tailwind CSS + Dark Theme

Backend (Express + Node.js)
├─ API Routes: /api/projects, /api/webhooks, /api/chat
├─ Database: Prisma ORM + PostgreSQL
├─ Services: ArchitectureService, AnalysisEngine, AIProviderFactory
└─ Integrations: GitHub API, Groq/Gemini LLMs

Deployment
├─ Frontend: Vercel (auto-deploy)
├─ Backend: Railway (auto-deploy)
└─ Database: Railway PostgreSQL
```

### Database Schema

```
Users → Projects → Modules → Components
                → Stories
                → Snapshots (analysis results)
                → GlossaryTerms
                → ActivityLogs
```

---

## 🚀 Getting Started

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/guilhermesimas542-lab/DevFactory.git
cd devfactory

# Instale dependências
npm install

# Configure variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Configure banco de dados (SQLite em dev)
npm run -w apps/api db:push

# Inicie em desenvolvimento
npm run dev
```

### Endpoints Principais

```bash
# Frontend
http://localhost:3000

# API
http://localhost:5000/api/health

# Webhook (GitHub → DevFactory)
POST http://localhost:5000/api/webhooks/github
```

---

## 🔗 GitHub Integration Setup

### 1. Gerar Personal Access Token

1. Vá para GitHub → Settings → Developer settings → Personal access tokens
2. Clique em "Generate new token (classic)"
3. Selecione permissões: `repo` + `admin:repo_hook`
4. Copie o token (não será mostrado novamente)

### 2. Conectar no DevFactory

1. Abra seu projeto
2. Vá para "Integração GitHub"
3. Cole:
   - URL do repositório: `https://github.com/seu-usuario/seu-repo`
   - Personal Access Token: `ghp_xxxxxxxxxxxx`
4. Clique em "Conectar com GitHub"

### 3. Fazer Commits com Story References

```bash
# Iniciar trabalho em uma story
git commit -m "feat: story-001 - implement user login"

# Marcar como concluída
git commit -m "done: story-003 - write documentation"

# Corrigir story concluída
git commit -m "fix: story-001 - fix login bug"
```

**Resultado**: Stories são atualizadas automaticamente em tempo real! 🎉

---

## 📊 Como Usar

### Fluxo Típico

```
1. Criar Projeto
   ↓
2. Upload do PRD (Markdown)
   ↓
3. DevFactory parse → cria stories automaticamente
   ↓
4. Validar hierarquia de módulos (Tree Editor)
   ↓
5. Ver mapa hexagonal interativo
   ↓
6. Conectar GitHub repository
   ↓
7. Dev faz commits com story-ref
   ↓
8. Dashboard atualiza em tempo real
   ↓
9. Análise de progresso automática
```

### Padrões de Commit Reconhecidos

| Padrão | Ação |
|--------|------|
| `feat: story-001 ...` | Marca como `in_progress` |
| `done: story-001 ...` | Marca como `completed` |
| `fix: story-001 ...` | Marca como `completed` |

---

## 🧪 Testing

```bash
# ESLint
npm run -w apps/web lint

# TypeScript
npm run -w apps/web tsc --noEmit
npm run -w apps/api tsc

# Build
npm run -w apps/web build
npm run -w apps/api build
```

---

## 📖 Documentação

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Decisões técnicas e padrões
- **[docs/GITHUB_INTEGRATION.md](docs/GITHUB_INTEGRATION.md)** — Setup detalhado de webhooks
- **[docs/PRODUCTION-CHECKLIST.md](docs/PRODUCTION-CHECKLIST.md)** — Verificação de produção
- **[docs/PROGRESS.md](docs/PROGRESS.md)** — Histórico de desenvolvimento
- **[ROADMAP.md](ROADMAP.md)** — Roadmap e próximos passos

---

## ⚙️ Variáveis de Ambiente

### Backend (`apps/api/.env`)
```env
DATABASE_URL=postgresql://...     # Railway PostgreSQL
PORT=5000
CORS_ORIGIN=http://localhost:3000
API_PUBLIC_URL=http://localhost:5000  # Para webhooks (prod: Railway URL)
GEMINI_API_KEY=...               # Google Gemini
GROQ_API_KEY=...                 # Groq (free tier)
```

### Frontend (`apps/web/.env.local`)
```env
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🔒 Segurança

- ✅ GitHub tokens armazenados com encoding base64 (MVP)
- ✅ Webhook signatures verificadas com HMAC-SHA256
- ✅ CORS configurado para dominios permitidos
- ✅ NextAuth.js para autenticação
- ✅ Sem credenciais no git

---

## 🐛 Known Issues

| Issue | Severidade | Workaround |
|-------|-----------|-----------|
| 87 ESLint `any` type warnings | Baixa | Type-safe refactor (v1.1) |
| Sem admin panel para gerenciar Learning KB | Média | Editar dados direto no DB |
| GitHub webhook retries não implementadas | Média | Implementar em v1.1 |

---

## 🎯 Próximos Passos (v1.1)

- [ ] Alertas automáticos (stories paradas > 7 dias)
- [ ] Timeline de atividades
- [ ] Notificações em tempo real (WebSocket)
- [ ] Exportação de relatórios (PDF)
- [ ] Integração com Slack/Discord
- [ ] Type-safe refactor (eliminar `any` types)

---

## 📞 Suporte

**Dúvidas?**
- Leia [docs/GITHUB_INTEGRATION.md](docs/GITHUB_INTEGRATION.md) para setup de webhooks
- Veja [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para decisões técnicas
- Abra issue no GitHub para bugs/features

---

## 📄 Licença

MIT — Sinta-se livre para usar, modificar e distribuir

---

**Mantido por**: @guilhermesimas542-lab
**Status**: 🚀 MVP Production Ready
**Última atualização**: 2026-03-12

---

## 🙏 Créditos

- **Frontend Architecture**: Next.js best practices
- **Visualization**: D3.js force-directed graph
- **Backend**: Express.js + Prisma ORM
- **LLM Integration**: Groq API + Google Gemini
- **Deployment**: Vercel + Railway
- **UI/UX**: Tailwind CSS + Dark Theme

# Teste webhook
# Teste polling
# Test
# Test
# Test webhook
# Test webhook
# Test webhook
