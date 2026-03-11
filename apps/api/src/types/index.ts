/**
 * Hierarquia de prioridade para módulos
 * critico: MUST HAVE, fundamental
 * importante: SHOULD HAVE, significant
 * necessario: COULD HAVE, necessary for completeness
 * desejavel: NICE TO HAVE, desirable
 * opcional: WON'T HAVE, optional
 */
export type HierarchyLevel = 'critico' | 'importante' | 'necessario' | 'desejavel' | 'opcional';

/**
 * Módulo extraído de um PRD
 */
export interface ParsedModule {
  name: string;
  hierarchy: HierarchyLevel;
  description: string;
  components: string[];
}

/**
 * Story extraída de um PRD
 */
export interface ParsedStory {
  title: string;
  epic: string;
  description: string;
  dependencies: string[];
}

/**
 * Resultado do parsing de um PRD markdown
 */
export interface ParsedPRD {
  title: string;
  vision: string;
  modules: ParsedModule[];
  stories: ParsedStory[];
  warnings: string[];
}

/**
 * Arquivo lido de um repositório GitHub
 */
export interface GitHubFile {
  path: string;
  content: string;
  size: number;
}

/**
 * Resultado do clone de repositório GitHub
 */
export interface GitHubCloneResult {
  files: GitHubFile[];
  repoUrl: string;
  totalFiles: number;
  totalSize: number;
}

/**
 * Padrão de código extraído (função, componente, classe, etc)
 */
export interface CodePattern {
  type: 'function' | 'component' | 'class' | 'export' | 'route' | 'model';
  name: string;
  file: string;
  line: number;
  content?: string;
}

/**
 * Resultado da análise de um repositório
 */
export interface AnalysisResult {
  projectId: string;
  repoUrl: string;
  timestamp: Date;
  patterns: CodePattern[];
  moduleProgress: Record<string, number>;
  alerts: string[];
}
