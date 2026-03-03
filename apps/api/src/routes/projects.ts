import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';

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
 * POST /api/projects/import-prd
 * Upload a PRD file and create a project
 */
router.post('/import-prd', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
      });
    }

    const { filename, mimetype, size } = req.file;

    // For now, just read the file content and store it
    // In STORY-007, we'll parse and validate it
    const fs = await import('fs').then(m => m.promises);
    const fileContent = await fs.readFile(req.file.path, 'utf-8');

    // Create a project entry in the database
    const project = await prisma.project.create({
      data: {
        name: `Project (${new Date().toLocaleDateString()})`,
        description: `Imported from ${req.file.originalname}`,
        prd_original: {
          rawContent: fileContent,
          originalFileName: req.file.originalname,
          uploadedAt: new Date().toISOString(),
          fileSize: size,
          mimeType: mimetype,
        },
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
