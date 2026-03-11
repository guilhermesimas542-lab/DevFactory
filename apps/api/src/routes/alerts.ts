import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/alerts?projectId=X&unreadOnly=true
 * Get alerts with optional filters
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, unreadOnly } = req.query;

    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    const where: any = {
      project_id: projectId,
    };

    if (unreadOnly === 'true') {
      where.is_read = false;
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: alerts,
      total: alerts.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get alerts error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * GET /api/alerts/:id
 * Get a specific alert by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid alert ID' });
      return;
    }

    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      res.status(404).json({
        error: 'Alert not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get alert error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/alerts
 * Create a new alert
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      type,
      severity = 'medium',
      message,
      moduleId,
    } = req.body;

    if (!projectId || !type || !message) {
      res.status(400).json({ error: 'projectId, type, and message are required' });
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

    // Create alert
    const alert = await prisma.alert.create({
      data: {
        project_id: projectId,
        type,
        severity,
        message,
        module_id: moduleId || null,
      },
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Create alert error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * PUT /api/alerts/:id
 * Mark an alert as read
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { isRead } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Invalid alert ID' });
      return;
    }

    // Verify alert exists
    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    // Update alert
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        is_read: isRead !== undefined ? isRead : !alert.is_read,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedAlert,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Update alert error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * DELETE /api/alerts/:id
 * Delete an alert
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid alert ID' });
      return;
    }

    // Verify alert exists
    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    // Delete alert
    await prisma.alert.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Delete alert error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/alerts/check/:projectId
 * Check and generate alerts based on project state
 */
router.post('/check/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

    if (!projectId) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    // Get project data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        modules: true,
        stories: true,
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const alerts: Array<{ type: string; severity: string; message: string; module_id?: string }> = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Check 1: Modules with 0% progress for 7+ days
    for (const module of project.modules) {
      const progressValue = module.progress_percentage
        ? typeof module.progress_percentage === 'number'
          ? module.progress_percentage
          : Number(module.progress_percentage)
        : 0;

      if (progressValue === 0 && module.created_at < sevenDaysAgo) {
        alerts.push({
          type: 'stagnation',
          severity: 'high',
          message: `Módulo "${module.name}" não tem progresso há mais de 7 dias (0% progresso)`,
          module_id: module.id,
        });
      }
    }

    // Check 2: Stories marked completed but no matching code (simplified check)
    for (const story of project.stories) {
      if (story.status === 'completed' && !story.completed_at) {
        alerts.push({
          type: 'story_without_code',
          severity: 'medium',
          message: `Story "${story.title}" marcada como concluída mas sem data de conclusão`,
        });
      }
    }

    // Create alerts in database
    const createdAlerts = [];
    for (const alertData of alerts) {
      const newAlert = await prisma.alert.create({
        data: {
          project_id: projectId,
          ...alertData,
        },
      });
      createdAlerts.push(newAlert);
    }

    // Log activity if alerts were generated
    if (createdAlerts.length > 0) {
      try {
        await prisma.activityLog.create({
          data: {
            project_id: projectId,
            type: 'alert_generated',
            description: `${createdAlerts.length} alertas gerados na verificação`,
            metadata: {
              alertsCount: createdAlerts.length,
              alertTypes: createdAlerts.map(a => a.type),
            },
          },
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        checked: true,
        alertsGenerated: createdAlerts.length,
        alerts: createdAlerts,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Check alerts error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

export default router;
