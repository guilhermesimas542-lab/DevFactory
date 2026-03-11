import assert from 'node:assert';
import { parsePRDMarkdown } from './prdParser';

// Test 1: Parse basic PRD with title and vision
const testPRD1 = `# DevFactory

Plataforma de orchestração para inteligência artificial em desenvolvimento full-stack.

## Contexto

DevFactory é uma plataforma...

### Crítico - Autenticação
Usuários precisam se autenticar.
- JWT tokens
- Session management

### Importante - UI
Interface responsiva para gerenciar projetos.
- Dashboard principal
- Projeto detail page

STORY-007: Upload e renderização de PRD
STORY-008: Parser de markdown
`;

console.log('Test 1: Parse PRD with title, vision, and modules');
const parsed1 = parsePRDMarkdown(testPRD1);
assert.strictEqual(parsed1.title, 'DevFactory', 'Title should be "DevFactory"');
assert.ok(parsed1.vision.includes('Plataforma de orchestração'), 'Vision should contain expected text');
assert.strictEqual(parsed1.modules.length, 2, 'Should extract 2 modules');
assert.strictEqual(parsed1.modules[0].hierarchy, 'critico', 'First module should be "critico"');
assert.strictEqual(parsed1.modules[0].name, 'Crítico - Autenticação', 'Module name should match');
assert.strictEqual(parsed1.modules[0].components.length, 2, 'Should extract 2 components');
assert.strictEqual(parsed1.stories.length, 2, 'Should extract 2 stories');
console.log('✓ Test 1 passed\n');

// Test 2: Parse PRD without title (graceful degradation)
const testPRD2 = `## Without Title

Some content here.

### Desejável - Feature
This is optional.
- Feature 1
- Feature 2
`;

console.log('Test 2: Graceful degradation for missing title');
const parsed2 = parsePRDMarkdown(testPRD2);
console.log('  parsed2.warnings:', parsed2.warnings);
assert.strictEqual(parsed2.title, '', 'Title should be empty string');
assert.ok(parsed2.warnings.length > 0, 'Should have warnings');
assert.ok(parsed2.warnings.some(w => w.includes('No H1 title')), 'Should have warning about missing title');
assert.strictEqual(parsed2.modules.length, 1, 'Should still extract module');
assert.strictEqual(parsed2.modules[0].hierarchy, 'desejavel', 'Module hierarchy should be "desejavel"');
console.log('✓ Test 2 passed\n');

// Test 3: Extract various hierarchy levels
const testPRD3 = `# Test Project

Content.

### Must Have - Core
Core functionality.
- Feature A

### Should Have - Important
Important feature.
- Feature B

### Could Have - Nice
Optional feature.
- Feature C

### Nice to Have - Extra
Extra feature.
- Feature D

### Won't Have - Future
Future feature.
- Feature E
`;

console.log('Test 3: All hierarchy levels');
const parsed3 = parsePRDMarkdown(testPRD3);
assert.strictEqual(parsed3.modules.length, 5, 'Should extract 5 modules');
assert.strictEqual(parsed3.modules[0].hierarchy, 'critico', 'Must Have = critico');
assert.strictEqual(parsed3.modules[1].hierarchy, 'importante', 'Should Have = importante');
assert.strictEqual(parsed3.modules[2].hierarchy, 'necessario', 'Could Have = necessario');
assert.strictEqual(parsed3.modules[3].hierarchy, 'desejavel', 'Nice to Have = desejavel');
assert.strictEqual(parsed3.modules[4].hierarchy, 'opcional', 'Won\'t Have = opcional');
console.log('✓ Test 3 passed\n');

// Test 4: Real-world PRD.md format
const testPRD4 = `# DevFactory Platform

Uma plataforma inteligente para orquestração de AI em desenvolvimento full-stack.

## Visão do Produto

O objetivo é criar um sistema que conecte developers, designers e product managers através de IA.

## Componentes

### Crítico - Autenticação e Autorização
Todos os usuários devem ter acesso controlado.
- OAuth 2.0 integration
- JWT token management
- Role-based access control

### Importante - Dashboard de Projetos
Visualização centralizada de todos os projetos.
- Project list with search
- Quick actions
- Real-time status

### Desejável - Analytics
Dados sobre uso e performance.
- User activity tracking
- Feature usage metrics

STORY-001: Setup autenticação
STORY-002: Criar dashboard inicial
`;

console.log('Test 4: Real-world format');
const parsed4 = parsePRDMarkdown(testPRD4);
assert.strictEqual(parsed4.title, 'DevFactory Platform', 'Title extraction');
assert.ok(parsed4.vision.includes('Uma plataforma inteligente'), 'Vision extraction');
assert.strictEqual(parsed4.modules.length, 3, 'Should extract 3 modules');
assert.strictEqual(parsed4.modules[0].hierarchy, 'critico', 'First is critico');
assert.strictEqual(parsed4.modules[1].hierarchy, 'importante', 'Second is importante');
assert.strictEqual(parsed4.modules[2].hierarchy, 'desejavel', 'Third is desejavel');
assert.ok(parsed4.modules[0].components.includes('OAuth 2.0 integration'), 'Component extraction');
assert.strictEqual(parsed4.stories.length, 2, 'Should extract stories');
console.log('✓ Test 4 passed\n');

// Test 5: Edge case - empty file
console.log('Test 5: Empty content');
const parsed5 = parsePRDMarkdown('');
assert.strictEqual(parsed5.title, '', 'Title should be empty');
assert.strictEqual(parsed5.modules.length, 0, 'No modules');
assert.strictEqual(parsed5.stories.length, 0, 'No stories');
assert.ok(parsed5.warnings.length > 0, 'Should have warning');
console.log('✓ Test 5 passed\n');

console.log('✅ All tests passed!');
