import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { CodePattern, GitHubFile } from '../types/index';

/**
 * Parse um arquivo JavaScript/TypeScript e extrair padrões
 */
function parseFile(file: GitHubFile): CodePattern[] {
  const patterns: CodePattern[] = [];

  try {
    // Parse com suporte a TypeScript e JSX
    const ast = parser.parse(file.content, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: [
        'typescript',
        'jsx',
        ['decorators', { decoratorsBeforeExport: false }],
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
      ],
    });

    // Traverse AST para encontrar padrões
    traverse(ast, {
      // Funções exportadas e componentes
      FunctionDeclaration(path: any) {
        if (path.node.id) {
          const isComponent = path.node.id.name.match(/^[A-Z]/);
          patterns.push({
            type: isComponent ? 'component' : 'function',
            name: path.node.id.name,
            file: file.path,
            line: path.node.loc?.start.line || 0,
          });
        }
      },

      // Export default
      ExportDefaultDeclaration(path: any) {
        if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
          patterns.push({
            type: 'export',
            name: path.node.declaration.id.name,
            file: file.path,
            line: path.node.loc?.start.line || 0,
          });
        } else if (path.node.declaration.type === 'ClassDeclaration' && path.node.declaration.id) {
          patterns.push({
            type: 'export',
            name: path.node.declaration.id.name,
            file: file.path,
            line: path.node.loc?.start.line || 0,
          });
        } else if (path.node.declaration.type === 'Identifier') {
          patterns.push({
            type: 'export',
            name: path.node.declaration.name,
            file: file.path,
            line: path.node.loc?.start.line || 0,
          });
        }
      },

      // Variáveis constantes (const x = ...)
      VariableDeclarator(path: any) {
        if (path.node.id.type === 'Identifier') {
          patterns.push({
            type: 'export',
            name: path.node.id.name,
            file: file.path,
            line: path.node.loc?.start.line || 0,
          });
        }
      },

      // Classes
      ClassDeclaration(path: any) {
        if (path.node.id) {
          patterns.push({
            type: 'class',
            name: path.node.id.name,
            file: file.path,
            line: path.node.loc?.start.line || 0,
          });
        }
      },

      // Rotas Express (app.get, router.post, etc)
      CallExpression(path: any) {
        // Detecta padrão: app/router.get/post/put/delete(route)
        const callee = path.node.callee;
        if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          ['get', 'post', 'put', 'delete', 'patch'].includes(callee.property.name)
        ) {
          const firstArg = path.node.arguments[0];
          if (firstArg && 'value' in firstArg && typeof firstArg.value === 'string') {
            patterns.push({
              type: 'route',
              name: `${callee.property.name.toUpperCase()} ${firstArg.value}`,
              file: file.path,
              line: path.node.loc?.start.line || 0,
            });
          }
        }
      },
    });

    return patterns;
  } catch (error) {
    // Graceful degradation - retorna array vazio se não conseguir parse
    console.warn(`⚠️ Failed to parse ${file.path}: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

/**
 * Parse um array de arquivos e extrair padrões
 * @param files - Array de arquivos lidos
 * @returns Array de padrões encontrados
 */
export function parseFiles(files: GitHubFile[]): CodePattern[] {
  const allPatterns: CodePattern[] = [];

  for (const file of files) {
    const patterns = parseFile(file);
    allPatterns.push(...patterns);
  }

  console.log(`✅ Parsed ${files.length} files, found ${allPatterns.length} patterns`);

  return allPatterns;
}

/**
 * Parse um arquivo individual
 * Útil para testes ou análise unitária
 */
export function parseFileContent(filePath: string, content: string): CodePattern[] {
  const file: GitHubFile = { path: filePath, content, size: content.length };
  return parseFile(file);
}
