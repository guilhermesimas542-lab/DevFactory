'use client';

import { HexagonData } from '../lib/hexagon';
import { Component } from './ComponentsList';
import ComponentsList from './ComponentsList';

interface SidePanelProps {
  module: HexagonData | null;
  onClose: () => void;
  components?: Component[];
}

const HIERARCHY_LABELS = {
  critico: 'Crítico',
  importante: 'Importante',
  necessario: 'Necessário',
  desejavel: 'Desejável',
  opcional: 'Opcional',
};

const HIERARCHY_COLORS = {
  critico: { bg: 'bg-red-100', badge: 'bg-red-500', text: 'text-red-900' },
  importante: { bg: 'bg-orange-100', badge: 'bg-orange-500', text: 'text-orange-900' },
  necessario: { bg: 'bg-blue-100', badge: 'bg-blue-500', text: 'text-blue-900' },
  desejavel: { bg: 'bg-green-100', badge: 'bg-green-500', text: 'text-green-900' },
  opcional: { bg: 'bg-gray-100', badge: 'bg-gray-500', text: 'text-gray-900' },
};

export default function SidePanel({ module, onClose, components = [] }: SidePanelProps) {
  if (!module) {
    return null;
  }

  const colors = HIERARCHY_COLORS[module.hierarchy];
  const hierarchyLabel = HIERARCHY_LABELS[module.hierarchy];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 h-fit">
      {/* Header with close button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{module.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          aria-label="Fechar painel"
        >
          ✕
        </button>
      </div>

      {/* Hierarchy badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${colors.badge}`}>
          {hierarchyLabel}
        </span>
      </div>

      {/* Description */}
      {module.description && (
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">{module.description}</p>
        </div>
      )}

      {/* Progress section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-bold text-gray-900">{module.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${module.progress}%` }}
          />
        </div>
      </div>

      {/* Components list */}
      {components.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <ComponentsList components={components} />
        </div>
      )}
    </div>
  );
}
