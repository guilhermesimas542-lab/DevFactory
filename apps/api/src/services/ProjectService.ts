import { PrismaClient, Prisma } from '@prisma/client';
import { ParsedPRD } from '../types/index';

const prisma = new PrismaClient();

/**
 * Create a new project with modules and components from parsed PRD data
 * Uses transaction for atomicity: all-or-nothing
 */
export async function createProjectFromParsedPRD(
  parsedPRD: ParsedPRD,
  projectName: string,
  _userId: string = 'default-user-001' // Hardcoded for now (v2 = real auth)
): Promise<string> {
  try {
    const projectId = await prisma.$transaction(async (tx) => {
      // Step 1: Create project with parsed PRD data
      const project = await tx.project.create({
        data: {
          name: projectName,
          description: parsedPRD.vision,
          prd_original: {
            title: parsedPRD.title,
            vision: parsedPRD.vision,
            modules: parsedPRD.modules,
            stories: parsedPRD.stories,
            warnings: parsedPRD.warnings,
          } as any,
        },
      });

      // Step 2: Create modules with hierarchy
      for (const moduleData of parsedPRD.modules) {
        const module = await tx.module.create({
          data: {
            project_id: project.id,
            name: moduleData.name,
            description: moduleData.description,
            hierarchy: moduleData.hierarchy,
            // Normalize hierarchy names to match schema defaults
            progress_percentage: new Prisma.Decimal(0),
          },
        });

        // Step 3: Create components (empty, pending status)
        for (const componentName of moduleData.components) {
          await tx.component.create({
            data: {
              module_id: module.id,
              name: componentName,
              status: 'pending',
            },
          });
        }
      }

      return project.id;
    });

    return projectId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error creating project from parsed PRD: ${message}`, error);
    throw new Error(`Failed to create project: ${message}`);
  }
}

/**
 * Get project details including modules and components
 */
export async function getProjectWithModules(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        modules: {
          include: {
            components: true,
          },
        },
      },
    });

    return project;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching project with modules: ${message}`, error);
    throw new Error(`Failed to fetch project: ${message}`);
  }
}

/**
 * Update module name and hierarchy based on user edits
 * Called from validation/confirmation UI
 */
export async function validateAndUpdateProjectTree(
  projectId: string,
  updates: Array<{
    moduleId: string;
    name?: string;
    hierarchy?: string;
    components?: Array<{ componentId: string; name: string }>;
  }>
): Promise<{ success: boolean; modulesUpdated: number }> {
  try {
    let modulesUpdated = 0;

    await prisma.$transaction(async (tx) => {
      // Verify project exists
      const project = await tx.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      for (const update of updates) {
        // Update module
        await tx.module.update({
          where: { id: update.moduleId },
          data: {
            ...(update.name && { name: update.name }),
            ...(update.hierarchy && { hierarchy: update.hierarchy }),
          },
        });
        modulesUpdated++;

        // Update components if provided
        if (update.components && update.components.length > 0) {
          for (const component of update.components) {
            await tx.component.update({
              where: { id: component.componentId },
              data: { name: component.name },
            });
          }
        }
      }
    });

    return { success: true, modulesUpdated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error validating project tree: ${message}`, error);
    throw new Error(`Failed to validate and update project tree: ${message}`);
  }
}
