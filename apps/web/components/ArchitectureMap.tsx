'use client';

import { useState, useRef } from 'react';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0D0D0F;
    --grid-dot: rgba(255,255,255,0.06);
    --node-bg: #16161A;
    --node-border: rgba(255,255,255,0.08);
    --node-border-hover: rgba(255,255,255,0.22);
    --node-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.6);
    --text: #F1F1F3;
    --text-dim: #6B7280;
    --text-mono: #A78BFA;
    --edge: rgba(255,255,255,0.1);
    --font: 'DM Sans', sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }
  body { background: var(--bg); font-family: var(--font); overflow: hidden; }

  .canvas-wrap {
    width: 100%; height: 100%;
    position: relative; overflow: hidden;
    background-color: var(--bg);
    background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  /* subtle radial glow in center */
  .canvas-wrap::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 900px; height: 600px;
    background: radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .canvas {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    cursor: grab;
    z-index: 1;
  }
  .canvas.dragging { cursor: grabbing; }

  /* NODE */
  .node {
    position: absolute;
    background: var(--node-bg);
    border: 1px solid var(--node-border);
    border-radius: 14px;
    padding: 0;
    cursor: pointer;
    transition: border-color 200ms, box-shadow 200ms, transform 150ms;
    box-shadow: var(--node-shadow);
    user-select: none;
    min-width: 180px;
  }
  .node:hover {
    border-color: var(--node-border-hover);
    transform: translateY(-2px);
  }
  .node.selected {
    border-color: var(--accent, #6366F1) !important;
    box-shadow: 0 0 0 1px var(--accent, #6366F1), 0 0 20px rgba(99,102,241,0.25), 0 8px 32px rgba(0,0,0,0.7) !important;
  }
  .node.root {
    min-width: 200px;
  }

  .node.child {
    min-width: 140px;
  }
  .node.child .node-header {
    padding: 8px 12px 6px;
  }
  .node.child .node-name { font-size: 11px; }
  .node.child .node-type { font-size: 9px; }
  .node.child .node-body { padding: 6px 12px 8px; }

  .node-footer {
    padding: 8px 12px;
    border-top: 1px solid rgba(255,255,255,0.03);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    transition: color 200ms;
  }
  .node-footer:hover { color: rgba(255,255,255,0.6); }

  .node-header {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .node-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
  }
  .node-name { font-size: 13px; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
  .node-type { font-size: 10px; color: var(--text-dim); font-family: var(--mono); margin-top: 1px; }

  .node-body { padding: 10px 14px 12px; }
  .node-progress-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .node-pct { font-family: var(--mono); font-size: 12px; font-weight: 500; min-width: 32px; }
  .node-track { flex: 1; height: 4px; background: rgba(255,255,255,0.07); border-radius: 999px; overflow: hidden; }
  .node-fill { height: 100%; border-radius: 999px; transition: width 600ms ease; }

  .node-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .node-tag {
    font-size: 10px; font-family: var(--mono);
    padding: 2px 7px; border-radius: 5px;
    color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
  }

  .node-status-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    margin-left: auto;
  }

  /* EDGE SVG */
  .edges-svg {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    overflow: visible;
    z-index: 1;
  }

  /* DETAIL PANEL */
  .detail-panel {
    position: absolute; right: 20px; top: 50%;
    transform: translateY(-50%);
    width: 300px;
    background: #111114;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.8);
    transition: opacity 250ms, transform 250ms;
    z-index: 100;
  }
  .detail-panel.hidden { opacity: 0; pointer-events: none; transform: translateY(-50%) translateX(12px); }

  .panel-header {
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: flex-start; gap: 12px;
  }
  .panel-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .panel-title { font-size: 15px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); }
  .panel-subtitle { font-size: 11px; color: var(--text-dim); font-family: var(--mono); margin-top: 2px; }
  .panel-close { margin-left: auto; cursor: pointer; color: var(--text-dim); font-size: 18px; line-height: 1; padding: 2px; opacity: 0.6; }
  .panel-close:hover { opacity: 1; }

  .panel-breadcrumb { padding: 8px 20px 8px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; gap: 6px; overflow-x: auto; }
  .breadcrumb-item { font-size: 10px; color: var(--text-dim); cursor: pointer; transition: color 200ms; padding: 4px 0; flex-shrink: 0; }
  .breadcrumb-item:hover { color: var(--text); }
  .breadcrumb-item.active { color: var(--text); font-weight: 600; }
  .breadcrumb-sep { color: rgba(255,255,255,0.15); font-size: 10px; margin: 0 2px; }

  .panel-body { padding: 16px 20px 20px; }
  .panel-section-label { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px; margin-top: 14px; }
  .panel-section-label:first-child { margin-top: 0; }
  .panel-desc { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6; }

  .progress-big { margin: 10px 0 6px; }
  .progress-big-track { height: 6px; background: rgba(255,255,255,0.07); border-radius: 999px; overflow: hidden; }
  .progress-big-fill { height: 100%; border-radius: 999px; }
  .progress-big-label { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: var(--text-dim); font-family: var(--mono); }

  .component-list { display: flex; flex-direction: column; gap: 6px; }
  .component-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    font-size: 12px; color: rgba(255,255,255,0.65);
  }
  .component-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* TOOLBAR */
  .toolbar {
    position: absolute; bottom: 24px; left: 50%;
    transform: translateX(-50%);
    display: flex; align-items: center; gap: 6px;
    background: #111114; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 6px 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    z-index: 100;
  }
  .toolbar-btn {
    padding: 6px 12px; border-radius: 8px; border: none;
    background: transparent; color: rgba(255,255,255,0.5);
    font-family: var(--font); font-size: 12px; cursor: pointer;
    transition: all 150ms;
    display: flex; align-items: center; gap: 6px;
  }
  .toolbar-btn:hover { background: rgba(255,255,255,0.07); color: var(--text); }
  .toolbar-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.08); margin: 0 2px; }

  /* LEGEND */
  .legend {
    position: absolute; left: 20px; bottom: 24px;
    display: flex; flex-direction: column; gap: 6px;
    z-index: 100;
  }
  .legend-item { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text-dim); }
  .legend-dot { width: 8px; height: 8px; border-radius: 3px; flex-shrink: 0; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeUp 350ms ease forwards; }
`;

const TYPE_MAP: Record<string, { color: string; icon: string; label: string }> = {
  root:        { color: '#6366F1', icon: '⬡', label: 'Projeto' },
  frontend:    { color: '#38BDF8', icon: '◱', label: 'Frontend' },
  backend:     { color: '#7C3AED', icon: '⬙', label: 'Backend' },
  database:    { color: '#10B981', icon: '⬚', label: 'Database' },
  auth:        { color: '#F59E0B', icon: '◉', label: 'Auth' },
  infra:       { color: '#EF4444', icon: '⬘', label: 'Infra' },
  integration: { color: '#EC4899', icon: '◈', label: 'Integration' },
};

const STATUS_COLOR: Record<string, string> = { done: '#10B981', progress: '#F59E0B', pending: '#4B5563' };

export interface ArchNode {
  id: string;
  type: 'root' | 'frontend' | 'backend' | 'database' | 'auth' | 'infra' | 'integration';
  x: number;
  y: number;
  name: string;
  subtype: string;
  pct: number;
  status: 'done' | 'progress' | 'pending';
  desc: string;
  tags: string[];
  components: Array<{ name: string; status: 'done' | 'progress' | 'pending' }>;
}

export interface ArchEdge {
  from: string;
  to: string;
}

interface ArchitectureMapProps {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

function getCenter(node: ArchNode) {
  return { x: node.x + 90, y: node.y + 54 };
}

// Calculate exit point on parent node border (closest to target)
function getExitPoint(parentNode: ArchNode | undefined, targetNode: { x: number; y: number } | undefined): { x: number; y: number } {
  if (!parentNode || !targetNode) return { x: 0, y: 0 };

  const parentCenter = getCenter(parentNode);
  if (!parentCenter) return { x: 0, y: 0 };

  const parentWidth = 200;
  const parentHeight = 108;

  // Vector from parent to target
  const dx = targetNode.x - parentCenter.x;
  const dy = targetNode.y - parentCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return parentCenter;

  // Normalized direction
  const nx = dx / dist;
  const ny = dy / dist;

  // Find intersection with parent rectangle border
  const halfW = parentWidth / 2;
  const halfH = parentHeight / 2;

  let t = Infinity;

  // Check all 4 sides
  if (nx > 0) t = Math.min(t, (halfW) / nx); // Right side
  if (nx < 0) t = Math.min(t, (-halfW) / nx); // Left side
  if (ny > 0) t = Math.min(t, (halfH) / ny); // Bottom side
  if (ny < 0) t = Math.min(t, (-halfH) / ny); // Top side

  return {
    x: parentCenter.x + nx * t,
    y: parentCenter.y + ny * t,
  };
}

// Calculate entry point on child node border (closest to parent)
function getEntryPoint(childNode: { x: number; y: number } | undefined, parentCenter: { x: number; y: number } | undefined): { x: number; y: number } {
  if (!childNode || !parentCenter) return { x: 0, y: 0 };

  const childCenter = { x: childNode.x + 70, y: childNode.y + 50 };
  const childWidth = 140;
  const childHeight = 100;

  // Vector from child to parent
  const dx = parentCenter.x - childCenter.x;
  const dy = parentCenter.y - childCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return childCenter;

  // Normalized direction
  const nx = dx / dist;
  const ny = dy / dist;

  // Find intersection with child rectangle border
  const halfW = childWidth / 2;
  const halfH = childHeight / 2;

  let t = Infinity;

  // Check all 4 sides
  if (nx > 0) t = Math.min(t, (halfW) / nx);
  if (nx < 0) t = Math.min(t, (-halfW) / nx);
  if (ny > 0) t = Math.min(t, (halfH) / ny);
  if (ny < 0) t = Math.min(t, (-halfH) / ny);

  return {
    x: childCenter.x + nx * t,
    y: childCenter.y + ny * t,
  };
}

function getChildPosition(parentNode: ArchNode, childIndex: number) {
  const CHILD_HEIGHT = 100;
  const CHILD_WIDTH = 140;
  const GAP = 20;
  const OFFSET_RIGHT = 240; // Further to the right to avoid overlap

  // Arrange children in a grid (3 columns)
  const COLUMNS = 3;
  const col = childIndex % COLUMNS;
  const row = Math.floor(childIndex / COLUMNS);

  const startY = parentNode.y + 180; // Below the parent
  const childY = startY + row * (CHILD_HEIGHT + GAP);
  const childX = parentNode.x + OFFSET_RIGHT + col * (CHILD_WIDTH + GAP);

  return { x: childX, y: childY };
}

export default function ArchitectureMap({ nodes: initialNodes, edges }: ArchitectureMapProps) {
  const [selectionPath, setSelectionPath] = useState<string[]>([]); // e.g., ["dashboard"] or ["dashboard", "StoryBoard"]
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Node dragging state
  const [nodeDragStart, setNodeDragStart] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [nodeMoved, setNodeMoved] = useState(false);
  const DRAG_THRESHOLD = 5;

  // Node expansion state (for showing/hiding components)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Node positions (can be updated by dragging)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(
    Object.fromEntries(initialNodes.map(n => [n.id, { x: n.x, y: n.y }]))
  );

  // Update nodes with current positions
  const nodes = initialNodes.map(n => ({
    ...n,
    x: nodePositions[n.id]?.x || n.x,
    y: nodePositions[n.id]?.y || n.y,
  }));

  // Get the currently selected node (could be parent or child)
  const getSelectedNode = () => {
    if (selectionPath.length === 0) return null;

    const parentId = selectionPath[0];
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return null;

    // If selection path has 2 items, it's a child selection
    if (selectionPath.length === 2) {
      const childName = selectionPath[1];
      const childComponent = parentNode.components?.find(c => c.name === childName);
      if (childComponent) {
        return {
          id: `${parentId}-${childName}`,
          name: childComponent.name,
          status: childComponent.status,
          type: parentNode.type,
          isChild: true,
          parentNode,
        } as any;
      }
    }

    return parentNode;
  };

  const selectedNode = getSelectedNode();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Canvas pan handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node') ||
        (e.target as HTMLElement).closest('.detail-panel') ||
        (e.target as HTMLElement).closest('.toolbar') ||
        (e.target as HTMLElement).closest('.breadcrumb-item')) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Handle node dragging
    if (nodeDragStart) {
      const deltaX = e.clientX - nodeDragStart.x;
      const deltaY = e.clientY - nodeDragStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > DRAG_THRESHOLD) {
        if (!nodeMoved) {
          setNodeMoved(true); // Mark that we've moved past threshold
        }
        // Update node position
        setNodePositions(prev => ({
          ...prev,
          [nodeDragStart.nodeId]: {
            x: prev[nodeDragStart.nodeId].x + deltaX,
            y: prev[nodeDragStart.nodeId].y + deltaY,
          },
        }));
        // Update drag start for next frame
        setNodeDragStart({ ...nodeDragStart, x: e.clientX, y: e.clientY });
      }
      return;
    }

    // Handle canvas panning
    if (!dragging || !dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleCanvasMouseUp = () => {
    setDragging(false);
    setNodeDragStart(null);
    setNodeMoved(false);
  };

  // Node drag handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setNodeDragStart({ x: e.clientX, y: e.clientY, nodeId });
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    // Only toggle selection if this wasn't actually a drag
    if (nodeMoved) {
      return; // Was a drag, don't select
    }
    const isSelected = selectionPath[0] === nodeId;
    setSelectionPath(isSelected ? [] : [nodeId]);
  };

  const handleChildNodeMouseDown = (e: React.MouseEvent, parentId: string, childName: string) => {
    e.stopPropagation();
    const childId = `${parentId}-${childName}`;
    setNodeDragStart({ x: e.clientX, y: e.clientY, nodeId: childId });
  };

  const handleChildNodeClick = (e: React.MouseEvent, parentId: string, childName: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Only toggle selection if this wasn't actually a drag
    if (nodeMoved) {
      return; // Was a drag, don't select
    }
    // If already selected this child, deselect it. Otherwise select it.
    const isSelected = selectionPath[0] === parentId && selectionPath[1] === childName;
    if (isSelected) {
      setSelectionPath([parentId]); // Go back to parent
    } else {
      setSelectionPath([parentId, childName]); // Select child
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`canvas-wrap ${dragging ? 'dragging' : ''}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        {/* CANVAS (pan) */}
        <div
          className="canvas"
          ref={canvasRef}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
          {/* EDGES */}
          <svg className="edges-svg">
            {edges.map((edge, i) => {
              const from = nodes.find(n => n.id === edge.from);
              const to = nodes.find(n => n.id === edge.to);
              if (!from || !to) return null;
              const f = getCenter(from);
              const t = getCenter(to);
              const isActive = selectionPath[0] === edge.from || selectionPath[0] === edge.to;
              const my = (f.y + t.y) / 2;
              const mx = (f.x + t.x) / 2;
              const typeColor = TYPE_MAP[to.type]?.color || '#fff';
              return (
                <g key={i}>
                  <path
                    d={`M${f.x},${f.y} C${f.x},${my} ${t.x},${my} ${t.x},${t.y}`}
                    fill="none"
                    stroke={isActive ? typeColor : 'rgba(255,255,255,0.08)'}
                    strokeWidth={isActive ? 1.5 : 1}
                    strokeDasharray={isActive ? 'none' : '4 4'}
                    style={{ transition: 'stroke 200ms, stroke-width 200ms' }}
                    filter={isActive ? `drop-shadow(0 0 4px ${typeColor}60)` : 'none'}
                  />
                  {isActive && (
                    <circle cx={mx} cy={my} r={3} fill={typeColor} opacity={0.7} />
                  )}
                </g>
              );
            })}

            {/* CHILD NODE CONNECTIONS (parent to component edges) */}
            {nodes.map(parentNode => {
              if (!parentNode || !expandedNodes.has(parentNode.id) || !parentNode.components || parentNode.components.length === 0) {
                return null;
              }
              return parentNode.components.map((component, childIndex) => {
                const childPos = getChildPosition(parentNode, childIndex);
                const parentCenter = getCenter(parentNode);
                const typeColor = TYPE_MAP[parentNode.type]?.color || '#fff';

                if (!childPos || !parentCenter) {
                  return null;
                }

                // Get entry and exit points for smooth lines from border to border
                const exitPoint = getExitPoint(parentNode, childPos);
                const entryPoint = getEntryPoint(childPos, parentCenter);

                // Calculate control points for smooth bezier curve
                const midX = (exitPoint.x + entryPoint.x) / 2;
                const midY = (exitPoint.y + entryPoint.y) / 2;
                const offsetX = (entryPoint.y - exitPoint.y) * 0.3;
                const offsetY = (exitPoint.x - entryPoint.x) * 0.3;

                const pathData = `M${exitPoint.x},${exitPoint.y} Q${midX + offsetX},${midY + offsetY} ${entryPoint.x},${entryPoint.y}`;

                return (
                  <g key={`edge-${parentNode.id}-${component.name}`}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={typeColor}
                      strokeWidth="2"
                      opacity="0.6"
                      style={{ transition: 'opacity 300ms, stroke-width 300ms' }}
                    />
                  </g>
                );
              });
            })}
          </svg>

          {/* NODES */}
          {nodes.map(node => {
            const typeInfo = TYPE_MAP[node.type];
            const isSelected = selectionPath[0] === node.id;
            const isDragging = nodeDragStart?.nodeId === node.id && nodeMoved;
            const statusColor = STATUS_COLOR[node.status];

            return (
              <div
                key={node.id}
                className={`node fade-in ${node.type === 'root' ? 'root' : ''} ${isSelected ? 'selected' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  '--accent': typeInfo.color,
                  cursor: isDragging ? 'grabbing' : 'pointer',
                  transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isDragging
                    ? `0 0 0 1px ${typeInfo.color}, 0 0 30px ${typeInfo.color}40, 0 12px 48px rgba(0,0,0,0.8)`
                    : undefined,
                  transition: isDragging ? 'none' : 'transform 150ms, box-shadow 150ms',
                } as React.CSSProperties}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onClick={(e) => handleNodeClick(e, node.id)}
              >
                <div className="node-header">
                  <div
                    className="node-icon"
                    style={{ background: `${typeInfo.color}18`, border: `1px solid ${typeInfo.color}35` }}
                  >
                    <span>{typeInfo.icon}</span>
                  </div>
                  <div>
                    <div className="node-name">{node.name}</div>
                    <div className="node-type">{node.subtype}</div>
                  </div>
                  <div className="node-status-dot" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}80` }} />
                </div>
                <div className="node-body">
                  <div className="node-progress-row">
                    <div className="node-pct" style={{ color: typeInfo.color }}>{node.pct}%</div>
                    <div className="node-track">
                      <div className="node-fill" style={{ width: `${node.pct}%`, background: `linear-gradient(90deg, ${typeInfo.color}80, ${typeInfo.color})` }} />
                    </div>
                  </div>
                  <div className="node-tags">
                    {node.tags.map(tag => (
                      <span key={tag} className="node-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Footer with expand button (only for nodes with components) */}
                {node.components && node.components.length > 0 && (
                  <div
                    className="node-footer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedNodes(prev => {
                        const next = new Set(prev);
                        if (next.has(node.id)) {
                          next.delete(node.id);
                        } else {
                          next.add(node.id);
                        }
                        return next;
                      });
                    }}
                  >
                    {expandedNodes.has(node.id) ? '▼' : '▶'} {node.components.length} componente{node.components.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}

          {/* CHILD NODES (rendered after parent nodes) */}
          {nodes.map(parentNode =>
            expandedNodes.has(parentNode.id) && parentNode.components && parentNode.components.length > 0
              ? parentNode.components.map((component, childIndex) => {
                  const childId = `${parentNode.id}-${component.name}`;
                  const defaultPos = getChildPosition(parentNode, childIndex);
                  const childPos = nodePositions[childId] || defaultPos;
                  const typeInfo = TYPE_MAP[parentNode.type];
                  const statusColor = STATUS_COLOR[component.status];
                  const isSelected = selectionPath[0] === parentNode.id && selectionPath[1] === component.name;
                  const isDragging = nodeDragStart?.nodeId === childId && nodeMoved;

                  return (
                    <div
                      key={childId}
                      className={`node child fade-in ${isSelected ? 'selected' : ''}`}
                      style={{
                        left: childPos.x,
                        top: childPos.y,
                        '--accent': typeInfo.color,
                        cursor: isDragging ? 'grabbing' : 'pointer',
                        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: isDragging
                          ? `0 0 0 1px ${typeInfo.color}, 0 0 30px ${typeInfo.color}40, 0 12px 48px rgba(0,0,0,0.8)`
                          : undefined,
                        transition: isDragging ? 'none' : 'transform 150ms, box-shadow 150ms',
                      } as React.CSSProperties}
                      onMouseDown={(e) => handleChildNodeMouseDown(e, parentNode.id, component.name)}
                      onClick={(e) => handleChildNodeClick(e, parentNode.id, component.name)}
                    >
                      <div className="node-header">
                        <div
                          className="node-icon"
                          style={{ background: `${typeInfo.color}18`, border: `1px solid ${typeInfo.color}35`, width: 24, height: 24, fontSize: 12 }}
                        >
                          {component.status === 'done' ? '✓' : '◉'}
                        </div>
                        <div>
                          <div className="node-name">{component.name}</div>
                          <div className="node-type">{component.status}</div>
                        </div>
                        <div className="node-status-dot" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}80` }} />
                      </div>
                    </div>
                  );
                })
              : null
          )}
        </div>

        {/* DETAIL PANEL */}
        {selectedNode && (
          <div className="detail-panel fade-in">
            {selectionPath.length > 0 && (
              <div className="panel-breadcrumb">
                {selectionPath.map((nodeId, index) => {
                  const parentNode = nodes.find(n => n.id === nodeId);
                  const isLast = index === selectionPath.length - 1;
                  const isChild = index === 1; // Second level (child)

                  return (
                    <div key={nodeId} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {index > 0 && <span className="breadcrumb-sep">/</span>}
                      <span
                        className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                        onClick={() => {
                          if (!isLast) {
                            setSelectionPath([nodeId]);
                          }
                        }}
                      >
                        {isChild && selectionPath.length > 1
                          ? selectionPath[1]
                          : (parentNode?.name || nodeId)
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="panel-header">
              <div
                className="panel-icon"
                style={{
                  background: `${TYPE_MAP[selectedNode.type].color}18`,
                  border: `1px solid ${TYPE_MAP[selectedNode.type].color}35`
                }}
              >
                {(selectedNode as any).isChild ? '◆' : TYPE_MAP[selectedNode.type].icon}
              </div>
              <div>
                <div className="panel-title">{selectedNode.name}</div>
                <div className="panel-subtitle">
                  {(selectedNode as any).isChild
                    ? (selectedNode as any).status
                    : selectedNode.subtype
                  }
                </div>
              </div>
              <span className="panel-close" onClick={() => setSelectionPath([])}>×</span>
            </div>
            <div className="panel-body">
              {!(selectedNode as any).isChild ? (
                <>
                  <div className="panel-section-label">O que é isso</div>
                  <div className="panel-desc">{selectedNode.desc || 'Sem descrição'}</div>

                  <div className="panel-section-label">Progresso</div>
                  <div className="progress-big">
                    <div className="progress-big-track">
                      <div
                        className="progress-big-fill"
                        style={{
                          width: `${selectedNode.pct || 0}%`,
                          background: `linear-gradient(90deg, ${TYPE_MAP[selectedNode.type].color}60, ${TYPE_MAP[selectedNode.type].color})`
                        }}
                      />
                    </div>
                    <div className="progress-big-label">
                      <span>0%</span>
                      <span style={{ color: TYPE_MAP[selectedNode.type].color, fontWeight: 600 }}>{selectedNode.pct || 0}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {selectedNode.components && selectedNode.components.length > 0 && (
                    <>
                      <div className="panel-section-label">Componentes</div>
                      <div className="component-list">
                        {selectedNode.components.map((c: { name: string; status: 'done' | 'progress' | 'pending' }, i: number) => (
                          <div
                            key={i}
                            className="component-item"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => handleChildNodeClick(e as any, selectedNode.id, c.name)}
                          >
                            <div
                              className="component-dot"
                              style={{ background: STATUS_COLOR[c.status] }}
                            />
                            <span>{c.name}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="panel-section-label">Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: STATUS_COLOR[(selectedNode as any).status || 'pending'],
                        boxShadow: `0 0 8px ${STATUS_COLOR[(selectedNode as any).status || 'pending']}60`
                      }}
                    />
                    <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>
                      {(selectedNode as any).status || 'pending'}
                    </span>
                  </div>
                  <div className="panel-section-label">Descrição</div>
                  <div className="panel-desc">
                    {(selectedNode as any).parentNode?.desc || 'Este é um componente do módulo acima.'}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        <div className="toolbar">
          <button className="toolbar-btn" onClick={() => setOffset({ x: 0, y: 0 })}>
            ⊕ Centralizar
          </button>
          <div className="toolbar-sep" />
          <button className="toolbar-btn" onClick={() => setSelectionPath([])}>
            ◻ Limpar seleção
          </button>
          <div className="toolbar-sep" />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace', padding: '0 4px' }}>
            arraste para mover · clique nos nós
          </span>
        </div>

        {/* LEGEND */}
        <div className="legend">
          {Object.entries(TYPE_MAP).filter(([k]) => k !== 'root').map(([key, val]) => (
            <div key={key} className="legend-item">
              <div className="legend-dot" style={{ background: val.color }} />
              {val.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
