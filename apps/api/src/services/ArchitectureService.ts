import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Architecture node returned by Gemini
 */
export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'frontend' | 'backend' | 'database' | 'auth' | 'infra' | 'integration' | 'other';
  description: string;
  why: string;
  parentId: string | null;
  components: Array<{
    name: string;
    description: string;
    status: 'pending' | 'partial' | 'implemented';
  }>;
}

/**
 * Connection between architecture nodes
 */
export interface ArchitectureConnection {
  from: string;
  to: string;
}

/**
 * Complete architecture data structure
 */
export interface ArchitectureData {
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
}

/**
 * Service for extracting architecture from PRD using Gemini
 */
export class ArchitectureService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  /**
   * Extract architecture from PRD content using Gemini
   */
  static async extractArchitecture(prdContent: string): Promise<ArchitectureData> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analise este PRD de projeto de software e extraia a arquitetura técnica.
Retorne APENAS um JSON válido, sem markdown, sem explicações, neste formato exato:
{
"nodes": [
{
"id": "string único",
"label": "nome da tecnologia/camada",
"type": "frontend|backend|database|auth|infra|integration|other",
"description": "o que é em 1 frase simples",
"why": "por que foi escolhido, em linguagem leiga",
"parentId": "id do nó pai ou null se for raiz",
"components": [
{
"name": "nome do componente",
"description": "o que faz em 1 frase",
"status": "pending"
}
]
}
],
"connections": [
{ "from": "id1", "to": "id2" }
]
}

PRD:
${prdContent}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Remove markdown code blocks if present
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      // Parse JSON response
      const architecture: ArchitectureData = JSON.parse(jsonText);

      // Validate structure
      if (!architecture.nodes || !Array.isArray(architecture.nodes)) {
        throw new Error('Invalid architecture data: missing nodes array');
      }

      if (!architecture.connections) {
        architecture.connections = [];
      }

      // Validate and clean nodes
      architecture.nodes = architecture.nodes.map(node => ({
        ...node,
        id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
        label: node.label || 'Unknown',
        type: (node.type || 'other') as any,
        description: node.description || '',
        why: node.why || '',
        parentId: node.parentId || null,
        components: Array.isArray(node.components) ? node.components : [],
      }));

      return architecture;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Architecture extraction error:', error);
      throw new Error(`Failed to extract architecture: ${message}`);
    }
  }
}
