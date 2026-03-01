# 🚀 DEPLOY SUPER SIMPLES — Vercel + Railway

> **Leia com cuidado, cada clique faz diferença!**

---

## 📍 PASSO 1: GITHUB (Fazer código aparecer no repositório)

### 1.1 Criar novo token
1. Abra: https://github.com/settings/tokens
2. Clique "Fine-grained tokens" (esquerda)
3. Clique "Generate new token"
4. Preencha:
   - **Token name:** DevFactory-Deploy
   - **Expiration:** 90 days
5. Desça até "Repository access"
6. Selecione: "Only select repositories"
7. Escolha: DevFactory
8. Desça até "Permissions"
9. Encontre "Contents" e clique (mude para "Read and write")
10. Clique "Generate token" (verde, abaixo)
11. **COPIE O TOKEN** (amarelo, único aviso — copie agora!)

### 1.2 Fazer push
1. Abra terminal (mesmo lugar onde rodou npm antes)
2. Cole isto (substitua `SEU_TOKEN_NOVO` pelo token que copiou):

```bash
git remote set-url origin "https://guilhermesimas542-lab:SEU_TOKEN_NOVO@github.com/guilhermesimas542-lab/DevFactory.git"

git push origin main
```

3. Se aparecer "To github.com:..." com ✓ significa **SUCESSO** ✅
4. Abre browser em: https://github.com/guilhermesimas542-lab/DevFactory
5. Deve ter arquivos lá agora

---

## 📍 PASSO 2: VERCEL (Deploy Frontend)

### 2.1 Conectar repositório
1. Abra: https://vercel.com/dashboard
2. Procure "DevFactory"
3. Se disser "Disconnected" ou "Not connected":
   - Clique "Connect to GitHub"
   - Selecione: DevFactory
   - Autorize
4. Clique no projeto DevFactory
5. Vá para "Settings" (abas no topo)

### 2.2 Adicionar variáveis
1. Clique "Environment Variables" (esquerda)
2. Clique "+ Add New"
3. **Variável 1:**
   - Name: `NEXTAUTH_SECRET`
   - Value: `dev-secret-change-in-production-immediately`
   - Clique "Add"
4. **Variável 2:**
   - Name: `NEXTAUTH_URL`
   - Value: `https://seu-projeto-vercel.vercel.app`
   - (substitua "seu-projeto" pelo nome que Vercel deu)
   - Clique "Add"

### 2.3 Fazer deploy
1. Volte para a página principal do projeto (clique "DevFactory" no topo)
2. Vá para "Deployments" (aba)
3. Veja a lista de deployments
4. Clique no primeiro (mais recente)
5. Se tiver botão "Redeploy" (canto superior direito):
   - Clique "Redeploy"
   - Espera 2-3 minutos
6. Quando terminar, deve dizer "Ready" em verde

### 2.4 Testar
1. Pega a URL do Vercel (tipo `seu-projeto.vercel.app`)
2. Abra no browser: `https://seu-projeto.vercel.app/login`
3. Teste login:
   - Email: `test@example.com`
   - Senha: `123456`
4. Se logar → dashboard deve aparecer ✅

---

## 📍 PASSO 3: RAILWAY (Deploy Backend + Banco)

### 3.1 Adicionar PostgreSQL
1. Abra: https://railway.app/dashboard
2. Procure "devfactory" na lista
3. Clique nele
4. Se não tem "PostgreSQL" card:
   - Clique "+ New"
   - Procure "PostgreSQL"
   - Clique "Create"
   - Espera ~2 minutos
5. Pronto, deve ter PostgreSQL agora

### 3.2 Copiar DATABASE_URL
1. Clique no card "PostgreSQL"
2. Vá para "Variables" (abas)
3. Procure "DATABASE_URL"
4. Clique no valor (ao lado do botão copy)
5. **COPIE TUDO** (valor inteiro)
6. Cola em arquivo de texto seguro por enquanto

### 3.3 Configurar Express (sua API)
1. De volta ao dashboard do projeto
2. Se não tem "Express" service:
   - Clique "+ New"
   - "GitHub Repo"
   - Escolha branch "main"
   - (pode pedir caminho da pasta — deixa "apps/api")
   - Cria service
   - Espera ~2 minutos
3. Clique no card "Express" (ou seu serviço)
4. Vá para "Variables"
5. Clique "+ New Variable" e adicione 3:

**Var 1:**
```
Key: DATABASE_URL
Value: [cola aqui o que copiou do PostgreSQL]
```
Clique "Add"

**Var 2:**
```
Key: NODE_ENV
Value: production
```
Clique "Add"

**Var 3:**
```
Key: PORT
Value: 5000
```
Clique "Add"

6. Railway refaz deploy automaticamente (vê os logs)
7. Quando disser "success" = está rodando ✅

### 3.4 Pega a URL da API
1. No card "Express":
2. Canto superior direito, deve ter algo como:
   ```
   seu-app-production.railway.app
   ```
3. **Guarda essa URL**

---

## 📍 PASSO 4: TESTAR TUDO

### 4.1 Teste Frontend
```
1. Abra: https://seu-projeto-vercel.vercel.app/login
2. Email: test@example.com
3. Senha: 123456
4. Deve logar e ir pro dashboard
5. Se conseguir = ✅ Vercel OK
```

### 4.2 Teste Backend
```
1. Abra: https://seu-app-production.railway.app/api/health
2. Deve responder algo tipo:
   {"status":"ok"}
3. Se respondeu = ✅ Railway OK
```

### 4.3 Teste Banco (Avançado)
```
Quando estiver na dashboard do Vercel:
- Deve conectar com banco
- Se aparecer dados = ✅ PostgreSQL OK
```

---

## ✅ CHECKLIST FINAL

```
[ ] GitHub: Código pushado (repositório não está vazio)
[ ] Vercel: Variáveis configuradas (NEXTAUTH_SECRET e NEXTAUTH_URL)
[ ] Vercel: Deploy rodando (mostra "Ready" em verde)
[ ] Railway: PostgreSQL criado
[ ] Railway: Express configurado com DATABASE_URL
[ ] Teste: Login funciona em Vercel
[ ] Teste: API responde em Railway
```

Quando todos estiverem checkados → **Pronto para STORY-006!** 🎉

---

## 🆘 PROBLEMAS COMUNS

### "Vercel diz 'Not connected'"
→ Volte ao Passo 2.1, clique "Connect to GitHub"

### "Railway diz 'service unhealthy'"
→ Verifica aba "Logs", procura por erros
→ Provavelmente falta DATABASE_URL

### "Login não funciona em Vercel"
→ Verifica se NEXTAUTH_SECRET está configurado
→ Clica "Redeploy" no Vercel

### "API responde erro 500"
→ Clica em "Logs" no Railway
→ Procura mensagem de erro
→ Normalmente é DATABASE_URL errada ou faltando

---

## 📞 Próximo Passo

Quando tudo estiver ✅:
1. Me manda o link do Vercel rodando
2. Confirmação que login funciona
3. Partimos para **STORY-006** (Importação de PRD) 🚀

Dúvida em qualquer passo? **Para aqui e pergunta** qual passo não ficou claro!
