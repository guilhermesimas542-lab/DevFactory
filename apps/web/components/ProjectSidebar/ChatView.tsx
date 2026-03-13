'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatViewProps {
  projectId?: string;
}

export default function ChatView({ projectId }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou seu assistente de IA. Posso responder perguntas sobre a arquitetura do seu projeto, explicar componentes, sugerir melhorias e muito mais.\n\nComo posso ajudá-lo?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a mensagem mais recente
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Chamar API de chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          projectId,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Adicionar resposta da IA
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Adicionar mensagem de erro
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '❌ Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0C0C10',
      }}
    >
      {/* Messages List */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: '8px',
                background:
                  message.role === 'user'
                    ? '#6366F1'
                    : 'rgba(99, 102, 241, 0.08)',
                border:
                  message.role === 'user'
                    ? 'none'
                    : '1px solid rgba(99, 102, 241, 0.2)',
                color: message.role === 'user' ? '#F1F1F3' : '#F1F1F3',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              {message.role === 'assistant' ? (
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          style={{ color: '#6366F1', textDecoration: 'underline' }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      code: ({ children }) => (
                        <code
                          style={{
                            background: 'rgba(0,0,0,0.2)',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '12px',
                          }}
                        >
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '12px',
                            borderRadius: '6px',
                            overflowX: 'auto',
                            margin: '8px 0',
                            fontSize: '12px',
                          }}
                        >
                          {children}
                        </pre>
                      ),
                      ul: ({ children }) => (
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#6B7280',
                fontSize: '13px',
              }}
            >
              <span style={{ display: 'inline-block' }}>
                Digitando
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: '4px',
                    animation: 'dots 1.4s infinite',
                  }}
                >
                  <style>{`
                    @keyframes dots {
                      0% { content: '.'; }
                      33% { content: '..'; }
                      66% { content: '...'; }
                    }
                  `}</style>
                  .
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px',
          background: '#16161A',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem... (Shift+Enter para nova linha)"
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#F1F1F3',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'none',
              maxHeight: '100px',
              opacity: loading ? 0.5 : 1,
            }}
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 16px',
              background: input.trim() && !loading ? '#6366F1' : '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'background 200ms',
              alignSelf: 'flex-end',
            }}
          >
            {loading ? '⏳' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}
