import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/stories?projectId=X&status=Y&agent=Z&moduleId=W
 * Get stories with optional filters
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, status, agent, moduleId } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    // Build where clause dynamically
    const where: any = {
      project_id: projectId,
    };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (agent && typeof agent === 'string') {
      where.agent_responsible = agent;
    }

    if (moduleId && typeof moduleId === 'string') {
      where.module_id = moduleId;
    }

    const stories = await prisma.story.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: stories,
      total: stories.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get stories error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * GET /api/stories/:id
 * Get a specific story by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid story ID' });
      return;
    }

    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      res.status(404).json({
        error: 'Story not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get story error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/stories
 * Create a new story
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      moduleId,
      title,
      description,
      epic,
      status = 'pending',
      agentResponsible,
    } = req.body;

    if (!projectId || !title) {
      res.status(400).json({ error: 'projectId and title are required' });
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

    // Create story
    const story = await prisma.story.create({
      data: {
        project_id: projectId,
        module_id: moduleId || null,
        title,
        description: description || null,
        epic: epic || null,
        status,
        agent_responsible: agentResponsible || null,
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          project_id: projectId,
          type: 'story_created',
          description: `Story '${title}' criada com status '${status}'`,
          metadata: {
            storyId: story.id,
            title,
            status,
            epic: epic || null,
          },
        },
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    res.status(201).json({
      success: true,
      data: story,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Create story error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * PUT /api/stories/:id
 * Update a story
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      title,
      description,
      epic,
      status,
      agentResponsible,
      moduleId,
      startedAt,
      completedAt,
    } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Invalid story ID' });
      return;
    }

    // Verify story exists
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (epic !== undefined) updateData.epic = epic;
    if (status !== undefined) updateData.status = status;
    if (agentResponsible !== undefined) updateData.agent_responsible = agentResponsible;
    if (moduleId !== undefined) updateData.module_id = moduleId;
    if (startedAt !== undefined) updateData.started_at = startedAt ? new Date(startedAt) : null;
    if (completedAt !== undefined) updateData.completed_at = completedAt ? new Date(completedAt) : null;

    // Update story
    const updatedStory = await prisma.story.update({
      where: { id },
      data: updateData,
    });

    // Log activity if status changed
    if (status !== undefined && status !== story.status) {
      try {
        await prisma.activityLog.create({
          data: {
            project_id: story.project_id,
            type: 'story_updated',
            description: `Story '${story.title}' movida para '${status}'`,
            metadata: {
              storyId: id,
              oldStatus: story.status,
              newStatus: status,
              title: story.title,
            },
          },
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedStory,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Update story error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * DELETE /api/stories/:id
 * Delete a story
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid story ID' });
      return;
    }

    // Verify story exists
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    // Delete story
    await prisma.story.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Delete story error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * GET /api/stories/:projectId/timeline
 * Get timeline data (stories grouped by date and status)
 */
router.get('/:projectId/timeline', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

    if (!projectId) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    // Get all stories
    const stories = await prisma.story.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'asc' },
    });

    // Group by status
    const byStatus = {
      pending: stories.filter(s => s.status === 'pending'),
      in_progress: stories.filter(s => s.status === 'in_progress'),
      completed: stories.filter(s => s.status === 'completed'),
    };

    // Calculate timeline metrics
    const completed = byStatus.completed;
    const total = stories.length;
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    // Get average time to completion
    const completedWithDates = completed.filter(s => s.started_at && s.completed_at);
    const avgDaysToCompletion = completedWithDates.length > 0
      ? Math.round(
          completedWithDates.reduce((sum, s) => {
            if (s.started_at && s.completed_at) {
              const diff = s.completed_at.getTime() - s.started_at.getTime();
              return sum + diff / (1000 * 60 * 60 * 24);
            }
            return sum;
          }, 0) / completedWithDates.length
        )
      : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus,
        completionRate,
        avgDaysToCompletion,
        totalCompleted: completed.length,
        totalPending: byStatus.pending.length,
        totalInProgress: byStatus.in_progress.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get timeline error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

export default router;
