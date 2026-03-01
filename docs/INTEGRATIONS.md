# DevFactory — Mapa de Integrações Externas

> **Status**: Documento vivo. Atualizar conforme stories progridem.
> **Data**: 2026-03-01
> **Prioridade**: Configure ANTES de começar as stories correspondentes

---

## 📋 Sumário Executivo

| Serviço | Tipo | Prioridade | Status | Quando Usar |
|---------|------|-----------|--------|------------|
| **Vercel** | Deploy (Frontend) | 🔴 CRÍTICA | ⏳ Pendente | STORY-005 em diante |
| **Railway** | Deploy (Backend) | 🔴 CRÍTICA | ⏳ Pendente | STORY-005 em diante |
| **PostgreSQL** | Banco Produção | 🔴 CRÍTICA | ⏳ Pendente | STORY-005 em diante |
| **Anthropic API** (Claude) | IA/Glossário | 🟡 ALTA | ⏳ Pendente | STORY-016-020 |
| **GitHub** | Versionamento | 🟢 MÉDIA | ⏳ Pendente | STORY-005+ (CI/CD) |

---

## 🔴 CRÍTICA — Configure AGORA (antes de STORY-005)

### 1. Vercel (Next.js Deploy)

**O que é**: Plataforma serverless para deploy de Next.js (frontend)

**Onde usar**: STORY-005 (Deploy Vercel) e todas stories após

**Informações necessárias**:
```
[ ] Email/Conta GitHub Vercel
[ ] Projeto criado em vercel.com
[ ] Token de autenticação (VERCEL_TOKEN)
[ ] Project ID (VERCEL_PROJECT_ID)
```

**Como configurar**:
1. Acesse https://vercel.com e crie conta (ou faça login com GitHub)
2. Crie novo projeto apontando para `/Users/guilhermesimas/Documents/devfactory`
3. Gere token em Settings → Tokens (crie um com escopo `deployments`)
4. Salve em arquivo seguro (vamos usar em GitHub Actions depois)

**Variáveis de Ambiente Necessárias** (será configurado no Vercel Dashboard):
```env
NEXTAUTH_SECRET=<gerar valor seguro>
NEXTAUTH_URL=https://seu-dominio-vercel.vercel.app
```

**Custo**: Free tier (12 deployments/mês gratuito, depois pago)

---

### 2. Railway (Express Backend Deploy)

**O que é**: Plataforma serverless para deploy de aplicações (backend)

**Onde usar**: STORY-005 (Deploy Railway) e todas stories após

**Informações necessárias**:
```
[ ] Email/Conta GitHub Railway
[ ] Projeto criado em railway.app
[ ] Token de autenticação (RAILWAY_TOKEN)
[ ] Project ID (RAILWAY_PROJECT_ID)
```

**Como configurar**:
1. Acesse https://railway.app e crie conta (recomendado GitHub)
2. Crie novo projeto (New Project → Deploy from GitHub)
3. Selecione o repositório devfactory
4. Gere token em Account → Tokens
5. Salve em arquivo seguro

**Variáveis de Ambiente Necessárias** (configurar no Railway Dashboard):
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/devfactory
NODE_ENV=production
```

**Custo**: Free tier ($5/mês free credits, depois pago por uso)

---

### 3. PostgreSQL (Banco de Dados Produção)

**O que é**: Banco de dados relacional (versão produção; SQLite é para local)

**Onde usar**: STORY-005 em diante (todas as funcionalidades de dados)

**Informações necessárias**:
```
[ ] Host do servidor PostgreSQL
[ ] Usuário (username)
[ ] Senha (password)
[ ] Nome do banco (database name)
[ ] Porta (padrão 5432)
```

**Opções de Deploy** (recomendadas):
- **Railway** (recomendado): Já integrado, basta clicar em "Add Service → PostgreSQL"
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Supabase**: https://supabase.io (PostgreSQL gerenciado)

**Como configurar via Railway** (mais simples):
1. No Railway, vá ao projeto criado
2. Clique "Add Service" → "Postgres"
3. Railway cria automaticamente e fornece `DATABASE_URL`
4. Use esse `DATABASE_URL` nas variáveis de ambiente

**Connection String Format**:
```
postgresql://username:password@host:5432/devfactory
```

**Custo**: Incluído no free tier do Railway (com limites)

---

## 🟡 ALTA — Configure ANTES de STORY-016 (Análise de Progresso)

### 4. Anthropic API (Claude)

**O que é**: API da Anthropic para usar Claude em aplicações

**Onde usar**: STORY-016-020 (Geração de Glossário com IA)

**Informações necessárias**:
```
[ ] Email/Conta Anthropic
[ ] API Key (ANTHROPIC_API_KEY)
```

**Como configurar**:
1. Acesse https://console.anthropic.com
2. Faça login (ou crie conta)
3. Vá para API Keys
4. Clique "Create Key"
5. Salve em arquivo seguro (vamos usar como env var)

**Variáveis de Ambiente**:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

**Uso em STORY-016-020**:
```typescript
// Será usado assim:
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

**Custo**: 
- Free tier: $5 de créditos iniciais
- Produção: Baseado em tokens (entrada + saída)
- Estimativa MVP: ~$1-5/mês (glossário é low-volume)

**Instalação de dependência**:
```bash
npm install @anthropic-ai/sdk --save
```

---

## 🟢 MÉDIA — Configure ANTES de STORY-005 (Opcional para local, necessário para CI/CD)

### 5. GitHub (Versionamento + CI/CD)

**O que é**: Repositório remoto + pipeline de automação

**Onde usar**: 
- Agora: versionamento remoto (backup)
- STORY-005+: CI/CD automático (lint, test, deploy)

**Informações necessárias**:
```
[ ] Conta GitHub
[ ] Repositório criado (devfactory)
[ ] Deploy Key (para GitHub Actions)
[ ] Personal Access Token (PAT)
```

**Como configurar**:
1. Acesse https://github.com e crie conta (já tem?)
2. Crie repositório público chamado `devfactory`
3. No repositório, vá para Settings → Deploy Keys
4. Gere uma nova SSH key para deploy:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -C "devfactory-deploy"
   ```
5. Adicione a chave pública em Deploy Keys
6. Configure local:
   ```bash
   git remote add origin git@github.com:SEU_USUARIO/devfactory.git
   git branch -M main
   git push -u origin main
   ```

**Para CI/CD** (STORY-005 em diante):
1. Vá para Settings → Secrets and Variables → Actions
2. Crie secrets:
   - `VERCEL_TOKEN`: token Vercel (de cima)
   - `RAILWAY_TOKEN`: token Railway (de cima)
   - `ANTHROPIC_API_KEY`: API key Claude (se fizer early)

**Exemplo GitHub Actions** (será criado em STORY-005):
```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run lint && npm run test
      - run: npm run build
      # Deploy com VERCEL_TOKEN e RAILWAY_TOKEN
```

**Custo**: Grátis para público/privado (com limites)

---

## 📊 Timeline: Quando Configurar Cada Serviço

```
├─ AGORA (antes de amanhã):
│  ├─ Vercel (frontend deploy)
│  ├─ Railway (backend deploy) 
│  ├─ PostgreSQL (banco produção)
│  └─ GitHub (versionamento remoto)
│
├─ Antes de STORY-016:
│  └─ Anthropic API (Claude para glossário)
│
└─ Não requer autenticação:
   ├─ D3.js (já no npm)
   ├─ Babel Parser (já no npm)
   └─ Tailwind CSS (já configurado)
```

---

## 🔐 Segurança: Onde Guardar Credenciais

**NUNCA commite no Git**:
```bash
❌ .env (local, nunca commitado)
❌ secrets.json (local, nunca commitado)
```

**Guarde de forma segura**:
```bash
✅ Arquivo local: ~/.ssh/devfactory-secrets.txt (copiar cola-recola)
✅ Password Manager (1Password, Bitwarden)
✅ GitHub Secrets (para CI/CD, não exposto em logs)
```

**Estrutura recomendada** (local, NÃO commitada):
```
~/.ssh/devfactory-secrets.txt

=== VERCEL ===
Token: vercel_xxx
Project ID: xxx
Dashboard: https://vercel.com/dashboard

=== RAILWAY ===
Token: railway_xxx
Project ID: xxx
Dashboard: https://railway.app

=== POSTGRESQL ===
Host: xxx.railway.app
User: postgres
Pass: xxx
DB: devfactory
Connection: postgresql://postgres:xxx@xxx.railway.app:5432/devfactory

=== ANTHROPIC API ===
API Key: sk-ant-xxx
Dashboard: https://console.anthropic.com

=== GITHUB ===
Deploy Key (private): ~/.ssh/github_deploy_key
```

---

## ✅ Checklist: O Que Fazer Antes de Continuar

Marque conforme completar:

```
🔴 CRÍTICA (necessário para STORY-005):
  [ ] Vercel conta criada + token gerado
  [ ] Railway conta criada + token gerado + PostgreSQL adicionado
  [ ] Documentar CONNECTION_STRING PostgreSQL

🟡 ALTA (necessário para STORY-016):
  [ ] Anthropic API key gerado

🟢 MÉDIA (recomendado agora, não impede stories):
  [ ] GitHub repositório criado
  [ ] GitHub remote configurado localmente
  [ ] Secrets do GitHub configurados (opcional até STORY-005)
```

---

## 📝 Notas Adicionais

### Simulação Local vs. Produção

Para **não bloquear development**, podemos:
- STORY-005 até 015: Rodar localmente (SQLite, sem deploy)
- STORY-016 em diante: Usar Anthropic API em dev (free tier $5 credits)

Ou seja: **você não precisa fazer deploy de verdade até estar 100% pronto**.

### Próxima Ação

1. Configure os 3 serviços críticos (Vercel, Railway, PostgreSQL)
2. Retorne com as credenciais (ou me diga qual você já tem)
3. Eu insiro tudo nas variáveis de ambiente
4. Continuamos com STORY-005 (deploy) ou STORY-006 (importação PRD)?

Qual serviço você já tem? Qual você quer que eu ajude a criar?
