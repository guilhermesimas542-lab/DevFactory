'use client';

import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getActivityLog } from '@/lib/api';

interface AIPanelProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface ActivityEntry {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 60) return 'há poucos segundos';
  if (secondsAgo < 3600) return `há ${Math.floor(secondsAgo / 60)}m`;
  if (secondsAgo < 86400) return `há ${Math.floor(secondsAgo / 3600)}h`;
  if (secondsAgo < 604800) return `há ${Math.floor(secondsAgo / 86400)}d`;
  return date.toLocaleDateString('pt-BR');
};

const getActivityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    prd_uploaded: '📄',
    story_created: '✨',
    story_updated: '📝',
    alert_generated: '⚠️',
    architecture_extracted: '🏗️',
  };
  return icons[type] || '📌';
};

export default function AIPanel({
  projectId,
  isOpen,
  onClose,
}: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'activities'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load activities when switching to activities tab
  useEffect(() => {
    if (isOpen && activeTab === 'activities') {
      loadActivities();
    }
  }, [activeTab, isOpen, projectId]);

  const loadActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const response = await getActivityLog(projectId, 50);
      if (response.success && response.data) {
        // Extract the array from the response which includes total property
        const data = response.data as any;
        const activitiesArray = Array.isArray(data) ? data : [];
        setActivities(activitiesArray);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to UI
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
    };
    setMessages(prev => [...prev, newUserMessage]);

    setIsLoading(true);
    try {
      const response = await sendChatMessage(projectId, userMessage, [...messages, newUserMessage]);
      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          role: 'model',
          content: response.data.message,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('Failed to get chat response:', response.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }

    // Focus back on input
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    if (confirm('Limpar toda a conversa?')) {
      setMessages([]);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 lg:w-[420px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header with tabs */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Chat IA & Atividades</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 font-bold text-xl w-8 h-8 flex items-center justify-center"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                activeTab === 'activities'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Atividades
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'chat' ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center">
                      Faça uma pergunta sobre o projeto para começar...
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input area */}
              <div className="border-t border-gray-200 p-4 space-y-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="w-full text-xs text-gray-600 hover:text-gray-900 py-1"
                  >
                    Limpar conversa
                  </button>
                )}
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite uma pergunta..."
                    disabled={isLoading}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isLoading ? '...' : '→'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Activities list */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingActivities ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Carregando...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center">
                      Nenhuma atividade registrada
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="text-xl flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeTime(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Refresh button */}
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={loadActivities}
                  disabled={isLoadingActivities}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isLoadingActivities ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
