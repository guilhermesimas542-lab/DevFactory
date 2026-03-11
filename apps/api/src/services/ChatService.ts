import { AIProviderFactory, AIProvider, AIMessage } from './AIProviderFactory';
import { PrismaClient } from '@prisma/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Service for AI-powered chat about project context
 */
export class ChatService {
  /**
   * Send a chat message and get AI response
   */
  static async chat(
    projectId: string,
    message: string,
    history: ChatMessage[],
    prisma: PrismaClient,
    provider?: AIProvider
  ): Promise<string> {
    try {
      const selectedProvider = provider || AIProviderFactory.getDefaultProvider();
      const llmProvider = AIProviderFactory.createProvider(selectedProvider);

      // Get project data for context
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          modules: {
            include: {
              components: true,
            },
          },
          stories: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          alerts: {
            select: {
              id: true,
              type: true,
              severity: true,
              message: true,
              is_read: true,
            },
            where: { is_read: false },
            take: 5,
          },
        },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Extract PRD content
      let prdContent = '';
      if (project.prd_original) {
        prdContent = typeof project.prd_original === 'string'
          ? project.prd_original
          : (project.prd_original as any).rawContent || JSON.stringify(project.prd_original);
        // Limit to 2000 chars for context
        prdContent = prdContent.substring(0, 2000);
      }

      // Build system prompt with project context
      const systemPrompt = `Você é um assistente especializado em ajudar a entender e navegar um projeto de software chamado "${project.name}".

CONTEXTO DO PROJETO:
${prdContent ? `PRD: ${prdContent}` : 'Sem PRD disponível'}

MÓDULOS:
${project.modules.map(m => `- ${m.name}: ${m.description || 'Sem descrição'}`).join('\n')}

STORIES POR STATUS:
- Pendentes: ${project.stories.filter(s => s.status === 'pending').length}
- Em progresso: ${project.stories.filter(s => s.status === 'in_progress').length}
- Concluídas: ${project.stories.filter(s => s.status === 'completed').length}

ALERTAS NÃO LIDOS: ${project.alerts.length}
${project.alerts.map(a => `- [${a.severity.toUpperCase()}] ${a.message}`).join('\n')}

Responda perguntas sobre o projeto de forma concisa, útil e em português. Se a pergunta não estiver relacionada ao projeto, redirecione para o escopo do projeto.`;

      // Convert history to AIMessage format
      const messages: AIMessage[] = [
        ...history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ];

      // Get response
      const responseText = await llmProvider.chat(messages, systemPrompt);

      return responseText;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Chat service error:', error);
      throw new Error(`Failed to process chat message: ${message}`);
    }
  }
}
