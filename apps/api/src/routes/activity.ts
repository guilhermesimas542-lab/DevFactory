import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/activity
 * Get activity log for a project (paginated, sorted by creation date DESC)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100

    if (!projectId) {
      res.status(400).json({
        error: 'projectId query parameter is required',
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

    // Get activity logs
    const activities = await prisma.activityLog.findMany({
      where: { project_id: projectId },
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });

    const total = await prisma.activityLog.count({
      where: { project_id: projectId },
    });

    res.status(200).json({
      success: true,
      data: activities,
      total,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get activity log error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

export default router;
