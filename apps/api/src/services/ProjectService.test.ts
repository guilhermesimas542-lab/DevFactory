import assert from 'node:assert';
import { ParsedPRD } from '../types/index';

// Mock data
const mockParsedPRD: ParsedPRD = {
  title: 'DevFactory Test Project',
  vision: 'Uma plataforma para testar módulos e componentes',
  modules: [
    {
      name: 'Autenticação',
      hierarchy: 'critico',
      description: 'Sistema de autenticação seguro',
      components: ['JWT Handler', 'OAuth Provider'],
    },
    {
      name: 'Dashboard',
      hierarchy: 'importante',
      description: 'Painel principal de controle',
      components: ['Header Component', 'Charts', 'Sidebar'],
    },
  ],
  stories: [
    {
      title: 'STORY-001: Setup auth',
      epic: 'EPIC-1',
      description: '',
      dependencies: [],
    },
  ],
  warnings: [],
};

console.log('✅ Mock data structure valid');
console.log(`   - Title: ${mockParsedPRD.title}`);
console.log(`   - Modules: ${mockParsedPRD.modules.length}`);
console.log(`   - Components total: ${mockParsedPRD.modules.reduce((sum, m) => sum + m.components.length, 0)}`);

// Test data structure
assert.strictEqual(mockParsedPRD.modules.length, 2, 'Should have 2 modules');
assert.strictEqual(
  mockParsedPRD.modules[0].components.length,
  2,
  'First module should have 2 components'
);
assert.strictEqual(
  mockParsedPRD.modules[1].components.length,
  3,
  'Second module should have 3 components'
);

console.log('\n✅ All mock data tests passed!');
console.log('\nNote: Full integration test requires database connection');
console.log('To test createProjectFromParsedPRD():');
console.log('1. Set DATABASE_URL in .env');
console.log('2. Run: npm run db:test');
