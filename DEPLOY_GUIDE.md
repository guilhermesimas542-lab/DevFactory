# 🚀 DevFactory — Guia Deploy Vercel + Railway

## 📋 CHECKLIST: O QUE FAZER AGORA

### 1️⃣ VERCEL DASHBOARD
Link: https://vercel.com/dashboard

```
[ ] Encontre projeto "DevFactory"
[ ] Clique nele
[ ] Vá para Settings (aba superior)
[ ] Settings → Environment Variables
[ ] Clique "+ Add"
```

**Variável 1:**
```
Name: NEXTAUTH_SECRET
Value: dev-secret-change-in-production-immediately
```

**Variável 2:**
```
Name: NEXTAUTH_URL
Value: https://seu-projeto-vercel.vercel.app
      (substitua "seu-projeto" pelo seu domínio real)
```

```
[ ] Clique "Save"
[ ] Vá para "Deployments"
[ ] Clique no deploy mais recente
[ ] Clique "Redeploy" (botão superior direito)
[ ] Espera ~2 min para fazer redeploy
```

✅ **Frontend estará rodando após redeploy**

---

### 2️⃣ RAILWAY DASHBOARD
Link: https://railway.app/dashboard

```
[ ] Encontre projeto "devfactory"
[ ] Clique nele
[ ] Verifique se tem 2 serviços:
    ├─ PostgreSQL (banco)
    └─ Express (API) ou seu serviço
```

**Se FALTA PostgreSQL:**
```
[ ] Clique "+ Add Service"
[ ] Procure "PostgreSQL"
[ ] Clique "Create"
[ ] Espera ~2 min provisionar
```

**Depois de ter PostgreSQL:**

```
[ ] Clique em "PostgreSQL" service
[ ] Vá para aba "Variables"
[ ] Procure "DATABASE_URL"
[ ] CLIQUE NELE → "Copy"
[ ] GUARDE EM LUGAR SEGURO (vamos usar abaixo)
```

**Configurar Express (API):**

```
[ ] Clique em "Express" ou seu serviço API
[ ] Vá para aba "Variables"
[ ] Clique "+ Add Variable"

Variable 1:
  Key: DATABASE_URL
  Value: [cole o DATABASE_URL que copiou acima]

Variable 2:
  Key: NODE_ENV
  Value: production

Variable 3:
  Key: PORT
  Value: 5000

[ ] Clique "Save" em cada uma
[ ] Railway fará redeploy automaticamente
```

✅ **Backend estará rodando com PostgreSQL após redeploy**

---

### 3️⃣ TESTE SE FUNCIONA

```
[ ] Acesse: https://seu-projeto-vercel.vercel.app/login

[ ] Teste login com:
    Email: test@example.com
    Senha: 123456

[ ] Se logar com sucesso → Redirecionou para /dashboard?

    SIM ✅  — Tudo funcionando!
    NÃO ❌  — Ver seção "Troubleshooting" abaixo
```

---

## 🔧 TROUBLESHOOTING

### Erro: "NEXTAUTH_SECRET não está configurado"
```
→ Volte a Vercel Dashboard → Environment Variables
→ Verifique se NEXTAUTH_SECRET está lá
→ Faça "Redeploy" novamente
```

### Erro: "Não consegue conectar banco de dados"
```
→ Verifique if Railway Express service tem DATABASE_URL na aba Variables
→ Verifique if o valor está completo (deve ter postgresql://...)
→ Faça "Redeploy" do Express no Railway
```

### Erro: "Permissão negada ao fazer push Git"
```
→ Vercel e Railway já estão sincronizados via GitHub
→ Não precisa fazer push manual agora
→ Depois quando precisar: Eu vou gerar novo PAT com Fine-grained permissions
```

---

## 📊 Status Esperado Após Completar

| Componente | Status | Link |
|-----------|--------|------|
| Frontend | ✅ Rodando | https://seu-projeto.vercel.app |
| API Backend | ✅ Rodando | https://seu-projeto-api.railway.app |
| PostgreSQL | ✅ Conectado | Railroad Railway |
| Login | ✅ Funciona | Teste em /login |

---

## 🎯 Próximo Passo Após Deploy

Uma vez que Vercel + Railway estão rodando:

**Opção A**: Continuar com STORY-005 (deploy) — será apenas "verificar se rodou"
**Opção B**: Pular direto para STORY-006 (importação PRD) — features mais interessantes

Qual você quer fazer?
