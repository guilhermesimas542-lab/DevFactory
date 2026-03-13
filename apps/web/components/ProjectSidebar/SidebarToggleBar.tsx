'use client';

export type SidebarView = 'filetree' | 'chat' | 'settings' | 'terminal';

interface SidebarToggleBarProps {
  isOpen: boolean;
  activeView: SidebarView;
  onToggle: (view: SidebarView) => void;
}

export default function SidebarToggleBar({ isOpen, activeView, onToggle }: SidebarToggleBarProps) {
  const icons = [
    { id: 'filetree', icon: '📁', label: 'File Tree', title: 'Estrutura de Arquivos' },
    { id: 'chat', icon: '💬', label: 'Chat', title: 'Chat com IA' },
    { id: 'terminal', icon: '🖥️', label: 'Terminal', title: 'Terminal' },
    { id: 'settings', icon: '⚙️', label: 'Settings', title: 'Configurações' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000,
      }}
    >
      {icons.map((item) => {
        const isActive = isOpen && activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onToggle(item.id as SidebarView)}
            title={item.title}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              border: isActive ? '2px solid #6366F1' : '1px solid rgba(255,255,255,0.1)',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(22,22,26,0.8)',
              color: isActive ? '#6366F1' : '#6B7280',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
                (e.target as HTMLButtonElement).style.color = '#F1F1F3';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.target as HTMLButtonElement).style.color = '#6B7280';
              }
            }}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
}
