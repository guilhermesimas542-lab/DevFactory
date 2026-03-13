'use client';

import { useEffect } from 'react';
import ChatView from './ChatView';
import FileTreeView from './FileTreeView';
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
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 900,
            animation: 'fadeIn 200ms ease-out',
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'clamp(100%, 380px, 100%)',
          background: '#141418',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          zIndex: 950,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen
            ? '-2px 0 12px rgba(0,0,0,0.4)'
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
          [style*="right: 0; bottom: 0; width"] {
            width: 100%;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
