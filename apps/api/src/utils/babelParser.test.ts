import assert from 'assert';
import { parseFileContent, parseFiles } from './babelParser';
import { GitHubFile } from '../types/index';

// Test 1: Function declaration parsing
function testFunctionDeclaration() {
  const content = `
export function getUserById(id: string) {
  return database.find(id);
}
`;

  const patterns = parseFileContent('src/users.ts', content);
  assert(patterns.length > 0, 'Should find at least one pattern');
  assert(patterns.some((p) => p.name === 'getUserById'), 'Should find getUserById function');
  console.log('✓ Function declaration parsing works');
}

// Test 2: Class declaration parsing
function testClassDeclaration() {
  const content = `
class UserService {
  constructor() {}

  getUser(id: string) {
    return id;
  }
}
`;

  const patterns = parseFileContent('src/services/UserService.ts', content);
  assert(patterns.some((p) => p.type === 'class' && p.name === 'UserService'), 'Should find UserService class');
  console.log('✓ Class declaration parsing works');
}

// Test 3: Component detection (function starting with uppercase)
function testComponentDetection() {
  const content = `
export default function HomePage() {
  return <h1>Home</h1>;
}
`;

  const patterns = parseFileContent('src/pages/HomePage.tsx', content);
  const homeComponent = patterns.find((p) => p.name === 'HomePage');
  assert(homeComponent, 'Should find HomePage component');
  console.log('✓ Component detection works');
}

// Test 4: Export default parsing
function testExportDefault() {
  const content = `
export default class App {}
`;

  const patterns = parseFileContent('src/App.ts', content);
  assert(patterns.some((p) => p.type === 'export' && p.name === 'App'), 'Should find exported App');
  console.log('✓ Export default parsing works');
}

// Test 5: Variable declaration parsing
function testVariableDeclaration() {
  const content = `
const API_URL = 'https://api.example.com';
const config = { debug: true };
`;

  const patterns = parseFileContent('src/config.ts', content);
  assert(patterns.some((p) => p.name === 'API_URL'), 'Should find API_URL variable');
  assert(patterns.some((p) => p.name === 'config'), 'Should find config variable');
  console.log('✓ Variable declaration parsing works');
}

// Test 6: Route detection
function testRouteDetection() {
  const content = `
app.get('/users', (req, res) => {
  res.json(users);
});

router.post('/users', createUser);
`;

  const patterns = parseFileContent('src/routes/users.ts', content);
  const routes = patterns.filter((p) => p.type === 'route');
  assert(routes.length >= 2, 'Should find at least 2 routes');
  assert(routes.some((r) => r.name.includes('GET')), 'Should find GET route');
  assert(routes.some((r) => r.name.includes('POST')), 'Should find POST route');
  console.log('✓ Route detection works');
}

// Test 7: Multiple files parsing
function testMultipleFileParsing() {
  const files: GitHubFile[] = [
    {
      path: 'src/users.ts',
      content: 'export function getUsers() {}',
      size: 32,
    },
    {
      path: 'src/posts.ts',
      content: 'export function getPosts() {}',
      size: 32,
    },
  ];

  const patterns = parseFiles(files);
  assert(patterns.some((p) => p.name === 'getUsers'), 'Should find getUsers');
  assert(patterns.some((p) => p.name === 'getPosts'), 'Should find getPosts');
  console.log('✓ Multiple file parsing works');
}

// Test 8: Syntax error handling (graceful degradation)
function testSyntaxErrorHandling() {
  const content = `
    this is not valid javascript }{}{
  `;

  const patterns = parseFileContent('src/broken.ts', content);
  // Should return empty array, not throw
  assert(Array.isArray(patterns), 'Should return array even on parse error');
  console.log('✓ Syntax error handling works (graceful degradation)');
}

// Test 9: Line number extraction
function testLineNumberExtraction() {
  const content = `

export function myFunction() {
  return true;
}
`;

  const patterns = parseFileContent('src/test.ts', content);
  const func = patterns.find((p) => p.name === 'myFunction');
  assert(func && func.line > 0, 'Should extract line number');
  console.log('✓ Line number extraction works');
}

// Test 10: TypeScript syntax support
function testTypeScriptSyntax() {
  const content = `
interface User {
  id: string;
  name: string;
}

type UserId = string;

export async function fetchUser(id: UserId): Promise<User> {
  return { id, name: 'John' };
}
`;

  const patterns = parseFileContent('src/types.ts', content);
  assert(patterns.some((p) => p.name === 'fetchUser'), 'Should parse TypeScript syntax');
  console.log('✓ TypeScript syntax support works');
}

// Run all tests
console.log('Running Babel Parser Tests...\n');
testFunctionDeclaration();
testClassDeclaration();
testComponentDetection();
testExportDefault();
testVariableDeclaration();
testRouteDetection();
testMultipleFileParsing();
testSyntaxErrorHandling();
testLineNumberExtraction();
testTypeScriptSyntax();

console.log('\n✅ All Babel parser tests passed!');
console.log('\nCoverage: 10/10 test cases passing');
