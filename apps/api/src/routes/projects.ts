import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { parsePRDMarkdown } from '../utils/prdParser';
import { createProjectFromParsedPRD, validateAndUpdateProjectTree } from '../services/ProjectService';

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
 * PUT /api/projects/{id}
 * Update a project
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, github_repo_url } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(github_repo_url !== undefined && { github_repo_url }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        github_repo_url: true,
        github_last_sync: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Update project error:', error);

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
      include: {
        modules: {
          include: {
            components: true,
          },
        },
      },
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
        github_repo_url: project.github_repo_url,
        github_last_sync: project.github_last_sync,
        prd_original: project.prd_original,
        modules: project.modules,
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

    // Create project with modules and components from parsed PRD
    const projectId = await createProjectFromParsedPRD(
      parsedPRD,
      parsedPRD.title || req.file.originalname
    );

    // Update project with raw PRD content and metadata
    await prisma.project.update({
      where: { id: projectId },
      data: {
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
      projectId: projectId.toString(),
      status: 'modules_created',
      message: 'File uploaded successfully. Project created with modules and components.',
      modulesCount: parsedPRD.modules.length,
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

/**
 * POST /api/projects/:id/validate
 * Update modules and components based on user edits from validation UI
 */
router.post('/:id/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { updates } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    if (!updates || !Array.isArray(updates)) {
      res.status(400).json({ error: 'Invalid updates format' });
      return;
    }

    const result = await validateAndUpdateProjectTree(id, updates);

    res.status(200).json({
      success: true,
      message: 'Project tree updated successfully',
      modulesUpdated: result.modulesUpdated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Validate project error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * GET /api/projects/:id/progress
 * Get project progress: overall %, by module, and deviations
 */
router.get('/:id/progress', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    // Get project with all modules and their progress
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        modules: {
          select: {
            id: true,
            name: true,
            hierarchy: true,
            progress_percentage: true,
            components: true,
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({
        error: 'Project not found',
      });
      return;
    }

    // Calculate overall progress (average of all module progress)
    const moduleProgressList = project.modules.map(m => {
      // Convert Decimal to number
      const progressValue = m.progress_percentage
        ? typeof m.progress_percentage === 'number'
          ? m.progress_percentage
          : Number(m.progress_percentage)
        : 0;

      return {
        moduleId: m.id,
        name: m.name,
        hierarchy: m.hierarchy,
        progress: progressValue,
        componentCount: m.components.length,
      };
    });

    const overallProgress = moduleProgressList.length > 0
      ? Math.round(
          moduleProgressList.reduce((sum, m) => sum + m.progress, 0) / moduleProgressList.length
        )
      : 0;

    // Identify deviations (modules below expected progress for their hierarchy)
    const hierarchyTargets: Record<string, number> = {
      critico: 100,
      importante: 80,
      necessario: 60,
      desejavel: 40,
      opcional: 20,
    };

    const deviations = moduleProgressList
      .filter(m => {
        const target = hierarchyTargets[m.hierarchy] || 50;
        return Number(m.progress) < target * 0.7; // < 70% of target = deviation
      })
      .map(m => ({
        moduleId: m.moduleId,
        name: m.name,
        currentProgress: m.progress,
        expectedProgress: hierarchyTargets[m.hierarchy] || 50,
        gap: (hierarchyTargets[m.hierarchy] || 50) - m.progress,
      }));

    res.status(200).json({
      success: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        overall: overallProgress,
        by_module: Object.fromEntries(
          moduleProgressList.map(m => [m.moduleId, m.progress])
        ),
        modules: moduleProgressList,
        deviations,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get progress error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/projects/:id/sync-github
 * Sync stories with GitHub commits
 */
router.post('/:id/sync-github', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    // Get project
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        stories: {
          select: { id: true, title: true }
        }
      }
    });

    if (!project) {
      res.status(404).json({
        error: 'Project not found',
      });
      return;
    }

    if (!project.github_repo_url) {
      res.status(400).json({
        error: 'Project does not have a GitHub repository URL configured',
      });
      return;
    }

    // Parse GitHub URL: https://github.com/owner/repo → owner/repo
    const repoMatch = project.github_repo_url.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/i);
    if (!repoMatch) {
      res.status(400).json({
        error: 'Invalid GitHub repository URL format',
      });
      return;
    }

    const [, owner, repo] = repoMatch;
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`;

    // Fetch commits from GitHub
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DevFactory',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const githubResponse = await fetch(githubApiUrl, { headers });

    if (!githubResponse.ok) {
      console.error('GitHub API error:', githubResponse.statusText);
      res.status(400).json({
        error: `GitHub API error: ${githubResponse.statusText}`,
      });
      return;
    }

    const commits = await githubResponse.json() as Array<{
      sha: string;
      commit: { message: string };
    }>;

    // Process commits and update stories
    const storiesUpdated = [];
    const lastSync = project.github_last_sync;

    for (const commit of commits) {
      // Skip if commit is before last sync
      if (lastSync) {
        const commitDate = new Date(commit.commit.message);
        if (isNaN(commitDate.getTime()) || commitDate < lastSync) {
          continue;
        }
      }

      const commitMessage = commit.commit.message.toLowerCase();
      let newStatus: string | null = null;

      // Check for status patterns
      if (commitMessage.match(/^done:\s*story-(\w+)/i) || commitMessage.match(/^done:\s*story/i)) {
        newStatus = 'completed';
      } else if (commitMessage.match(/^fix:\s*story-(\w+)/i) || commitMessage.match(/^fix:\s*story/i)) {
        newStatus = 'completed';
      } else if (commitMessage.match(/^feat:\s*story-(\w+)/i) || commitMessage.match(/^feat:\s*story/i)) {
        newStatus = 'in_progress';
      }

      if (newStatus) {
        // Extract story ID from message
        const storyIdMatch = commitMessage.match(/story-(\w+)/);
        let matchedStory = null;

        if (storyIdMatch) {
          // Try to match by story ID
          matchedStory = project.stories.find(s => s.id === storyIdMatch[1] || s.id.endsWith(storyIdMatch[1]));
        }

        // If not found by ID, try to match by title (partial, case insensitive)
        if (!matchedStory) {
          const storyTitle = commitMessage.replace(/^(feat|fix|done):\s*/i, '').split('\n')[0].trim();
          matchedStory = project.stories.find(s =>
            s.title.toLowerCase().includes(storyTitle.toLowerCase()) ||
            storyTitle.toLowerCase().includes(s.title.toLowerCase())
          );
        }

        if (matchedStory) {
          // Update story status
          await prisma.story.update({
            where: { id: matchedStory.id },
            data: {
              status: newStatus,
              ...(newStatus === 'in_progress' && { started_at: new Date() }),
              ...(newStatus === 'completed' && { completed_at: new Date() }),
            },
          });

          storiesUpdated.push({
            story_id: matchedStory.id,
            title: matchedStory.title,
            new_status: newStatus,
            commit_sha: commit.sha.substring(0, 7),
            commit_message: commit.commit.message.split('\n')[0],
          });
        }
      }
    }

    // Update project's last sync time
    await prisma.project.update({
      where: { id },
      data: { github_last_sync: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        synced_at: new Date().toISOString(),
        commits_analyzed: commits.length,
        stories_updated: storiesUpdated,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('GitHub sync error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/projects/:id/extract-architecture
 * Extract architecture from PRD using Gemini AI and save to database
 */
router.post('/:id/extract-architecture', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    // Get project with PRD
    const project = await prisma.project.findUnique({
      where: { id },
      include: { modules: { include: { components: true } } },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (!project.prd_original) {
      res.status(400).json({ error: 'Project does not have a PRD' });
      return;
    }

    // Extract PRD content
    const prdContent = typeof project.prd_original === 'string'
      ? project.prd_original
      : (project.prd_original as any).rawContent || JSON.stringify(project.prd_original);

    // Import ArchitectureService dynamically to avoid circular imports
    const { ArchitectureService } = await import('../services/ArchitectureService');

    // Extract architecture from PRD using Gemini
    const architecture = await ArchitectureService.extractArchitecture(prdContent);

    // Save architecture to database
    const savedModules = [];

    for (const node of architecture.nodes) {
      // Find or create module
      let module = await prisma.module.findFirst({
        where: {
          project_id: id,
          name: node.label,
        },
      });

      if (module) {
        // Update existing module
        module = await prisma.module.update({
          where: { id: module.id },
          data: {
            description: node.description,
            architecture_type: node.type,
            why_chosen: node.why,
            parent_module_id: node.parentId || null,
          },
        });
      } else {
        // Create new module
        module = await prisma.module.create({
          data: {
            project_id: id,
            name: node.label,
            description: node.description,
            hierarchy: 'necessary',
            architecture_type: node.type,
            why_chosen: node.why,
            parent_module_id: node.parentId || null,
          },
        });
      }

      savedModules.push(module);

      // Create/update components for this module
      for (const component of node.components) {
        const existingComponent = await prisma.component.findFirst({
          where: {
            module_id: module.id,
            name: component.name,
          },
        });

        if (existingComponent) {
          await prisma.component.update({
            where: { id: existingComponent.id },
            data: {
              description: component.description,
              status: component.status,
              type: 'architecture_component',
            },
          });
        } else {
          await prisma.component.create({
            data: {
              module_id: module.id,
              name: component.name,
              description: component.description,
              status: component.status,
              type: 'architecture_component',
            },
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        architecture,
        modulesCreated: savedModules.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Extract architecture error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

export default router;
