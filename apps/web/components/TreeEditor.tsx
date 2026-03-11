'use client';

import { useState } from 'react';

export interface TreeNode {
  moduleId: string;
  name: string;
  hierarchy: string;
  description?: string | null;
  components: Array<{
    componentId: string;
    name: string;
  }>;
}

interface TreeEditorProps {
  modules: TreeNode[];
  onUpdate: (updates: Array<any>) => void;
  loading?: boolean;
}

export default function TreeEditor({ modules, onUpdate, loading = false }: TreeEditorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [edited, setEdited] = useState<Map<string, TreeNode>>(new Map(modules.map(m => [m.moduleId, m])));
  const [deletedModules, setDeletedModules] = useState<Set<string>>(new Set());

  const toggleExpand = (moduleId: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpanded(newExpanded);
  };

  const updateModuleName = (moduleId: string, newName: string) => {
    const updated = new Map(edited);
    const mod = updated.get(moduleId);
    if (mod) {
      updated.set(moduleId, { ...module, name: newName });
      setEdited(updated);
    }
  };

  const updateModuleHierarchy = (moduleId: string, newHierarchy: string) => {
    const updated = new Map(edited);
    const mod = updated.get(moduleId);
    if (mod) {
      updated.set(moduleId, { ...module, hierarchy: newHierarchy });
      setEdited(updated);
    }
  };

  const updateComponentName = (moduleId: string, componentId: string, newName: string) => {
    const updated = new Map(edited);
    const mod = updated.get(moduleId);
    if (mod) {
      const newComponents = mod.components.map(c =>
        c.componentId === componentId ? { ...c, name: newName } : c
      );
      updated.set(moduleId, { ...module, components: newComponents });
      setEdited(updated);
    }
  };

  const deleteModule = (moduleId: string) => {
    const newDeleted = new Set(deletedModules);
    if (newDeleted.has(moduleId)) {
      newDeleted.delete(moduleId);
    } else {
      newDeleted.add(moduleId);
    }
    setDeletedModules(newDeleted);
  };

  const handleConfirm = () => {
    const updates = Array.from(edited.values())
      .filter(m => !deletedModules.has(m.moduleId))
      .map(m => ({
        moduleId: m.moduleId,
        name: m.name,
        hierarchy: m.hierarchy,
        components: m.components,
      }));

    onUpdate(updates);
  };

  const hierarchyOptions = ['critico', 'importante', 'necessario', 'desejavel', 'opcional'];
  const hierarchyColors: Record<string, string> = {
    critico: 'text-red-600 bg-red-50',
    importante: 'text-orange-600 bg-orange-50',
    necessario: 'text-yellow-600 bg-yellow-50',
    desejavel: 'text-green-600 bg-green-50',
    opcional: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
        <h3 className="font-semibold text-blue-900 mb-2">Instruções</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Clique nas setas para expandir/colapsar módulos</li>
          <li>• Edite nomes clicando nos campos</li>
          <li>• Use o dropdown para mudar a hierarquia</li>
          <li>• Clique no "X" para deletar um módulo</li>
        </ul>
      </div>

      <div className="space-y-3">
        {modules.map(module => {
          const isDeleted = deletedModules.has(module.moduleId);
          const isExpanded = expanded.has(module.moduleId);
          const editedModule = edited.get(module.moduleId) || module;

          return (
            <div key={module.moduleId} className={isDeleted ? 'opacity-50 line-through' : ''}>
              {/* Module Header */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                <button
                  onClick={() => toggleExpand(module.moduleId)}
                  className="text-lg font-bold text-gray-600 hover:text-gray-900"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>

                <input
                  type="text"
                  value={editedModule.name}
                  onChange={e => updateModuleName(module.moduleId, e.target.value)}
                  disabled={isDeleted}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded font-semibold disabled:opacity-50"
                />

                <select
                  value={editedModule.hierarchy}
                  onChange={e => updateModuleHierarchy(module.moduleId, e.target.value)}
                  disabled={isDeleted}
                  className={`px-2 py-1 rounded text-sm font-medium disabled:opacity-50 ${
                    hierarchyColors[editedModule.hierarchy] || 'bg-gray-100'
                  }`}
                >
                  {hierarchyOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => deleteModule(module.moduleId)}
                  className={`px-3 py-1 rounded font-semibold ${
                    isDeleted
                      ? 'bg-gray-400 text-white hover:bg-gray-500'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {isDeleted ? '↶' : '✕'}
                </button>
              </div>

              {/* Description */}
              {editedModule.description && (
                <div className="ml-8 text-sm text-gray-600 py-1">{editedModule.description}</div>
              )}

              {/* Components (expanded) */}
              {isExpanded && (
                <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-300 pl-4">
                  {editedModule.components.map(component => (
                    <div key={component.componentId} className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                      <span className="text-gray-600">•</span>
                      <input
                        type="text"
                        value={component.name}
                        onChange={e => updateComponentName(module.moduleId, component.componentId, e.target.value)}
                        disabled={isDeleted}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Salvando...' : '✓ Confirmar'}
        </button>
      </div>
    </div>
  );
}
