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

declare global {
  interface Window {
    electronAPI?: {
      terminal: {
        init: () => Promise<{ success: boolean; cwd: string }>;
        write: (data: string) => Promise<{ success: boolean }>;
        read: () => Promise<{ data: string }>;
        resize: (cols: number, rows: number) => Promise<{ success: boolean }>;
        kill: () => Promise<{ success: boolean }>;
        onData: (callback: (data: string) => void) => void;
      };
    };
  }
}

export default function TerminalView(_props: TerminalViewProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isElectron, setIsElectron] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializar terminal
  useEffect(() => {
    const initTerminal = async () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        setIsElectron(true);
        try {
          const result = await window.electronAPI.terminal.init();
          setLines([
            {
              id: '0',
              type: 'info',
              content: `$ Terminal iniciado em ${result.cwd}`,
              timestamp: new Date(),
            },
          ]);
          setInitialized(true);

          // Listen para output do terminal
          window.electronAPI.terminal.onData((data: string) => {
            setLines((prev) => [
              ...prev,
              {
                id: `output-${Date.now()}`,
                type: 'output',
                content: data,
                timestamp: new Date(),
              },
            ]);
          });
        } catch (error) {
          setLines([
            {
              id: '0',
              type: 'error',
              content: 'Erro ao inicializar terminal Electron',
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        // Fallback para modo simulado
        setLines([
          {
            id: '0',
            type: 'info',
            content: '$ Terminal (modo simulado - Electron não detectado)',
            timestamp: new Date(),
          },
          {
            id: '1',
            type: 'info',
            content: 'Digite um comando ou "help" para ver opções',
            timestamp: new Date(),
          },
        ]);
        setInitialized(true);
      }
    };

    initTerminal();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    const commandLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      type: 'input',
      content: `$ ${command}`,
      timestamp: new Date(),
    };
    setLines((prev) => [...prev, commandLine]);

    if (isElectron && initialized && window.electronAPI) {
      try {
        await window.electronAPI.terminal.write(command + '\n');
      } catch (error) {
        const errorLine: TerminalLine = {
          id: `err-${Date.now()}`,
          type: 'error',
          content: `Erro ao executar comando: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        };
        setLines((prev) => [...prev, errorLine]);
      }
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
          placeholder={isElectron ? "Digite um comando..." : "Terminal (simulado)"}
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
          disabled={!initialized}
        />
      </div>
    </div>
  );
}
