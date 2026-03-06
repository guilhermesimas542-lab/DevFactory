import { PrismaClient } from '@prisma/client';
import { cloneGitHubRepo } from '../utils/githubFetcher';
import { parseFiles } from '../utils/babelParser';
import { scoreMatch } from '../utils/heuristics';
import { AnalysisResult, CodePattern } from '../types/index';

const prisma = new PrismaClient();

/**
 * Analysis Engine: Orchestrates full pipeline
 * Clone → Parse → Extract → Match → Score → Store
 */
export class AnalysisEngine {
  /**
   * Main analysis method
   * @param projectId - Project ID from database
   * @param repoUrl - GitHub repository URL
   * @param githubToken - GitHub API token
   * @returns Analysis result with progress and alerts
   */
  async analyze(projectId: string, repoUrl: string, githubToken: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    const alerts: string[] = [];
    const moduleProgress: Record<string, number> = {};

    try {
      console.log(`🚀 Starting analysis for project ${projectId}...`);

      // Step 1: Get project with modules from database
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          modules: {
            include: { components: true },
          },
        },
      });

      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      if (!project.modules || project.modules.length === 0) {
        alerts.push('No modules found in project');
        return { projectId, repoUrl, timestamp: new Date(), patterns: [], moduleProgress: {}, alerts };
      }

      console.log(`📦 Found ${project.modules.length} modules in project`);

      // Step 2: Clone GitHub repository
      console.log(`📥 Cloning repository: ${repoUrl}`);
      const cloneResult = await cloneGitHubRepo(repoUrl, githubToken);
      console.log(`✅ Cloned ${cloneResult.totalFiles} files`);

      // Step 3: Parse files and extract patterns
      console.log(`🔍 Parsing files and extracting patterns...`);
      const allPatterns = parseFiles(cloneResult.files);
      console.log(`✅ Found ${allPatterns.length} code patterns`);

      // Step 4: Match patterns against PRD modules
      console.log(`🎯 Matching patterns against PRD modules...`);
      const matches = this.matchPatternsToModules(project.modules, allPatterns);
      console.log(`✅ Found ${matches.length} matches`);

      // Step 5: Calculate module progress based on matches
      console.log(`📊 Calculating module progress...`);
      const progressData = this.calculateModuleProgress(project.modules, matches);
      Object.assign(moduleProgress, progressData);

      // Step 6: Store analysis results in database
      console.log(`💾 Storing analysis results...`);
      await this.storeAnalysisResults(projectId, cloneResult.repoUrl, allPatterns, moduleProgress);

      // Step 7: Update module progress in database
      console.log(`🔄 Updating module progress...`);
      await this.updateModuleProgress(projectId, moduleProgress);

      // Step 8: Generate alerts
      console.log(`⚠️ Generating alerts...`);
      const generatedAlerts = this.generateAlerts(project.modules, moduleProgress);
      alerts.push(...generatedAlerts);

      const duration = Date.now() - startTime;
      console.log(`✅ Analysis complete in ${duration}ms`);

      return {
        projectId,
        repoUrl,
        timestamp: new Date(),
        patterns: allPatterns,
        moduleProgress,
        alerts,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Analysis failed: ${errorMsg}`);
      alerts.push(`Analysis error: ${errorMsg}`);

      return {
        projectId,
        repoUrl,
        timestamp: new Date(),
        patterns: [],
        moduleProgress: {},
        alerts,
      };
    }
  }

  /**
   * Match code patterns against PRD modules
   */
  private matchPatternsToModules(
    modules: any[],
    patterns: CodePattern[]
  ): Array<{ moduleId: string; moduleName: string; pattern: CodePattern; score: number }> {
    const matches = [];

    for (const module of modules) {
      for (const pattern of patterns) {
        const score = scoreMatch(module.name, pattern.name);
        if (score >= 50) {
          // Only include matches with score >= 50
          matches.push({
            moduleId: module.id,
            moduleName: module.name,
            pattern,
            score,
          });
        }
      }
    }

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate module progress based on matches
   */
  private calculateModuleProgress(
    modules: any[],
    matches: Array<{ moduleId: string; score: number }>
  ): Record<string, number> {
    const progress: Record<string, number> = {};

    for (const module of modules) {
      // Get all matches for this module
      const moduleMatches = matches.filter((m) => m.moduleId === module.id);

      if (moduleMatches.length === 0) {
        progress[module.id] = 0;
      } else {
        // Calculate average score (0-100)
        const avgScore = moduleMatches.reduce((sum, m) => sum + m.score, 0) / moduleMatches.length;
        progress[module.id] = Math.round(avgScore);
      }
    }

    return progress;
  }

  /**
   * Store analysis results in database
   */
  private async storeAnalysisResults(
    projectId: string,
    repoUrl: string,
    patterns: CodePattern[],
    moduleProgress: Record<string, number>
  ) {
    return await (prisma.analysisResult as any).create({
      data: {
        project_id: projectId,
        repository_url: repoUrl,
        analyzed_at: new Date(),
        patterns_found: patterns.length,
        patterns: patterns as any, // Store as JSON
        module_progress: moduleProgress as any, // Store as JSON
      },
    });
  }

  /**
   * Update module progress in database
   */
  private async updateModuleProgress(_projectId: string, moduleProgress: Record<string, number>) {
    const updates = Object.entries(moduleProgress).map(([moduleId, progress]) =>
      prisma.module.update({
        where: { id: moduleId },
        data: { progress_percentage: progress },
      })
    );

    await Promise.all(updates);
  }

  /**
   * Generate alerts based on analysis results
   */
  private generateAlerts(modules: any[], moduleProgress: Record<string, number>): string[] {
    const alerts: string[] = [];

    for (const module of modules) {
      const progress = moduleProgress[module.id] || 0;

      // Critical modules with low progress
      if (module.hierarchy === 'critico' && progress < 30) {
        alerts.push(
          `⚠️ Critical module "${module.name}" has low implementation (${progress}%)`
        );
      }

      // Important modules with no matches
      if (module.hierarchy === 'importante' && progress === 0) {
        alerts.push(`⚠️ Important module "${module.name}" has no code matches`);
      }
    }

    return alerts;
  }
}

/**
 * Singleton instance
 */
export const analysisEngine = new AnalysisEngine();
