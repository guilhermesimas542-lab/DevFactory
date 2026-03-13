import { Octokit } from '@octokit/rest';

interface DetectionHeuristic {
  storyId: string;
  storyTitle: string;
  files: RegExp[];        // Padrões de arquivo esperados
  keywords: string[];     // Palavras-chave em commits
  dependencies?: string[]; // Imports esperados no package.json
}

interface AnalysisResult {
  story_id: string;
  title: string;
  detected_status: 'completed' | 'in_progress' | 'pending';
  confidence: number; // 0-100
  evidence: string[];
}

const STORY_HEURISTICS: DetectionHeuristic[] = [
  {
    storyId: 'STORY-001',
    storyTitle: 'Setup Next.js com TypeScript e Tailwind CSS para o frontend',
    files: [/next\.config\.(js|ts)/, /^(app|pages)\//, /tailwind\.config\.(js|ts)/],
    keywords: ['next.js', 'nextjs', 'typescript', 'tailwind'],
    dependencies: ['next', 'typescript', 'tailwindcss']
  },
  {
    storyId: 'STORY-002',
    storyTitle: 'Configurar Express.js como backend com Prisma como ORM',
    files: [/src\/index\.ts/, /src\/routes\//, /src\/middleware\//],
    keywords: ['express', 'backend', 'setup'],
    dependencies: ['express', 'prisma', '@prisma/client']
  },
  {
    storyId: 'STORY-003',
    storyTitle: 'Configurar PostgreSQL e schema Prisma para persistência de dados',
    files: [/prisma\/schema\.prisma/, /prisma\/migrations\//],
    keywords: ['prisma', 'postgresql', 'schema', 'migration'],
    dependencies: ['@prisma/client']
  },
  {
    storyId: 'STORY-005',
    storyTitle: 'Integrar webhooks do GitHub para sincronização automática de stories',
    files: [/webhooks\.ts/, /routes\/webhooks/],
    keywords: ['webhook', 'github', 'integration'],
    dependencies: []
  },
  {
    storyId: 'STORY-006',
    storyTitle: 'Criar parser para upload e análise de arquivos PRD',
    files: [/parsePRD|prd-parser/i, /routes\/projects/],
    keywords: ['prd', 'parser', 'upload'],
    dependencies: ['multer']
  },
  {
    storyId: 'STORY-018',
    storyTitle: 'Extrair módulos e componentes do PRD automaticamente',
    files: [/services\/ArchitectureService/, /extract.*architecture/i],
    keywords: ['architecture', 'extract', 'modules'],
    dependencies: []
  }
];

export class GitHubAnalysisService {
  /**
   * Analisa um repositório GitHub para detectar quais stories foram implementadas
   */
  static async analyzeRepository(
    repoUrl: string,
    githubToken: string
  ): Promise<AnalysisResult[]> {
    // Parse GitHub URL: https://github.com/owner/repo -> owner/repo
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/i);
    if (!match) {
      throw new Error('Invalid GitHub URL format');
    }

    const [, owner, repo] = match;

    // Inicializar cliente Octokit
    const octokit = new Octokit({ auth: githubToken });

    console.log(`📊 GitHub Analysis: Starting for ${owner}/${repo}`);

    const results: AnalysisResult[] = [];

    try {
      // Fetch repo files
      const filesData = await octokit.repos.getContent({
        owner,
        repo,
        path: ''
      }).catch(() => ({ data: [] }));

      const files = Array.isArray(filesData.data)
        ? filesData.data.map((f: any) => f.name || f.path)
        : [];

      // Fetch recent commits (últimos 100)
      const commitsData = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 100
      }).catch(() => ({ data: [] }));

      const commits = Array.isArray(commitsData.data)
        ? commitsData.data.map((c: any) => c.commit.message.toLowerCase())
        : [];

      // Fetch package.json
      const packageJsonData = await octokit.repos.getContent({
        owner,
        repo,
        path: 'package.json'
      }).catch(() => null);

      let packageJson = {};
      if (packageJsonData && 'content' in packageJsonData.data) {
        try {
          const content = Buffer.from(packageJsonData.data.content as string, 'base64').toString();
          packageJson = JSON.parse(content);
        } catch (e) {
          console.warn('Failed to parse package.json');
        }
      }

      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Analisar cada story
      for (const heuristic of STORY_HEURISTICS) {
        const evidence: string[] = [];
        let detectedStatus: 'completed' | 'in_progress' | 'pending' = 'pending';
        let confidence = 0;

        // Check files
        const fileMatches = heuristic.files.filter(pattern =>
          files.some(f => pattern.test(f))
        ).length;

        if (fileMatches > 0) {
          evidence.push(`✓ ${fileMatches}/${heuristic.files.length} arquivos esperados encontrados`);
          confidence += 25;
        }

        // Check commits
        const commitMatches = commits.filter(msg =>
          heuristic.keywords.some(kw => msg.includes(kw)) ||
          msg.includes(heuristic.storyId.toLowerCase())
        ).length;

        if (commitMatches > 0) {
          evidence.push(`✓ ${commitMatches} commit(s) mencionando esta story`);
          confidence += 25;
        }

        // Check dependencies
        if (heuristic.dependencies && heuristic.dependencies.length > 0) {
          const depsPresent = heuristic.dependencies.filter(
            dep => dependencies[dep]
          ).length;

          if (depsPresent > 0) {
            evidence.push(`✓ ${depsPresent}/${heuristic.dependencies.length} dependências encontradas`);
            confidence += 25;
          } else {
            evidence.push(`✗ Dependências não encontradas`);
          }
        } else {
          confidence += 25; // Se não há deps obrigatórias, +25
        }

        // Check file structure (more advanced check)
        const hasProperStructure = this.checkProjectStructure(files, heuristic.storyId);
        if (hasProperStructure) {
          evidence.push(`✓ Estrutura de projeto parece estar pronta`);
          confidence += 25;
        }

        // Determinar status baseado em confiança
        if (confidence >= 75) {
          detectedStatus = 'completed';
        } else if (confidence >= 40) {
          detectedStatus = 'in_progress';
        } else {
          if (evidence.length > 0) {
            detectedStatus = 'in_progress';
          }
        }

        results.push({
          story_id: heuristic.storyId,
          title: heuristic.storyTitle,
          detected_status: detectedStatus,
          confidence: Math.min(100, confidence),
          evidence
        });

        console.log(`  📝 ${heuristic.storyId}: ${detectedStatus} (${confidence}% confidence)`);
      }

      console.log(`✅ Analysis complete: ${results.length} stories analyzed`);
    } catch (error) {
      console.error('GitHub Analysis Error:', error);
      throw error;
    }

    return results;
  }

  /**
   * Verifica se a estrutura do projeto parece estar pronta para uma story
   */
  private static checkProjectStructure(files: string[], storyId: string): boolean {
    switch (storyId) {
      case 'STORY-001':
        // Next.js project
        return (
          files.some(f => f === 'app' || f === 'pages') &&
          files.some(f => f === 'package.json') &&
          files.some(f => f === 'tsconfig.json')
        );
      case 'STORY-002':
        // Express project
        return (
          files.some(f => f === 'src') &&
          files.some(f => f === 'package.json')
        );
      case 'STORY-003':
        // Prisma/DB setup
        return files.some(f => f === 'prisma');
      case 'STORY-005':
        // GitHub integration
        return files.some(f => f === 'src') || files.some(f => f === 'app');
      default:
        return false;
    }
  }
}
