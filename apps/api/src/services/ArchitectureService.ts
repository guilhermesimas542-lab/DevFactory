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

// Technology detection patterns for heuristic fallback
const TECH_PATTERNS: Array<{
  regex: RegExp;
  id: string;
  label: string;
  type: ArchitectureNode['type'];
  description: string;
  why: string;
}> = [
  { regex: /next\.?js|nextjs/i, id: 'nextjs', label: 'Next.js', type: 'frontend', description: 'Framework React para aplicações web modernas', why: 'Facilita criar sites rápidos com renderização no servidor' },
  { regex: /react/i, id: 'react', label: 'React', type: 'frontend', description: 'Biblioteca para construir interfaces de usuário', why: 'Permite criar componentes reutilizáveis de forma simples' },
  { regex: /vue\.?js|vuejs/i, id: 'vue', label: 'Vue.js', type: 'frontend', description: 'Framework progressivo para interfaces web', why: 'Fácil de aprender e integrar gradualmente' },
  { regex: /angular/i, id: 'angular', label: 'Angular', type: 'frontend', description: 'Framework completo para aplicações web', why: 'Solução completa com estrutura definida' },
  { regex: /tailwind/i, id: 'tailwind', label: 'Tailwind CSS', type: 'frontend', description: 'Framework CSS utilitário para estilização rápida', why: 'Permite criar designs sem sair do HTML' },
  { regex: /express/i, id: 'express', label: 'Express.js', type: 'backend', description: 'Framework web minimalista para Node.js', why: 'Leve e flexível para criar APIs rapidamente' },
  { regex: /fastapi/i, id: 'fastapi', label: 'FastAPI', type: 'backend', description: 'Framework Python moderno para APIs', why: 'Alto desempenho e documentação automática' },
  { regex: /django/i, id: 'django', label: 'Django', type: 'backend', description: 'Framework Python completo para web', why: 'Vem com tudo que precisa incluído' },
  { regex: /nest\.?js|nestjs/i, id: 'nestjs', label: 'NestJS', type: 'backend', description: 'Framework Node.js escalável e estruturado', why: 'Organiza o código backend de forma clara' },
  { regex: /spring/i, id: 'spring', label: 'Spring Boot', type: 'backend', description: 'Framework Java para aplicações empresariais', why: 'Robusto e com amplo suporte empresarial' },
  { regex: /postgresql|postgres/i, id: 'postgres', label: 'PostgreSQL', type: 'database', description: 'Banco de dados relacional avançado', why: 'Confiável, gratuito e com recursos avançados' },
  { regex: /mysql/i, id: 'mysql', label: 'MySQL', type: 'database', description: 'Banco de dados relacional popular', why: 'Amplamente usado e bem documentado' },
  { regex: /mongodb|mongo/i, id: 'mongodb', label: 'MongoDB', type: 'database', description: 'Banco de dados de documentos NoSQL', why: 'Flexível para dados sem estrutura fixa' },
  { regex: /sqlite/i, id: 'sqlite', label: 'SQLite', type: 'database', description: 'Banco de dados leve em arquivo único', why: 'Ideal para desenvolvimento local e apps simples' },
  { regex: /redis/i, id: 'redis', label: 'Redis', type: 'database', description: 'Banco de dados em memória para cache', why: 'Extremamente rápido para dados temporários' },
  { regex: /prisma/i, id: 'prisma', label: 'Prisma ORM', type: 'database', description: 'Ferramenta para trabalhar com banco de dados em TypeScript', why: 'Facilita consultas ao banco sem escrever SQL manual' },
  { regex: /supabase/i, id: 'supabase', label: 'Supabase', type: 'database', description: 'Backend como serviço com PostgreSQL', why: 'Banco de dados, autenticação e storage prontos' },
  { regex: /next.?auth|nextauth/i, id: 'nextauth', label: 'NextAuth.js', type: 'auth', description: 'Autenticação pronta para Next.js', why: 'Login com Google, GitHub e outros em minutos' },
  { regex: /auth0/i, id: 'auth0', label: 'Auth0', type: 'auth', description: 'Serviço de autenticação e autorização', why: 'Gerencia login com segurança sem esforço' },
  { regex: /jwt|json web token/i, id: 'jwt', label: 'JWT', type: 'auth', description: 'Tokens para autenticação segura', why: 'Verifica identidade do usuário de forma compacta' },
  { regex: /firebase.*auth|google.*auth/i, id: 'firebase-auth', label: 'Firebase Auth', type: 'auth', description: 'Autenticação do Google Firebase', why: 'Login fácil com conta Google e outros' },
  { regex: /vercel/i, id: 'vercel', label: 'Vercel', type: 'infra', description: 'Plataforma de deploy para aplicações web', why: 'Publica o site automaticamente a cada atualização' },
  { regex: /railway/i, id: 'railway', label: 'Railway', type: 'infra', description: 'Plataforma de deploy para servidores', why: 'Hospeda o servidor sem precisar configurar servidores' },
  { regex: /docker/i, id: 'docker', label: 'Docker', type: 'infra', description: 'Containerização de aplicações', why: 'Garante que o app roda igual em qualquer lugar' },
  { regex: /aws|amazon web/i, id: 'aws', label: 'AWS', type: 'infra', description: 'Serviços de nuvem da Amazon', why: 'Infraestrutura escalável e confiável' },
  { regex: /google cloud|gcp/i, id: 'gcp', label: 'Google Cloud', type: 'infra', description: 'Serviços de nuvem do Google', why: 'Integração com serviços Google e IA' },
  { regex: /stripe/i, id: 'stripe', label: 'Stripe', type: 'integration', description: 'Plataforma de pagamentos online', why: 'Aceita pagamentos com cartão de forma segura' },
  { regex: /sendgrid|nodemailer|smtp/i, id: 'email', label: 'Email Service', type: 'integration', description: 'Serviço de envio de emails', why: 'Envia notificações e confirmações por email' },
  { regex: /twilio/i, id: 'twilio', label: 'Twilio', type: 'integration', description: 'Serviço de SMS e comunicação', why: 'Envia mensagens de texto para usuários' },
  { regex: /openai|gpt|chatgpt/i, id: 'openai', label: 'OpenAI', type: 'integration', description: 'Inteligência artificial da OpenAI', why: 'Adiciona recursos de IA como geração de texto' },
  { regex: /gemini|google.*ai/i, id: 'gemini', label: 'Google Gemini', type: 'integration', description: 'Inteligência artificial do Google', why: 'Analisa textos e extrai informações automaticamente' },
  { regex: /d3\.?js|d3js/i, id: 'd3', label: 'D3.js', type: 'frontend', description: 'Biblioteca para visualização de dados', why: 'Cria gráficos e mapas interativos no navegador' },
  { regex: /typescript/i, id: 'typescript', label: 'TypeScript', type: 'backend', description: 'JavaScript com tipagem estática', why: 'Detecta erros antes de executar o código' },
  { regex: /node\.?js|nodejs/i, id: 'nodejs', label: 'Node.js', type: 'backend', description: 'Ambiente de execução JavaScript no servidor', why: 'Roda JavaScript fora do navegador, no servidor' },
  { regex: /graphql/i, id: 'graphql', label: 'GraphQL', type: 'backend', description: 'Linguagem de consulta para APIs', why: 'Busca exatamente os dados que precisa, sem excesso' },
  { regex: /rest.*api|api.*rest/i, id: 'rest-api', label: 'REST API', type: 'backend', description: 'Interface de programação baseada em HTTP', why: 'Padrão universal para comunicação entre sistemas' },
  { regex: /websocket|socket\.io/i, id: 'websocket', label: 'WebSocket', type: 'integration', description: 'Comunicação em tempo real bidirecional', why: 'Permite atualizações instantâneas sem recarregar a página' },
  { regex: /github/i, id: 'github', label: 'GitHub', type: 'infra', description: 'Plataforma de hospedagem de código', why: 'Armazena e versiona o código do projeto' },
  { regex: /ci.?cd|github.*actions|gitlab.*ci/i, id: 'cicd', label: 'CI/CD Pipeline', type: 'infra', description: 'Automação de testes e deploy', why: 'Testa e publica o código automaticamente' },
];

/**
 * Heuristic fallback: extract architecture from PRD text without AI
 */
function extractArchitectureHeuristic(prdContent: string): ArchitectureData {
  const nodes: ArchitectureNode[] = [];
  const connections: ArchitectureConnection[] = [];
  const found = new Set<string>();

  for (const pattern of TECH_PATTERNS) {
    if (pattern.regex.test(prdContent) && !found.has(pattern.id)) {
      found.add(pattern.id);
      nodes.push({
        id: pattern.id,
        label: pattern.label,
        type: pattern.type,
        description: pattern.description,
        why: pattern.why,
        parentId: null,
        components: [],
      });
    }
  }

  // If nothing detected, create a generic structure
  if (nodes.length === 0) {
    nodes.push(
      { id: 'frontend', label: 'Frontend', type: 'frontend', description: 'Interface do usuário', why: 'O que o usuário vê e usa', parentId: null, components: [] },
      { id: 'backend', label: 'Backend', type: 'backend', description: 'Servidor e lógica de negócio', why: 'Processa os dados nos bastidores', parentId: null, components: [] },
      { id: 'database', label: 'Banco de Dados', type: 'database', description: 'Armazenamento de dados', why: 'Guarda as informações do sistema', parentId: null, components: [] }
    );
  }

  // Create connections: frontend → backend → database
  const frontendNode = nodes.find(n => n.type === 'frontend');
  const backendNodes = nodes.filter(n => n.type === 'backend');
  const dbNodes = nodes.filter(n => n.type === 'database');
  const authNodes = nodes.filter(n => n.type === 'auth');
  const integrationNodes = nodes.filter(n => n.type === 'integration');

  for (const backend of backendNodes) {
    if (frontendNode) {
      connections.push({ from: frontendNode.id, to: backend.id });
    }
    for (const db of dbNodes) {
      connections.push({ from: backend.id, to: db.id });
    }
    for (const auth of authNodes) {
      connections.push({ from: backend.id, to: auth.id });
    }
    for (const integration of integrationNodes) {
      connections.push({ from: backend.id, to: integration.id });
    }
  }

  return { nodes, connections };
}

/**
 * Service for extracting architecture from PRD using Gemini
 */
export class ArchitectureService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  /**
   * Extract architecture from PRD content using Gemini, with heuristic fallback
   */
  static async extractArchitecture(prdContent: string): Promise<ArchitectureData> {
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        const architecture: ArchitectureData = JSON.parse(jsonText);

        if (!architecture.nodes || !Array.isArray(architecture.nodes)) {
          throw new Error('Invalid architecture data: missing nodes array');
        }

        if (!architecture.connections) {
          architecture.connections = [];
        }

        architecture.nodes = architecture.nodes.map(node => ({
          ...node,
          id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
          label: node.label || 'Unknown',
          type: (node.type || 'other') as ArchitectureNode['type'],
          description: node.description || '',
          why: node.why || '',
          parentId: node.parentId || null,
          components: Array.isArray(node.components) ? node.components : [],
        }));

        return architecture;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        // On quota/rate-limit errors, fall through to heuristic
        if (message.includes('429') || message.includes('quota') || message.includes('rate')) {
          console.warn('Gemini quota exceeded — using heuristic fallback');
        } else {
          console.error('Architecture extraction error:', error);
        }
      }
    }

    // Heuristic fallback: detect technologies from PRD text
    console.log('Using heuristic architecture extraction');
    return extractArchitectureHeuristic(prdContent);
  }
}
