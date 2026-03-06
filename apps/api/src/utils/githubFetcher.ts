import { GitHubFile, GitHubCloneResult } from '../types/index';

/**
 * Arquivo ignorado do clone
 */
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.env',
  '.env.local',
  '*.json.lock',
  '.DS_Store',
];

/**
 * Extensões de arquivo a incluir
 */
const INCLUDE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

/**
 * Verifica se um caminho deve ser ignorado
 */
function shouldIgnorePath(path: string): boolean {
  return IGNORE_PATTERNS.some((pattern) => {
    if (pattern.includes('/')) {
      return path.includes(pattern);
    }
    return path.split('/').some((part) => part.includes(pattern));
  });
}

/**
 * Verifica se arquivo tem extensão válida
 */
function hasValidExtension(path: string): boolean {
  return INCLUDE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

/**
 * Parse GitHub URL para owner/repo
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Suporta: https://github.com/owner/repo ou github.com/owner/repo
  const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
  if (!match) {
    return null;
  }
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

/**
 * GitHub API item response type
 */
interface GitHubItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  url: string;
}

/**
 * Recursivamente busca arquivos de um repositório GitHub via API
 */
async function fetchFilesRecursive(
  apiUrl: string,
  token: string,
  path: string = '',
  files: GitHubFile[] = []
): Promise<GitHubFile[]> {
  try {
    const url = path ? `${apiUrl}/${path}` : apiUrl;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'DevFactory-Analysis',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const items = (await response.json()) as GitHubItem[];

    // Iterar sobre items (podem ser arquivos ou diretórios)
    for (const item of items) {
      if (shouldIgnorePath(item.path)) {
        continue;
      }

      if (item.type === 'dir') {
        // Recursivamente buscar diretório
        await fetchFilesRecursive(apiUrl, token, item.path, files);
      } else if (item.type === 'file' && hasValidExtension(item.name)) {
        // Baixar conteúdo do arquivo
        const fileContent = await fetch(item.url, {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3.raw',
            'User-Agent': 'DevFactory-Analysis',
          },
        });

        if (fileContent.ok) {
          const content = await fileContent.text();
          files.push({
            path: item.path,
            content,
            size: item.size || content.length,
          });
        }
      }
    }

    return files;
  } catch (error) {
    console.error(`Error fetching files from GitHub: ${error}`);
    throw error;
  }
}

/**
 * Clone um repositório GitHub e retorna lista de arquivos
 * @param repoUrl - URL do repositório (https://github.com/owner/repo)
 * @param githubToken - Token de autenticação GitHub (para private repos)
 * @returns Resultado com lista de arquivos encontrados
 */
export async function cloneGitHubRepo(
  repoUrl: string,
  githubToken: string
): Promise<GitHubCloneResult> {
  try {
    // Parse URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo');
    }

    const { owner, repo } = parsed;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

    console.log(`Fetching files from ${owner}/${repo}...`);

    // Buscar arquivos recursivamente
    const files = await fetchFilesRecursive(apiUrl, githubToken);

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    console.log(`✅ Fetched ${files.length} files (${totalSize} bytes) from ${owner}/${repo}`);

    return {
      files,
      repoUrl,
      totalFiles: files.length,
      totalSize,
    };
  } catch (error) {
    console.error(`Failed to clone GitHub repo: ${error}`);
    throw new Error(`GitHub clone failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Busca arquivos de um repositório específico sem a lógica de "clone"
 * Útil para integração direta com análise sem armazenar em disco
 */
export async function fetchRepositoryFiles(
  owner: string,
  repo: string,
  githubToken: string
): Promise<GitHubCloneResult> {
  const repoUrl = `https://github.com/${owner}/${repo}`;
  return cloneGitHubRepo(repoUrl, githubToken);
}
