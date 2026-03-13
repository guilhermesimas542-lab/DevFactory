'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

interface TerminalViewProps {
  projectId?: string;
}

export default function TerminalView(_props: TerminalViewProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '0',
      type: 'info',
      content: '$ Terminal iniciado',
      timestamp: new Date(),
    },
    {
      id: '1',
      type: 'info',
      content: 'Digite um comando ou "help" para ver opções',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para a última linha
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    // Adicionar comando ao histórico
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    // Adicionar comando ao output
    const commandLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      type: 'input',
      content: `$ ${command}`,
      timestamp: new Date(),
    };
    setLines((prev) => [...prev, commandLine]);

    // Processar comando
    const [cmd, ...args] = command.trim().split(' ');

    let response = '';
    let type: 'output' | 'error' | 'info' = 'output';

    switch (cmd.toLowerCase()) {
      case 'help':
        response = `Comandos disponíveis:
  help              - Mostra esta mensagem
  ls                - Lista arquivos do projeto
  pwd               - Mostra diretório atual
  cat <arquivo>    - Mostra conteúdo de arquivo
  clear             - Limpa o terminal
  status            - Status do projeto
  build             - Compila o projeto
  test              - Executa testes`;
        break;

      case 'ls':
        response = `apps/
  api/
  web/
docs/
  stories/
  architecture/
package.json
.gitignore
README.md`;
        break;

      case 'pwd':
        response = `/Volumes/SSD_PROJETO 8/Dev/devfactory`;
        break;

      case 'clear':
        setLines([]);
        return;

      case 'cat':
        if (args.length === 0) {
          response = 'Erro: especifique um arquivo';
          type = 'error';
        } else {
          response = `Conteúdo de ${args[0]}:
[Arquivo não encontrado ou acesso negado]`;
          type = 'error';
        }
        break;

      case 'status':
        response = `Status do Projeto:
  Ramo: main
  Arquivos modificados: 1
  Último commit: fix: usar NEXT_PUBLIC_API_URL para chamadas de chat
  Desenvolvedor: Claude
  Status: ✅ Saudável`;
        break;

      case 'build':
        response = `Building DevFactory...
  ✓ Compilando frontend
  ✓ Compilando backend
  ✓ Build concluído com sucesso`;
        break;

      case 'test':
        response = `Executando testes...
  ✓ 45 testes passaram
  ✓ 0 testes falharam
  Cobertura: 78%`;
        break;

      case 'git':
        if (args[0]?.toLowerCase() === 'log') {
          response = `commit 1b0aa83 - fix: usar NEXT_PUBLIC_API_URL para chamadas de chat
commit e0eeb26 - fix: melhorar debug e error handling do chat com logging
commit ea3f224 - fix: corrigir payload do chat para usar 'history'
commit ea4f61d - fix: aumentar altura do chat para ocupar mais da tela`;
        } else {
          response = 'Git commands: log, status, add, commit, push, pull';
        }
        break;

      case 'npm':
        if (args[0]?.toLowerCase() === 'run') {
          response = `Scripts disponíveis:
  npm run dev       - Inicia servidor de desenvolvimento
  npm run build     - Build para produção
  npm test          - Executa testes
  npm run lint      - Verifica linting`;
        } else {
          response = 'Use npm run <script>';
        }
        break;

      case 'echo':
        response = args.join(' ');
        break;

      case 'date':
        response = new Date().toString();
        break;

      case '':
        return;

      default:
        response = `Comando não encontrado: ${cmd}`;
        type = 'error';
    }

    // Adicionar resposta
    if (response) {
      const responseLine: TerminalLine = {
        id: `res-${Date.now()}`,
        type,
        content: response,
        timestamp: new Date(),
      };
      setLines((prev) => [...prev, responseLine]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0C0C10',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {/* Terminal Output */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
        }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            style={{
              fontSize: '12px',
              lineHeight: '1.5',
              color:
                line.type === 'error'
                  ? '#EF4444'
                  : line.type === 'info'
                    ? '#6B7280'
                    : line.type === 'input'
                      ? '#6366F1'
                      : '#F1F1F3',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {line.content}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 16px',
          background: '#16161A',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            color: '#6366F1',
            fontSize: '12px',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          $
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#F1F1F3',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            outline: 'none',
          }}
          autoFocus
        />
      </div>
    </div>
  );
}
