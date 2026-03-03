# STORY-006 — Teste Manual de Upload de PRD

**Data:** 2026-03-02
**Story:** STORY-006 Criar Página de Upload de PRD
**Status:** ✅ Implementado | 🔄 Aguardando teste manual

---

## 📋 Checklist de Testes

### Teste 1: Página carrega

```
1. Acesse: https://dev-factory-al5c.vercel.app/projects
2. Esperado: Formulário de upload aparece
3. Você vê:
   - Campo de input para selecionar arquivo (.md/.txt)
   - Botão "Importar PRD"
   - Info panel com explicações
```

### Teste 2: Upload de arquivo válido

```
1. Crie um arquivo PRD (teste.md):
   # Meu Projeto
   ## Módulos
   - Autenticação
   - Dashboard

2. Selecione o arquivo no formulário
3. Clique em "Importar PRD"
4. Esperado:
   - Botão fica "Enviando..." com spinner
   - Depois de 2-3 segundos: "Upload realizado com sucesso! Redirecionando..."
   - Redireciona para dashboard automaticamente
```

### Teste 3: Validação de arquivo inválido

```
1. Tente selecionar arquivo .pdf (ou outro tipo)
2. Esperado: Mensagem de erro aparece: "Por favor, selecione um arquivo .md ou .txt"
3. Botão "Importar PRD" fica desabilitado
```

### Teste 4: Arquivo muito grande

```
1. Tente fazer upload de arquivo > 5MB
2. Esperado: Erro "Arquivo muito grande (máximo 5MB)"
```

### Teste 5: Nenhum arquivo selecionado

```
1. Clique em "Importar PRD" sem selecionar arquivo
2. Esperado: Erro "Por favor, selecione um arquivo"
```

### Teste 6: Backend recebe arquivo

```
Abra DevTools (F12) → Network tab
1. Selecione arquivo .md
2. Clique em "Importar PRD"
3. Procure pela requisição "import-prd"
4. Esperado:
   - Request: POST /api/projects/import-prd
   - Response: {"projectId": "123", "status": "uploaded"}
```

---

## 🧪 Teste Local (Sem Deploy)

Se quiser testar localmente antes de fazer push:

### Backend Local

```bash
cd apps/api
npm run dev
# Deve iniciar em http://localhost:5000
```

### Frontend Local

```bash
cd apps/web
npm run dev
# Deve iniciar em http://localhost:3000
```

### Teste com cURL (backend)

```bash
curl -X POST http://localhost:5000/api/projects/import-prd \
  -F "file=@/tmp/test-prd.md"

# Esperado:
# {"projectId":"1","status":"uploaded","message":"File uploaded successfully..."}
```

---

## ✅ Critérios de Aceite Atendidos

- [x] Página `/projects` criada
- [x] Input file: aceita `.md` e `.txt`
- [x] Botão "Importar PRD"
- [x] Loading state durante upload
- [x] Mensagem de sucesso/erro
- [x] Chamada `POST /api/projects/import-prd` com FormData
- [x] Redirecionamento para dashboard após sucesso
- [x] Validação de arquivo no frontend
- [x] Endpoint backend implementado
- [x] Multer instalado e configurado

---

## 📌 Próximo Passo

Quando todos os testes passarem:
- ✅ STORY-006 → **CONCLUÍDA**
- 🔄 STORY-007: Endpoint Backend para Receber PRD (parser + validação)

---

## 🔗 Arquivos Criados/Modificados

**Frontend:**
- `pages/projects.tsx` (novo)
- `components/UploadForm.tsx` (novo)
- `lib/api.ts` (novo)

**Backend:**
- `routes/projects.ts` (novo)
- `src/index.ts` (atualizado com import de projects route)

**Dependências:**
- `multer` (instalado)
- `@types/multer` (instalado)

---

**Executado por:** @dev (Dex)
**Commit:** feat: [STORY-006] Criar página de upload de PRD
