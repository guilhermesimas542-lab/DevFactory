'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type AIModel = 'gemini' | 'groq';

interface ModelContextType {
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  availableModels: AIModel[];
  autoMode: boolean;
  setAutoMode: (auto: boolean) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<AIModel>('groq');
  const [autoMode, setAutoMode] = useState(false);
  const availableModels: AIModel[] = ['groq', 'gemini'];

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedModel') as AIModel | null;
    const savedAuto = localStorage.getItem('autoMode') === 'true';

    if (saved && ['gemini', 'groq'].includes(saved)) {
      setSelectedModel(saved);
    }
    setAutoMode(savedAuto);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('autoMode', String(autoMode));
  }, [autoMode]);

  return (
    <ModelContext.Provider value={{
      selectedModel,
      setSelectedModel,
      availableModels,
      autoMode,
      setAutoMode,
    }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within ModelProvider');
  }
  return context;
}
