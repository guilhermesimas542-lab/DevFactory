import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GlossaryService } from '../services/GlossaryService';

const router = Router();
const prisma = new PrismaClient();
const glossaryService = new GlossaryService(prisma);

/**
 * GET /api/glossary?projectId=X
 * Get glossary terms for a project
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    const terms = await prisma.glossaryTerm.findMany({
      where: { project_id: projectId },
      orderBy: { term: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: terms,
      total: terms.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get glossary error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * GET /api/glossary/:id
 * Get a specific glossary term by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid term ID' });
      return;
    }

    const term = await prisma.glossaryTerm.findUnique({
      where: { id },
    });

    if (!term) {
      res.status(404).json({
        error: 'Term not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: term,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get term error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/glossary/extract
 * Extract glossary terms from PRD content using Groq AI
 */
router.post('/extract', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    const result = await glossaryService.extractTermsFromPRD(projectId);

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Extract glossary terms error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/glossary
 * Create a new glossary term
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      term,
      definition,
      analogy,
      relevance,
      category,
    } = req.body;

    if (!projectId || !term || !definition) {
      res.status(400).json({ error: 'projectId, term, and definition are required' });
      return;
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Create term (handle unique constraint)
    try {
      const newTerm = await prisma.glossaryTerm.create({
        data: {
          project_id: projectId,
          term,
          definition,
          analogy: analogy || null,
          relevance: relevance || null,
          category: category || 'geral',
        },
      });

      res.status(201).json({
        success: true,
        data: newTerm,
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Unique constraint violation
        res.status(400).json({
          error: `Term "${term}" already exists in this project`,
        });
      } else {
        throw err;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Create term error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * PUT /api/glossary/:id
 * Update a glossary term
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      term,
      definition,
      analogy,
      relevance,
      category,
      isExplored,
    } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Invalid term ID' });
      return;
    }

    // Verify term exists
    const existingTerm = await prisma.glossaryTerm.findUnique({
      where: { id },
    });

    if (!existingTerm) {
      res.status(404).json({ error: 'Term not found' });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (term !== undefined) updateData.term = term;
    if (definition !== undefined) updateData.definition = definition;
    if (analogy !== undefined) updateData.analogy = analogy;
    if (relevance !== undefined) updateData.relevance = relevance;
    if (category !== undefined) updateData.category = category;
    if (isExplored !== undefined) updateData.is_explored = isExplored;

    // Update term
    const updatedTerm = await prisma.glossaryTerm.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: updatedTerm,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Update term error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * DELETE /api/glossary/:id
 * Delete a glossary term
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid term ID' });
      return;
    }

    // Verify term exists
    const term = await prisma.glossaryTerm.findUnique({
      where: { id },
    });

    if (!term) {
      res.status(404).json({ error: 'Term not found' });
      return;
    }

    // Delete term
    await prisma.glossaryTerm.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Term deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Delete term error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

export default router;
