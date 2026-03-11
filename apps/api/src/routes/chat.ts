import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ChatService, ChatMessage } from '../services/ChatService';
import { AIProviderFactory } from '../services/AIProviderFactory';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/chat/providers
 * List available AI providers
 */
router.get('/providers', async (_req: Request, res: Response): Promise<void> => {
  try {
    const availableProviders = AIProviderFactory.getAvailableProviders();
    const defaultProvider = AIProviderFactory.getDefaultProvider();

    res.status(200).json({
      success: true,
      data: {
        available: availableProviders,
        default: defaultProvider,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('List providers error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/chat
 * Send a chat message and get AI response
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, message, history } = req.body;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({
        error: 'projectId is required',
      });
      return;
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: 'message is required',
      });
      return;
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({
        error: 'Project not found',
      });
      return;
    }

    // Get chat response
    const chatHistory: ChatMessage[] = Array.isArray(history) ? history : [];
    const { provider } = req.body;
    const responseMessage = await ChatService.chat(projectId, message, chatHistory, prisma, provider);

    res.status(200).json({
      success: true,
      data: {
        message: responseMessage,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Chat endpoint error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

export default router;
