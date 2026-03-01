# 🔧 Corrigir Push para GitHub

## Problema
Token clássico pode estar com permissões limitadas. Solução: **criar novo token Fine-grained**.

## ✅ Passo 1: Criar Novo Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em "Personal access tokens" (lado esquerdo)
3. Clique "Fine-grained tokens"
4. Clique "Generate new token"
5. **Preencha:**
   ```
   Token name: DevFactory-Deploy
   Expiration: 90 days
   Resource owner: guilhermesimas542-lab
   Repository access: Only select repositories
   Select repositories: DevFactory
   ```
6. **Permissions (selecione estas):**
   ```
   ✅ Administration (read & write)
   ✅ Contents (read & write)
   ✅ Commit statuses (read & write)
   ```
7. Clique "Generate token"
8. **COPIE O TOKEN** (será exibido só uma vez!)

---

## ✅ Passo 2: Usar Novo Token para Push

Cole os comandos abaixo (substitua TOKEN_NOVO pelo token que copiou):

```bash
git config --global --unset credential.helper

git remote set-url origin "https://guilhermesimas542-lab:TOKEN_NOVO@github.com/guilhermesimas542-lab/DevFactory.git"

git push origin main
```

**Deve exibir:**
```
Counting objects: 100% (XX/XX)
Compressing objects: 100% (XX/XX)
Writing objects: 100% (XX/XX)
...
To github.com:guilhermesimas542-lab/DevFactory.git
 * [new branch]      main -> main
```

Sucesso! ✅

---

## ✅ Passo 3: Verificar no GitHub

1. Acesse: https://github.com/guilhermesimas542-lab/DevFactory
2. Deve mostrar arquivos do projeto
3. Deve ter ~10 commits visíveis

---

## ✅ Passo 4: Vercel vai Reconhecer

Uma vez com código no GitHub:
1. Acesse Vercel Dashboard
2. DevFactory deve mostrar "Connected"
3. Clique em "Deployments"
4. Deve haver um deployment automático acontecendo

Pronto! 🎉
