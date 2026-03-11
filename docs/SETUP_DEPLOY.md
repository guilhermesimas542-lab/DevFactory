# STORY-005: Setup Deploy — Guia Passo-a-Passo

**Status:** 🔄 EM PROGRESSO
**Data:** 2026-03-02
**Objetivo:** Conectar Railway (backend) + Vercel (frontend) + GitHub Actions

---

## ✅ Pré-requisitos (Já Tem)

- [x] GitHub repo criado: https://github.com/guilhermesimas542-lab/DevFactory.git
- [x] GitHub Token Classic: `github_pat_11B5HP3...` ✅
- [x] Railway criado com PostgreSQL
- [x] Vercel criado
- [x] DATABASE_URL obtido: `postgresql://postgres:SsaclYboPYNtjNgLfHrfIFaWTnVePoIv@postgres.railway.internal:5432/railway`
- [x] NEXTAUTH_SECRET gerado: `yNm/nDObXGJTxc/0RXXNeDYN02CNBs/RiUyfTd3m27A=`

---

## 🚀 Passo 1: Push Inicial para GitHub

Execute estes comandos no terminal (na pasta `/Users/guilhermesimas/Documents/devfactory`):

```bash
# 1. Configure Git (se não tiver feito ainda)
git config user.name "Seu Nome"
git config user.email "seu-email@example.com"

# 2. Adicione todos os arquivos (exceto .env, node_modules)
git add -A

# 3. Faça commit
git commit -m "chore: configurar variáveis de ambiente para deploy"

# 4. Push para GitHub (use o token como senha)
git push -u origin main
# Quando pedir autenticação:
# Username: seu-usuario-github (ou deixe em branco)
# Password: {Cole o token aqui}
```

**Esperado:** ✅ Repo aparece em https://github.com/guilhermesimas542-lab/DevFactory

---

## 🚂 Passo 2: Configurar Railway (Backend + PostgreSQL)

### 2.1 Conectar Repositório GitHub

1. Acesse https://railway.app/dashboard
2. Clique no projeto que criou (DevFactory)
3. Clique em "+ New Service"
4. Selecione "GitHub Repo"
5. Selecione: `guilhermesimas542-lab/DevFactory`
6. Clique em "Deploy Now"

**Esperado:** Railway cria um novo serviço (service) chamado "DevFactory API" ou semelhante

### 2.2 Configurar Variáveis de Ambiente no Railway

Agora você precisa adicionar variáveis para o backend Express rodar:

1. No Railway dashboard, clique no serviço criado (DevFactory API)
2. Vá para "Variables"
3. Adicione estas variáveis:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:SsaclYboPYNtjNgLfHrfIFaWTnVePoIv@postgres.railway.internal:5432/railway
CORS_ORIGIN=https://seu-dominio-vercel.vercel.app
```

(Você descobre qual é seu domínio Vercel no Passo 3)

4. Clique em "Save"

**Esperado:** Railway inicia automaticamente o deploy do backend

### 2.3 Verificar se Backend Respondeu

Aguarde ~2-5 minutos e acesse no terminal:

```bash
# Pega o URL do backend (aparece no Railway dashboard)
curl https://seu-railway-app.up.railway.app/health
```

**Esperado:** Resposta `{"status":"ok"}` ou similar

---

## 🌐 Passo 3: Configurar Vercel (Frontend)

### 3.1 Conectar Repositório GitHub

1. Acesse https://vercel.com/dashboard
2. Clique em "New Project"
3. Clique em "Import Git Repository"
4. Selecione: `guilhermesimas542-lab/DevFactory`
5. Clique em "Import"

### 3.2 Configurar Variáveis de Ambiente

1. Na página de setup do Vercel, vá para "Environment Variables"
2. Adicione estas variáveis:

```
NEXTAUTH_SECRET=yNm/nDObXGJTxc/0RXXNeDYN02CNBs/RiUyfTd3m27A=
NEXTAUTH_URL=https://{seu-dominio-vercel}.vercel.app
NEXT_PUBLIC_API_URL=https://seu-railway-app.up.railway.app
```

3. Clique em "Deploy"

**Esperado:** Vercel inicia o deploy do frontend

### 3.3 Descobrir seus Domínios

Após deploy, você verá:
- Frontend: `https://devfactory.vercel.app` (ou nome customizado)
- Backend: `https://seu-railway-app.up.railway.app`

**Volte ao Passo 2.2** e atualize `CORS_ORIGIN` no Railway com o domínio Vercel real.

---

## ✅ Passo 4: Testes de Conexão

Execute estes testes para garantir que tudo está funcionando:

### Teste 1: Backend está respondendo?

```bash
curl https://seu-railway-app.up.railway.app/health
# Esperado: {"status":"ok"}
```

### Teste 2: Frontend está servindo?

Acesse no navegador:
```
https://seu-dominio-vercel.vercel.app
```

**Esperado:** Página inicial do DevFactory carrega (pode pedir login)

### Teste 3: Frontend consegue falar com backend?

1. Acesse o dashboard
2. Abra Console do navegador (F12)
3. Procure por erros de CORS ou requisições falhadas

**Esperado:** Nenhum erro (ou erros de autenticação, não de conexão)

---

## 🔐 Passo 5: Adicionar Secrets do GitHub para CI/CD (Futuro)

Para Ações do GitHub funcionarem (deploy automático a cada push), adicione secrets:

1. Acesse https://github.com/guilhermesimas542-lab/DevFactory/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione:

```
Name: RAILWAY_TOKEN
Value: {seu token Railway}

Name: VERCEL_TOKEN
Value: {seu token Vercel}
```

(Você obtém esses tokens nos dashboards respectivos)

---

## 📋 Checklist Final

Marque conforme completar:

```
[ ] Push do código para GitHub OK
[ ] Railway backend service criado
[ ] Railway variáveis de ambiente configuradas
[ ] Backend respondendo em /health
[ ] Vercel frontend criado
[ ] Vercel variáveis de ambiente configuradas
[ ] Frontend servindo no navegador
[ ] Teste de conectividade passed
[ ] Domínios descobertos (Railway + Vercel)
[ ] CORS_ORIGIN atualizado no Railway
```

---

## 🐛 Troubleshooting

### "Backend não responde"
- Aguarde 5 minutos (Railway demora para compilar)
- Verifique logs em Railway dashboard
- Verifique DATABASE_URL está correto

### "Frontend vê erro CORS"
- Atualize CORS_ORIGIN no Railway com domínio Vercel correto
- Aguarde ~1 minuto para variável tomar efeito

### "Login não funciona"
- Verifique NEXTAUTH_SECRET é o mesmo em Vercel
- Verifique NEXTAUTH_URL aponta para domínio Vercel correto

### "Não consigo fazer push para GitHub"
- Verifique token GitHub está correto
- Tente: `git remote -v` (deve mostrar https://github.com/...)
- Se mostrar SSH (git@github.com), não funcionará com token

---

## 📞 Próximos Passos Após Deploy

Quando tudo estiver funcionando:
1. ✅ STORY-005 está **CONCLUÍDA**
2. Prossiga para **STORY-006** (Upload de PRD)
3. Continue com Épicos 2, 3, 4

---

**Status:** 🔄 EM PROGRESSO
**Responsável:** @devops (você)
**Data atualização:** 2026-03-02
