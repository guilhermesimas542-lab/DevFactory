import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding learning categories and entries...');

  // Clear existing data
  await prisma.learningEntry.deleteMany();
  await prisma.learningCategory.deleteMany();

  // Create 6 learning categories
  const categories = [
    {
      title: 'Fundamentos do Next.js',
      description: 'Aprenda os fundamentos do framework Next.js e as melhores práticas',
      icon: '⚛️',
      color: '#61DAFB',
      order: 1,
    },
    {
      title: 'Design de Banco de Dados',
      description: 'Arquitetura de banco de dados, design de schema e dicas de otimização',
      icon: '🗄️',
      color: '#336791',
      order: 2,
    },
    {
      title: 'Padrões de Arquitetura',
      description: 'Padrões de arquitetura comuns e princípios de design de sistemas',
      icon: '🏗️',
      color: '#FF6B6B',
      order: 3,
    },
    {
      title: 'DevOps e Deploy',
      description: 'CI/CD, estratégias de deploy e gerenciamento de infraestrutura',
      icon: '🚀',
      color: '#0099CC',
      order: 4,
    },
    {
      title: 'Design de API',
      description: 'APIs RESTful, GraphQL e melhores práticas de API',
      icon: '🔗',
      color: '#2E8B57',
      order: 5,
    },
    {
      title: 'Testes e QA',
      description: 'Testes unitários, testes de integração e garantia de qualidade',
      icon: '✅',
      color: '#FF9800',
      order: 6,
    },
  ];

  for (const cat of categories) {
    const category = await prisma.learningCategory.create({
      data: cat,
    });

    // Add sample entries for each category
    const entries: any[] = [];
    if (category.title === 'Fundamentos do Next.js') {
      entries.push(
        {
          title: 'Começando com Next.js',
          content: `# Começando com Next.js

Next.js é um framework React que oferece funcionalidades como renderização no servidor e geração de sites estáticos para aplicações web React.

## Principais Características
- **Roteamento baseado em arquivos**: Crie rotas adicionando arquivos ao diretório \`pages\`
- **Renderização no servidor**: Pré-renderize páginas no servidor
- **Geração estática**: Gere HTML estático no tempo de compilação
- **Rotas de API**: Construa endpoints de API com funções serverless
- **Otimização incorporada**: Otimização automática de imagens e divisão de código

## Início Rápido
\`\`\`bash
npx create-next-app@latest meu-app
cd meu-app
npm run dev
\`\`\`

Seu aplicativo estará disponível em \`http://localhost:3000\`.`,
          type: 'article',
          order: 1,
        },
        {
          title: 'Roteamento Baseado em Arquivos no Next.js',
          content: `# Roteamento Baseado em Arquivos

Next.js utiliza roteamento baseado em arquivos onde a estrutura do seu diretório \`pages\` determina as rotas.

## Exemplos
- \`pages/index.tsx\` → \`/\`
- \`pages/sobre.tsx\` → \`/sobre\`
- \`pages/blog/[id].tsx\` → \`/blog/123\`
- \`pages/api/usuarios/[id].ts\` → Endpoint de API

## Rotas Dinâmicas
Use colchetes para criar rotas dinâmicas:
- \`[param].tsx\` para parâmetros únicos
- \`[...slug].tsx\` para rotas catch-all`,
          type: 'guide',
          order: 2,
        }
      );
    } else if (category.title === 'Design de Banco de Dados') {
      entries.push(
        {
          title: 'Normalização e Design de Schema',
          content: `# Normalização de Banco de Dados

Normalização é o processo de organizar dados em um banco de dados para reduzir redundância.

## Formas Normais
- **1NF**: Valores atômicos, sem grupos repetidos
- **2NF**: Atende 1NF + remove dependências parciais
- **3NF**: Atende 2NF + remove dependências transitivas

## Melhores Práticas
1. Use tipos de dados apropriados
2. Crie índices em colunas frequentemente consultadas
3. Use constraints para integridade dos dados
4. Planeje para escalabilidade`,
          type: 'article',
          order: 1,
        },
        {
          title: 'Estratégia de Indexação',
          content: `# Indexação para Performance

Índices melhoram a performance de consultas, mas ralentam escritas.

## Quando Indexar
- Chaves primárias (automático)
- Chaves estrangeiras (para joins)
- Colunas em cláusulas WHERE
- Colunas em ORDER BY

## Dica: Monitore a Performance dos Índices
Revise regularmente os logs de consultas lentas para identificar índices faltantes.`,
          type: 'tip',
          order: 2,
        }
      );
    } else if (category.title === 'Padrões de Arquitetura') {
      entries.push(
        {
          title: 'Padrão de Arquitetura MVC',
          content: `# Model-View-Controller (MVC)

MVC separa a aplicação em três componentes interconectados.

## Componentes
- **Model**: Lógica de negócios e dados
- **View**: Interface do usuário
- **Controller**: Manipula entrada e atualiza model/view

## Benefícios
- Separação de responsabilidades
- Testes mais fáceis
- Componentes reutilizáveis`,
          type: 'article',
          order: 1,
        }
      );
    } else if (category.title === 'DevOps e Deploy') {
      entries.push(
        {
          title: 'Fundamentos de Pipeline CI/CD',
          content: `# Integração Contínua / Entrega Contínua

CI/CD automatiza testes e deployment de mudanças de código.

## Componentes
1. **Controle de Versão**: Armazene código em Git
2. **Build**: Compile e execute testes
3. **Deploy**: Libere para produção

## Ferramentas
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI`,
          type: 'article',
          order: 1,
        }
      );
    } else if (category.title === 'Design de API') {
      entries.push(
        {
          title: 'Melhores Práticas de API RESTful',
          content: `# Design de API RESTful

REST (Representational State Transfer) é um estilo arquitetônico para APIs.

## Métodos HTTP
- **GET**: Recuperar recurso
- **POST**: Criar recurso
- **PUT**: Atualizar recurso
- **DELETE**: Deletar recurso

## Convenções de Nomenclatura
- Use substantivos para endpoints: \`/api/usuarios\` e não \`/api/obterUsuarios\`
- Use minúsculas e hífens: \`/api/perfis-usuario\`
- Use versão na URL: \`/api/v1/usuarios\``,
          type: 'guide',
          order: 1,
        }
      );
    } else if (category.title === 'Testes e QA') {
      entries.push(
        {
          title: 'Melhores Práticas de Testes Unitários',
          content: `# Escrevendo Bons Testes Unitários

Testes unitários devem testar uma única unidade de código isoladamente.

## Princípios (AAA)
1. **Arrange**: Configure dados de teste
2. **Act**: Chame a função
3. **Assert**: Verifique o resultado

## Exemplo
\`\`\`typescript
it('deve somar dois números', () => {
  // Arrange
  const a = 5;
  const b = 3;

  // Act
  const result = sum(a, b);

  // Assert
  expect(result).toBe(8);
});
\`\`\``,
          type: 'guide',
          order: 1,
        }
      );
    }

    // Create entries
    for (const entry of entries) {
      await prisma.learningEntry.create({
        data: {
          ...entry,
          category_id: category.id,
        },
      });
    }

    console.log(`✅ Created category: ${category.title}`);
  }

  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
