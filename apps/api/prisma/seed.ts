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
          simple_explanation: `**Next.js** é uma ferramenta que facilita criar sites com React. Imagine que normalmente você precisa fazer muitas configurações manualmente, mas Next.js já vem com tudo pronto para usar.

O melhor é que ele permite criar páginas rapidinho: você cria uma pasta chamada \`pages\`, adiciona um arquivo chamado \`sobre.tsx\`, e pronto! Você automaticamente tem uma página em \`/sobre\` no seu site.

Next.js também é muito rápido porque ele pode preparar as páginas antes de alguém acessá-las, economizando tempo.`,
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
          simple_explanation: `Em Next.js, você não precisa configurar rotas manualmente. O framework automaticamente cria rotas baseado nos arquivos que você coloca na pasta \`pages\`.

Por exemplo: se você cria um arquivo chamado \`contato.tsx\`, seu site terá automaticamente uma página em \`/contato\`. Se você quer fazer uma página dinâmica tipo \`/blog/123\` onde 123 muda, você usa colchetes no nome do arquivo assim: \`[id].tsx\`.`,
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
          simple_explanation: `Normalização é basicamente organizar seu banco de dados de forma inteligente para não duplicar informações.

Imagine que você armazena o endereço do cliente junto com cada pedido. Se o cliente muda de endereço, você precisa atualizar em todos os pedidos dele. Normalização evita isso: você guarda o endereço em um lugar só e os pedidos apenas referenciam esse lugar. Assim, quando muda algo, você atualiza uma vez só.`,
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
          simple_explanation: `Um índice no banco de dados é como um índice em um livro. Se você quer encontrar todas as páginas sobre "gatos", você não lê o livro inteiro - você procura "gatos" no índice, e ele mostra quais páginas têm esse assunto.

Sem índices, o banco precisa procurar em todas as linhas. Com índices, ele encontra muito mais rápido. Mas criar muitos índices deixa a escrita mais lenta porque o banco precisa atualizar o índice toda vez que adiciona dados.`,
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
          simple_explanation: `MVC é um jeito de organizar seu código em três partes separadas:

1. **Model** = os dados (como os usuários, produtos, etc)
2. **View** = o que o usuário vê (botões, cores, textos)
3. **Controller** = o intermediário que pega o que o usuário faz e atualiza os dados

Por exemplo: o usuário clica um botão (View), isso avisa o Controller, o Controller pede ao Model para adicionar um novo produto, e a View mostra o resultado. Assim cada parte tem um trabalho bem definido.`,
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
          simple_explanation: `CI/CD é um robô que automaticamente testa seu código e o coloca em produção quando tudo está OK.

Ao invés de você manualmente testar cada mudança, compilar, e depois enviar para o servidor, o robô faz tudo isso automaticamente. Se o código tem erro, o robô detecta e avisa. Se está tudo bem, o robô coloca o código novo no ar. Isso economiza tempo e reduz erros humanos.`,
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
          simple_explanation: `Uma API RESTful é um jeito padrão de um programa conversar com outro. É como uma lista de regras para todo mundo seguir.

As regras principais são: use GET para buscar dados, POST para criar, PUT para atualizar, DELETE para remover. E no nome dos caminhos, use palavras comuns tipo \`/usuarios\` ao invés de \`/obterTodosOsUsuarios\`. Isso torna a API fácil de entender e usar.`,
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
          simple_explanation: `Um teste unitário é como um checklist para garantir que uma pequena parte do seu código funciona certo.

Você segue 3 passos simples: 1) Prepare os dados (Arrange), 2) Executa a função (Act), 3) Verifica se o resultado é o esperado (Assert). É como testar se uma calculadora funciona: você digita 5 + 3, a calculadora executa, você verifica se o resultado é 8.`,
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
