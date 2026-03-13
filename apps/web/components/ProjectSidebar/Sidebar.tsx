'use client';

import { useEffect } from 'react';
import ChatView from './ChatView';
import FileTreeView from './FileTreeView';
import TerminalView from './TerminalView';
import { SidebarView } from './SidebarToggleBar';

interface SidebarProps {
  isOpen: boolean;
  activeView: SidebarView;
  onClose: () => void;
  projectId?: string;
  nodes?: any[];
}

export default function Sidebar({
  isOpen,
  activeView,
  onClose,
  projectId,
  nodes,
}: SidebarProps) {
  // Fechar ao pressionar ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Sidebar - Floating Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '380px',
          height: 'calc(100vh - 120px)',
          maxHeight: '90vh',
          background: '#141418',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          zIndex: 950,
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(30px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen
            ? '0 20px 25px -5px rgba(0,0,0,0.6), 0 10px 10px -5px rgba(0,0,0,0.4)'
            : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#F1F1F3',
              margin: 0,
              textTransform: 'capitalize',
            }}
          >
            {activeView === 'filetree' && '📁 Estrutura'}
            {activeView === 'chat' && '💬 Chat'}
            {activeView === 'terminal' && '🖥️ Terminal'}
            {activeView === 'settings' && '⚙️ Configurações'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'rgba(255,255,255,0.05)',
              color: '#6B7280',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
              (e.target as HTMLButtonElement).style.color = '#F1F1F3';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.target as HTMLButtonElement).style.color = '#6B7280';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'chat' && (
            <ChatView projectId={projectId} />
          )}
          {activeView === 'filetree' && (
            <FileTreeView nodes={nodes} />
          )}
          {activeView === 'terminal' && (
            <TerminalView projectId={projectId} />
          )}
          {activeView === 'settings' && (
            <div
              style={{
                padding: '20px',
                color: '#6B7280',
                fontSize: '13px',
              }}
            >
              <p>Configurações virão em breve...</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="bottom: 20px; right: 20px"] {
            width: calc(100% - 40px);
            max-width: 380px;
          }
        }
      `}</style>
    </>
  );
}
