'use client';

import { useState, useRef, useEffect } from 'react';
import { useModel, type AIModel } from '@/contexts/ModelContext';

interface ModelInfo {
  id: AIModel;
  name: string;
  description: string;
}

const MODELS: ModelInfo[] = [
  {
    id: 'groq',
    name: 'Mixtral 8x7B (Groq)',
    description: 'Fast, free tier, no quota limits',
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0 Flash',
    description: 'Google\'s latest model',
  },
];

export default function ModelSelector() {
  const { selectedModel, setSelectedModel, autoMode, setAutoMode } = useModel();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = MODELS.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentModel = MODELS.find(m => m.id === selectedModel);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
        title="Select AI Model"
      >
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span>{currentModel?.name || 'Select Model'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          {/* Search Box */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search models"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="py-2">
            {/* Auto Mode Toggle */}
            <div className="px-3 py-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoMode}
                  onChange={(e) => setAutoMode(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Auto</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Choose best available</span>
              </label>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Model List */}
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setAutoMode(false);
                    setIsOpen(false);
                  }}
                  className="px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {model.name}
                      </span>
                      {selectedModel === model.id && !autoMode && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {model.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                No models found
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Footer */}
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              💡 Using {autoMode ? 'Auto mode' : selectedModel} for all AI requests
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
