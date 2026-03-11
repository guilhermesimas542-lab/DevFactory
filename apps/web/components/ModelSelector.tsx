'use client';

import { useState, useEffect } from 'react';
import { useModel, type AIModel } from '@/contexts/ModelContext';

interface ModelInfo {
  id: AIModel;
  name: string;
  emoji: string;
}

const MODELS: ModelInfo[] = [
  {
    id: 'groq',
    name: 'Mixtral 8x7B',
    emoji: '⚡',
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0',
    emoji: '✨',
  },
];

export default function ModeSelector() {
  const { selectedModel, setSelectedModel, autoMode, setAutoMode } = useModel();
  const [isOpen, setIsOpen] = useState(false);

  // Close modal when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const currentModel = MODELS.find(m => m.id === selectedModel);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 150ms',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
        }}
      >
        <span style={{ fontSize: 14 }}>{currentModel?.emoji}</span>
        <span>{currentModel?.name}</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-border)',
              borderRadius: 12,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 1000,
              width: '90%',
              maxWidth: 400,
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: 4,
              }}>
                Mode Selector
              </h2>
              <p style={{
                fontSize: 13,
                color: 'var(--text-tertiary)',
                margin: 0,
              }}>
                Choose your preferred AI model
              </p>
            </div>

            {/* Auto Mode Toggle */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--bg-border)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              cursor: 'pointer',
            }}
              onClick={() => setAutoMode(!autoMode)}
            >
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={autoMode}
                  onChange={() => {}}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: 'pointer',
                    accentColor: 'var(--accent)',
                  }}
                />
                <div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}>
                    🤖 Auto Mode
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-tertiary)',
                    marginTop: 2,
                  }}>
                    Chooses best available model
                  </div>
                </div>
              </label>
            </div>

            {/* Models */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                marginBottom: 8,
                letterSpacing: '0.05em',
              }}>
                Available Models
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MODELS.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setAutoMode(false);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: 12,
                      background: selectedModel === model.id && !autoMode ? 'var(--accent)' : 'var(--bg-elevated)',
                      border: '1px solid var(--bg-border)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedModel !== model.id || autoMode) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--bg-border)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        selectedModel === model.id && !autoMode ? 'var(--accent)' : 'var(--bg-elevated)';
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{model.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: selectedModel === model.id && !autoMode ? 'white' : 'var(--text-primary)',
                      }}>
                        {model.name}
                      </div>
                    </div>
                    {selectedModel === model.id && !autoMode && (
                      <span style={{ fontSize: 16 }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div style={{
              padding: 12,
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}>
              {autoMode ? '🤖 Auto mode active' : `📍 Using ${currentModel?.name}`}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '10px 12px',
                background: 'transparent',
                border: '1px solid var(--bg-border)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              Close (Esc)
            </button>
          </div>
        </>
      )}
    </>
  );
}
