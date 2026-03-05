import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { parsePRDMarkdown } from '../utils/prdParser';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp',
  fileFilter: (_req, file, cb) => {
    // Only accept markdown and text files
    const allowedExtensions = ['.md', '.txt'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only .md and .txt files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

/**
 * GET /api/projects
 * Get all projects (paginated, sorted by creation date DESC)
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get projects error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * GET /api/projects/{id}
 * Get a specific project by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      res.status(404).json({
        error: 'Project not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        prd_original: project.prd_original,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get project error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * DELETE /api/projects/{id}
 * Delete a specific project by ID
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      res.status(404).json({
        error: 'Project not found',
      });
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Delete project error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/projects/import-prd
 * Upload a PRD file and create a project
 */
router.post('/import-prd', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: 'No file uploaded',
      });
      return;
    }

    const { mimetype, size } = req.file;

    // Read file content and parse markdown
    const fs = await import('fs').then(m => m.promises);
    const fileContent = await fs.readFile(req.file.path, 'utf-8');
    const parsedPRD = parsePRDMarkdown(fileContent);

    // Create a project entry in the database
    const project = await prisma.project.create({
      data: {
        name: parsedPRD.title || req.file.originalname,
        description: `Imported from ${req.file.originalname}`,
        prd_original: {
          rawContent: fileContent,
          originalFileName: req.file.originalname,
          uploadedAt: new Date().toISOString(),
          fileSize: size,
          mimeType: mimetype,
          parsed: {
            title: parsedPRD.title,
            vision: parsedPRD.vision,
            modules: parsedPRD.modules,
            stories: parsedPRD.stories,
            warnings: parsedPRD.warnings,
          },
        } as any,
      },
    });

    // Clean up temporary file
    await fs.unlink(req.file.path);

    res.status(200).json({
      projectId: project.id.toString(),
      status: 'uploaded',
      message: 'File uploaded successfully. Ready for parsing.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Upload error:', error);

    // Clean up temporary file if it exists
    if (req.file) {
      const fs = await import('fs').then(m => m.promises);
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(400).json({
      error: message,
    });
  }
});

export default router;
