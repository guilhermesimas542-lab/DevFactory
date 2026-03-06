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
