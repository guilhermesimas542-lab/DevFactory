import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/learning/categories
 * Get all learning categories with entry count
 */
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.learningCategory.findMany({
      include: {
        entries: {
          select: { id: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      entryCount: cat.entries.length,
      entries: undefined,
    }));

    res.status(200).json({
      success: true,
      data: categoriesWithCount,
      total: categoriesWithCount.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get categories error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * GET /api/learning/categories/:id
 * Get a specific category with all its entries
 */
router.get('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    const category = await prisma.learningCategory.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      res.status(404).json({
        error: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Get category error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/learning/categories
 * Create a new learning category
 */
router.post('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      icon,
      color,
      order,
    } = req.body;

    if (!title || !description || !icon || !color) {
      res.status(400).json({ error: 'title, description, icon, and color are required' });
      return;
    }

    try {
      const newCategory = await prisma.learningCategory.create({
        data: {
          title,
          description,
          icon,
          color,
          order: order || 0,
        },
      });

      res.status(201).json({
        success: true,
        data: newCategory,
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Unique constraint violation
        res.status(400).json({
          error: `Category "${title}" already exists`,
        });
      } else {
        throw err;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Create category error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * PUT /api/learning/categories/:id
 * Update a learning category
 */
router.put('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      title,
      description,
      icon,
      color,
      order,
    } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    // Verify category exists
    const existingCategory = await prisma.learningCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;

    // Update category
    const updatedCategory = await prisma.learningCategory.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Update category error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * DELETE /api/learning/categories/:id
 * Delete a learning category (and all its entries)
 */
router.delete('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    // Verify category exists
    const category = await prisma.learningCategory.findUnique({
      where: { id },
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Delete category (cascade deletes entries)
    await prisma.learningCategory.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Delete category error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * POST /api/learning/categories/:id/entries
 * Create a new learning entry in a category
 */
router.post('/categories/:id/entries', async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      title,
      content,
      type,
      order,
    } = req.body;

    if (!categoryId || !title || !content) {
      res.status(400).json({ error: 'categoryId, title, and content are required' });
      return;
    }

    // Verify category exists
    const category = await prisma.learningCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const newEntry = await prisma.learningEntry.create({
      data: {
        category_id: categoryId,
        title,
        content,
        type: type || 'article',
        order: order || 0,
      },
    });

    res.status(201).json({
      success: true,
      data: newEntry,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Create entry error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * PUT /api/learning/entries/:id
 * Update a learning entry
 */
router.put('/entries/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      title,
      content,
      type,
      order,
    } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Invalid entry ID' });
      return;
    }

    // Verify entry exists
    const existingEntry = await prisma.learningEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (order !== undefined) updateData.order = order;

    // Update entry
    const updatedEntry = await prisma.learningEntry.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: updatedEntry,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Update entry error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

/**
 * DELETE /api/learning/entries/:id
 * Delete a learning entry
 */
router.delete('/entries/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({ error: 'Invalid entry ID' });
      return;
    }

    // Verify entry exists
    const entry = await prisma.learningEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    // Delete entry
    await prisma.learningEntry.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Entry deleted successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Delete entry error:', error);

    res.status(400).json({
      error: message,
    });
  }
});

export default router;
