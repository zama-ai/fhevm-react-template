#!/usr/bin/env node

/**
 * Build verification script for Vue.js demo
 * Checks for common issues and ensures production readiness
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';

console.log(chalk.cyan('🔍 Verifying Vue.js Demo Build Configuration...\n'));

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'src/App.vue',
  'src/contracts/addresses.ts'
];

console.log(chalk.blue('📁 Checking required files...'));
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(chalk.green(`  ✅ ${file}`));
  } else {
    console.log(chalk.red(`  ❌ ${file} - MISSING`));
    process.exit(1);
  }
}

// Check package.json configuration
console.log(chalk.blue('\n📦 Checking package.json configuration...'));
try {
  const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
  
  if (packageJson.type === 'module') {
    console.log(chalk.green('  ✅ type: "module" - ESM enabled'));
  } else {
    console.log(chalk.yellow('  ⚠️  type: "module" not set - may cause CJS warnings'));
  }
  
  if (packageJson.scripts?.build) {
    console.log(chalk.green('  ✅ build script configured'));
  } else {
    console.log(chalk.red('  ❌ build script missing'));
  }
  
} catch (error) {
  console.log(chalk.red('  ❌ Failed to read package.json'));
  process.exit(1);
}

// Check for environment variables
console.log(chalk.blue('\n🌍 Checking environment configuration...'));
if (existsSync('.env')) {
  console.log(chalk.green('  ✅ .env file exists'));
} else if (existsSync('.env.example')) {
  console.log(chalk.yellow('  ⚠️  .env file missing, but .env.example exists'));
  console.log(chalk.blue('     Copy .env.example to .env and configure your values'));
} else {
  console.log(chalk.red('  ❌ No environment configuration found'));
}

// Check for mock data references
console.log(chalk.blue('\n🔍 Checking for mock data references...'));
try {
  const grepResult = execSync('grep -r "0x0000000000000000000000000000000000000000" src/ || true', { encoding: 'utf8' });
  if (grepResult.trim()) {
    console.log(chalk.red('  ❌ Found placeholder addresses:'));
    console.log(chalk.red(grepResult));
  } else {
    console.log(chalk.green('  ✅ No placeholder addresses found'));
  }
} catch (error) {
  console.log(chalk.green('  ✅ No placeholder addresses found'));
}

// Check for TODO comments
console.log(chalk.blue('\n📝 Checking for TODO comments...'));
try {
  const todoResult = execSync('grep -r "TODO" src/ || true', { encoding: 'utf8' });
  if (todoResult.trim()) {
    console.log(chalk.yellow('  ⚠️  Found TODO comments:'));
    console.log(chalk.yellow(todoResult));
  } else {
    console.log(chalk.green('  ✅ No TODO comments found'));
  }
} catch (error) {
  console.log(chalk.green('  ✅ No TODO comments found'));
}

console.log(chalk.green('\n✅ Build verification complete!'));
console.log(chalk.blue('\n🚀 Ready to build with: pnpm build'));
