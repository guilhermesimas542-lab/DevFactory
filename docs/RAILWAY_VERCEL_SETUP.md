# 🚀 Deploy Manual — Railway + Vercel

**Data:** 2026-03-02
**Status:** 🔄 Aguardando sua ação nos dashboards
**Código:** ✅ Já foi enviado para GitHub

---

## 📋 Seu Checklist Passo-a-Passo

### 🚂 RAILWAY: Configurar Backend + Database

**Tempo estimado:** 10-15 minutos

#### Passo 1: Conectar repositório GitHub

1. Acesse https://railway.app/dashboard
2. Clique no projeto **DevFactory** que você criou
3. Procure por "Services" (à esquerda)
4. Clique em **"+ New Service"** (botão azul)
5. Selecione **"GitHub Repo"**
6. Quando pedir seleção, procure por: **`guilhermesimas542-lab/DevFactory`**
7. Clique em **"Deploy Now"**

**Esperado nesta etapa:**
- Uma nova caixa aparece chamada "DevFactory API" ou "api"
- Status: "Deploying" → "Deployed" (leva 2-5 minutos)

---

#### Passo 2: Adicionar variáveis de ambiente (Importante!)

1. Na mesma tela do Railway, clique no novo serviço criado
2. Na barra superior, clique em **"Variables"**
3. Clique em **"+ New Variable"** e adicione EXATAMENTE estas 4 variáveis:

```
Variável 1:
Key: NODE_ENV
Value: production

Variável 2:
Key: PORT
Value: 5000

Variável 3:
Key: DATABASE_URL
Value: postgresql://postgres:SsaclYboPYNtjNgLfHrfIFaWTnVePoIv@postgres.railway.internal:5432/railway

Variável 4:
Key: CORS_ORIGIN
Value: https://devfactory-seu-username.vercel.app
         (Você descobre isto depois no Passo do Vercel)
```

⚠️ **IMPORTANTE:** Para `CORS_ORIGIN`, você pode deixar assim por enquanto:
```
https://devfactory.vercel.app
```
E atualizar depois com a URL real de Vercel.

4. Após adicionar TODAS as 4, clique em **"Save"** ou **"Deploy"**
5. Aguarde ~2 minutos para Railway recompilar

**Esperado nesta etapa:**
- Build logs aparecem (verde = sucesso)
- Serviço fica com status "Deployed"

---

#### Passo 3: Pegar URL do Backend

1. Na mesma tela do Railway, procure por um campo chamado **"URL"** ou **"Public URL"**
2. Copie a URL (algo como: `https://xxx-production.up.railway.app`)
3. **Guarde este URL** — você vai usar em Vercel!

---

### 🌐 VERCEL: Configurar Frontend

**Tempo estimado:** 10-15 minutos

#### Passo 1: Conectar repositório GitHub

1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Clique em **"Import Git Repository"**
4. Procure por: **`devfactory`** (seu repositório)
5. Clique em **"Import"**

---

#### Passo 2: Configurar Variáveis de Ambiente

Agora vai aparecer uma página de setup. Procure por **"Environment Variables"** ou **"Advanced"**.

Adicione EXATAMENTE estas 3 variáveis:

```
Variável 1:
Name: NEXTAUTH_SECRET
Value: yNm/nDObXGJTxc/0RXXNeDYN02CNBs/RiUyfTd3m27A=

Variável 2:
Name: NEXTAUTH_URL
Value: https://devfactory.vercel.app
(Você atualiza isto depois com a URL real)

Variável 3:
Name: NEXT_PUBLIC_API_URL
Value: {Cole aqui a URL do Railway que você copiou no Passo 3 acima}
Exemplo: https://xxx-production.up.railway.app
```

---

#### Passo 3: Iniciar Deploy

1. Clique em **"Deploy"** (botão grande azul)
2. Aguarde ~3-5 minutos (vai ver logs de build)
3. Quando aparecer ✅, seu app está no ar!

---

#### Passo 4: Pegar URL do Frontend

1. Na página do Vercel, você verá algo como:
   ```
   Domains
   devfactory.vercel.app
   ```
2. Clique nesta URL para verificar se está funcionando
3. **Guarde este URL** — você vai usar para atualizar Railway

---

### 🔄 RAILWAY: Atualizar CORS_ORIGIN

Volta ao Railway e faz isto:

1. Vai em **Variables** do serviço API
2. Encontra `CORS_ORIGIN`
3. Muda o valor para a URL real de Vercel que você pegou:
   ```
   https://devfactory.vercel.app
   ```
4. Salva
5. Railway redeploya automaticamente (leva ~1 minuto)

---

## ✅ Testes de Conectividade

### Teste 1: Backend está respondendo?

Abra seu navegador e acesse:
```
https://seu-railway-url/health
```

**Esperado:** Vê a resposta `{"status":"ok"}` (ou similar)

---

### Teste 2: Frontend carrega?

Abra seu navegador e acesse:
```
https://devfactory.vercel.app
```

**Esperado:**
- Página inicial carrega
- Logo e UI aparecem
- Botões funcionam
- Pode pedir para fazer login

---

### Teste 3: Frontend fala com Backend?

1. No Vercel, clique no botão de login
2. Use as credenciais demo:
   - Email: `test@example.com`
   - Senha: `123456`
3. Se conseguir fazer login, significa que frontend e backend estão conectados ✅

---

## 📊 Status Checker

| Item | Esperado | Você Verificou |
|------|----------|---|
| Railway Backend Deploy OK | Status "Deployed" | [ ] |
| Railway Variáveis Adicionadas | NODE_ENV, PORT, DATABASE_URL, CORS_ORIGIN | [ ] |
| Vercel Frontend Deploy OK | Status "Ready" | [ ] |
| Vercel Variáveis Adicionadas | NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_API_URL | [ ] |
| Health Check Backend | `curl url/health` responde OK | [ ] |
| Frontend Carrega | Página aparece no navegador | [ ] |
| Login Funciona | test@example.com / 123456 entra | [ ] |

---

## ⚠️ Se Algo Não Funcionar

### Backend não deploy (Railway status "Failed")
- Verifique logs em Railway (clique em "View Logs")
- Procure por erros de "DATABASE_URL" ou "Port"
- Verifique se DATABASE_URL está EXATO (sem espaços)

### Frontend não carrega
- Verifique logs em Vercel (clique em "View Build Logs")
- Procure por erros de build
- Pode ser que NEXTAUTH_SECRET está errado

### CORS Error no console do navegador
- Significa que CORS_ORIGIN está errado no Railway
- Atualize com a URL correta de Vercel
- Aguarde ~1 minuto para Railway atualizar

---

## 🎯 Próximo Passo

Quando tudo estiver funcionando (todos os testes passados):

1. Volta aqui e me avisa: "Deploy OK!"
2. A gente marca STORY-005 como **✅ CONCLUÍDA**
3. Prosseguimos para **STORY-006** (Upload de PRD)

---

**Tempo estimado para fazer tudo:** 30 minutos

Boa sorte! 🚀
