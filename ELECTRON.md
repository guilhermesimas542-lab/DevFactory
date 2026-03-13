# DevFactory Desktop (Electron)

Este projeto agora suporta **Electron** para rodar como uma aplicação desktop com terminal real integrado!

## 📦 Estrutura

```
apps/electron/
├── src/
│   ├── main.js      (Processo principal - controla a janela e PTY)
│   └── preload.js   (Bridge seguro entre frontend e backend)
└── package.json

electron-builder.json  (Configuração de build para macOS, Windows, Linux)
```

## 🚀 Como Usar

### Desenvolvimento

**Terminal Real (Electron):**
```bash
npm run electron:dev
```

Isso vai:
1. Iniciar o servidor Next.js na porta 3000
2. Esperar até que ele esteja pronto
3. Abrir a app Electron com acesso ao terminal real

O terminal no painel direito vai conectar com o `node-pty` e você terá acesso total ao shell (`bash`/`powershell`).

**Web Mode (sem Electron):**
```bash
cd apps/web
npm run dev
```

O terminal funcionará em modo simulado (sem poder real).

## 🔧 Tecnologias

- **Electron** — App desktop multiplataforma
- **node-pty** — Acesso ao pseudoterminal do SO
- **xterm.js** — Emulador de terminal no navegador (opcional para UI melhorada)
- **electron-builder** — Build e packaging para macOS, Windows, Linux

## 📦 Build para Distribuição

```bash
npm run electron:build
```

Gera arquivos executáveis:
- **macOS:** `DevFactory.dmg`, `DevFactory.zip`
- **Windows:** `DevFactory.exe`, `DevFactory Portable.exe`
- **Linux:** `DevFactory.AppImage`, `devfactory_*.deb`

Os arquivos ficam em `dist/`.

## 🔐 Segurança

O projeto usa `contextIsolation` para isolar o renderer (frontend) do main process (backend):

1. **Preload.js** expõe apenas APIs necessárias via `contextBridge`
2. **IPC** (Inter-Process Communication) é a única forma de frontend falar com backend
3. **nodeIntegration: false** garante que o frontend não tem acesso direto ao Node.js

## 🎯 Próximas Melhorias

- [ ] Integrar xterm.js UI para melhor experiência no terminal
- [ ] Adicionar suporte para múltiplas abas de terminal
- [ ] Persistir histórico de comandos
- [ ] Validação/sandboxing de comandos (whitelist de comandos permitidos)
- [ ] Atualização automática do app (electron-updater)

## 📝 Notas

- Em desenvolvimento, o app abre com DevTools (F12)
- O terminal tem acesso total ao shell do usuário (cuidado com comandos!)
- Cada vez que a app abre, um novo `node-pty` é criado
- Fechar a janela encerra o processo do terminal

---

**Enjoy your DevFactory Desktop App! 🎉**
