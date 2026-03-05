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
