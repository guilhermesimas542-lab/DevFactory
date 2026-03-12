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
      title: 'Next.js Essentials',
      description: 'Learn the fundamentals of Next.js framework and best practices',
      icon: '⚛️',
      color: '#61DAFB',
      order: 1,
    },
    {
      title: 'Database Design',
      description: 'Database architecture, schema design, and optimization tips',
      icon: '🗄️',
      color: '#336791',
      order: 2,
    },
    {
      title: 'Architecture Patterns',
      description: 'Common architecture patterns and system design principles',
      icon: '🏗️',
      color: '#FF6B6B',
      order: 3,
    },
    {
      title: 'DevOps & Deployment',
      description: 'CI/CD, deployment strategies, and infrastructure management',
      icon: '🚀',
      color: '#0099CC',
      order: 4,
    },
    {
      title: 'API Design',
      description: 'RESTful APIs, GraphQL, and API best practices',
      icon: '🔗',
      color: '#2E8B57',
      order: 5,
    },
    {
      title: 'Testing & QA',
      description: 'Unit testing, integration testing, and quality assurance',
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
    if (category.title === 'Next.js Essentials') {
      entries.push(
        {
          title: 'Getting Started with Next.js',
          content: `# Getting Started with Next.js

Next.js is a React framework that enables functionality such as server-side rendering and generating static websites for React web applications.

## Key Features
- **File-based routing**: Create routes by adding files to the \`pages\` directory
- **Server-side rendering**: Pre-render pages on the server
- **Static generation**: Generate static HTML at build time
- **API routes**: Build API endpoints with serverless functions
- **Built-in optimization**: Automatic image optimization and code splitting

## Quick Start
\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

Your app will be available at \`http://localhost:3000\`.`,
          type: 'article',
          order: 1,
        },
        {
          title: 'File-Based Routing in Next.js',
          content: `# File-Based Routing

Next.js uses file-based routing where the structure of your \`pages\` directory determines the routes.

## Examples
- \`pages/index.tsx\` → \`/\`
- \`pages/about.tsx\` → \`/about\`
- \`pages/blog/[id].tsx\` → \`/blog/123\`
- \`pages/api/users/[id].ts\` → API endpoint

## Dynamic Routes
Use square brackets to create dynamic routes:
- \`[param].tsx\` for single parameters
- \`[...slug].tsx\` for catch-all routes`,
          type: 'guide',
          order: 2,
        }
      );
    } else if (category.title === 'Database Design') {
      entries.push(
        {
          title: 'Normalization and Schema Design',
          content: `# Database Normalization

Normalization is the process of organizing data in a database to reduce redundancy.

## Normal Forms
- **1NF**: Atomic values, no repeating groups
- **2NF**: Meet 1NF + remove partial dependencies
- **3NF**: Meet 2NF + remove transitive dependencies

## Best Practices
1. Use appropriate data types
2. Create indexes on frequently queried columns
3. Use constraints for data integrity
4. Plan for scalability`,
          type: 'article',
          order: 1,
        },
        {
          title: 'Indexing Strategy',
          content: `# Indexing for Performance

Indexes improve query performance but slow down writes.

## When to Index
- Primary keys (automatic)
- Foreign keys (for joins)
- Columns in WHERE clauses
- Columns in ORDER BY

## Tip: Monitor Index Performance
Regularly review slow query logs to identify missing indexes.`,
          type: 'tip',
          order: 2,
        }
      );
    } else if (category.title === 'Architecture Patterns') {
      entries.push(
        {
          title: 'MVC Architecture Pattern',
          content: `# Model-View-Controller (MVC)

MVC separates application into three interconnected components.

## Components
- **Model**: Business logic and data
- **View**: User interface
- **Controller**: Handles input and updates model/view

## Benefits
- Separation of concerns
- Easier testing
- Reusable components`,
          type: 'article',
          order: 1,
        }
      );
    } else if (category.title === 'DevOps & Deployment') {
      entries.push(
        {
          title: 'CI/CD Pipeline Basics',
          content: `# Continuous Integration / Continuous Deployment

CI/CD automates testing and deployment of code changes.

## Components
1. **Version Control**: Store code in Git
2. **Build**: Compile and run tests
3. **Deploy**: Release to production

## Tools
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI`,
          type: 'article',
          order: 1,
        }
      );
    } else if (category.title === 'API Design') {
      entries.push(
        {
          title: 'RESTful API Best Practices',
          content: `# RESTful API Design

REST (Representational State Transfer) is an architectural style for APIs.

## HTTP Methods
- **GET**: Retrieve resource
- **POST**: Create resource
- **PUT**: Update resource
- **DELETE**: Delete resource

## Naming Conventions
- Use nouns for endpoints: \`/api/users\` not \`/api/getUsers\`
- Use lowercase and hyphens: \`/api/user-profiles\`
- Use version in URL: \`/api/v1/users\``,
          type: 'guide',
          order: 1,
        }
      );
    } else if (category.title === 'Testing & QA') {
      entries.push(
        {
          title: 'Unit Testing Best Practices',
          content: `# Writing Good Unit Tests

Unit tests should test a single unit of code in isolation.

## Principles (AAA)
1. **Arrange**: Set up test data
2. **Act**: Call the function
3. **Assert**: Verify the result

## Example
\`\`\`typescript
it('should sum two numbers', () => {
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
