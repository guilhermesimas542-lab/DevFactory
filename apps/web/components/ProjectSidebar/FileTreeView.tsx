'use client';

import { useState } from 'react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  level: number;
}

interface FileTreeViewProps {
  nodes?: any[];
}

export default function FileTreeView({ nodes }: FileTreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Usar os nós do mapa como estrutura ou criar uma árvore de exemplo
  const fileTree: FileNode[] = nodes
    ? nodes.map((node) => ({
        id: node.id,
        name: node.name,
        type: 'folder' as const,
        level: 0,
        children: node.components
          ? node.components.map((comp: any, cidx: number) => ({
              id: `${node.id}-${cidx}`,
              name: comp.name,
              type: 'file' as const,
              level: 1,
            }))
          : [],
      }))
    : [
        {
          id: 'dashboard',
          name: 'Dashboard',
          type: 'folder',
          level: 0,
          children: [
            { id: 'layout', name: 'ProjectLayout', type: 'file', level: 1 },
            { id: 'map', name: 'ArchitectureMap', type: 'file', level: 1 },
          ],
        },
        {
          id: 'api',
          name: 'API Server',
          type: 'folder',
          level: 0,
          children: [
            { id: 'routes', name: 'Routes', type: 'file', level: 1 },
            { id: 'auth', name: 'Authentication', type: 'file', level: 1 },
          ],
        },
      ];

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const FileTreeItem = ({ node }: { node: FileNode }) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expanded.has(node.id);

    return (
      <div key={node.id}>
        <div
          style={{
            paddingLeft: `${node.level * 16 + 8}px`,
            paddingRight: '8px',
            paddingTop: '6px',
            paddingBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: isFolder ? 'pointer' : 'default',
            userSelect: 'none',
            color: '#F1F1F3',
            fontSize: '13px',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => {
            if (isFolder) {
              (e.currentTarget as HTMLDivElement).style.background =
                'rgba(255,255,255,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
          onClick={() => isFolder && toggleExpanded(node.id)}
        >
          {isFolder ? (
            <>
              <span
                style={{
                  fontSize: '10px',
                  color: '#6B7280',
                  transition: 'transform 150ms',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                ▶
              </span>
              <span>📁</span>
            </>
          ) : (
            <>
              <span style={{ width: '10px' }} />
              <span>📄</span>
            </>
          )}
          <span>{node.name}</span>
        </div>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeItem key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0C0C10',
        padding: '16px 0',
      }}
    >
      <div style={{ padding: '0 16px', marginBottom: '12px' }}>
        <h3
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          Estrutura do Projeto
        </h3>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          color: '#F1F1F3',
        }}
      >
        {fileTree.map((node) => (
          <FileTreeItem key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
