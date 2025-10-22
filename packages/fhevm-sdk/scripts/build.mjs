#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🚀 Building FHEVM SDK...');

// Clean dist directory
const distDir = join(process.cwd(), 'dist');
if (existsSync(distDir)) {
  console.log('🧹 Cleaning dist directory...');
  rmSync(distDir, { recursive: true });
}

// Type check
console.log('🔍 Type checking...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ Type check passed');
} catch (error) {
  console.error('❌ Type check failed');
  process.exit(1);
}

// Lint
console.log('🔍 Linting...');
try {
  execSync('npx eslint src --ext .ts,.tsx', { stdio: 'inherit' });
  console.log('✅ Lint passed');
} catch (error) {
  console.error('❌ Lint failed');
  process.exit(1);
}

// Build
console.log('🔨 Building...');
try {
  execSync('npx rollup -c', { stdio: 'inherit' });
  console.log('✅ Build completed');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Test
console.log('🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Tests passed');
} catch (error) {
  console.error('❌ Tests failed');
  process.exit(1);
}

console.log('🎉 Build completed successfully!');
console.log('📦 Package ready for publishing');
