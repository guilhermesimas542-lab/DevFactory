# DevFactory — Mapa de Credenciais

> NÃO commitar. Valores reais ficam em .env (protegido pelo .gitignore).

---

## STATUS COMPLETO

### apps/api/.env ✅ 100% configurado
| Variável | Status |
|----------|--------|
| `DATABASE_URL` | ✅ Railway PostgreSQL |
| `GEMINI_API_KEY` | ✅ Configurado |
| `NODE_ENV` | ✅ development |
| `PORT` | ✅ 5000 |
| `CORS_ORIGIN` | ✅ http://localhost:3000 |

### apps/web/.env.local ✅ 100% configurado
| Variável | Status |
|----------|--------|
| `NEXTAUTH_SECRET` | ✅ Configurado |
| `NEXTAUTH_URL` | ✅ http://localhost:3000 |
| `NEXT_PUBLIC_API_URL` | ✅ http://localhost:5000 |
| `NEXT_PUBLIC_GITHUB_API_TOKEN` | ✅ Configurado |

### .env raiz ✅ 100% configurado (o que precisa)
| Variável | Status |
|----------|--------|
| `ANTHROPIC_API_KEY` | ✅ Configurado |
| `EXA_API_KEY` | ✅ Configurado |
| `GITHUB_TOKEN` | ✅ Configurado |
| `RAILWAY_TOKEN` | ⏳ Pendente (só na hora do deploy) |
| `VERCEL_TOKEN` | ⏳ Pendente (só na hora do deploy) |

---

## GitHub
- **Repositório:** https://github.com/guilhermesimas542-lab/DevFactory.git
- **Organização:** guilhermesimas542-lab

---

## EXA MCP — Configurar no Claude Code
Para o Claude ter acesso à busca web, rode no terminal:
```bash
claude mcp add --transport http exa https://mcp.exa.ai/mcp?exaApiKey=9ef03b42-6f0e-4dbc-ac4b-aff08c3dc9ca
```

---

## Próximos passos
1. Inicializar git: `git init`
2. Conectar ao repositório: `git remote add origin https://github.com/guilhermesimas542-lab/DevFactory.git`
3. Primeiro commit e push
4. RAILWAY_TOKEN e VERCEL_TOKEN — só necessários na hora do deploy
