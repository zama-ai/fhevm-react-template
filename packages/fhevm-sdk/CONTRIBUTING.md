# Contributing to FHEVM SDK

Thank you for your interest in contributing to FHEVM SDK! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/fhevm-react-template.git
   cd fhevm-react-template/packages/fhevm-sdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## 🛠️ Development Workflow

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test both success and error cases

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Building

```bash
# Build the package
npm run build

# Type check
npm run type-check
```

## 📝 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the style guide
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

Examples:
```
feat: add Vue 3 support
fix: resolve encryption error handling
docs: update README with new examples
```

## 🎯 Areas for Contribution

### High Priority
- **Framework Adapters**: Add support for more frameworks (Svelte, Angular, etc.)
- **Storage Implementations**: Add more storage backends (IndexedDB, Redis, etc.)
- **Testing**: Improve test coverage and add integration tests
- **Documentation**: Enhance examples and API documentation

### Medium Priority
- **Performance**: Optimize encryption/decryption operations
- **Error Handling**: Improve error messages and recovery
- **TypeScript**: Enhance type definitions
- **Examples**: Add more real-world examples

### Low Priority
- **Build Tools**: Improve build configuration
- **CI/CD**: Enhance GitHub Actions workflows
- **Monitoring**: Add performance monitoring

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment information**
   - Node.js version
   - npm version
   - Operating system
   - Browser (if applicable)

2. **Steps to reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Minimal code example

3. **Additional context**
   - Error messages
   - Screenshots (if applicable)
   - Related issues

## 💡 Feature Requests

When requesting features, please include:

1. **Problem description**
   - What problem does this solve?
   - Why is this important?

2. **Proposed solution**
   - How should this work?
   - Any design considerations?

3. **Alternatives considered**
   - What other approaches were considered?
   - Why is this approach better?

## 📋 Code Review Guidelines

### For Contributors
- Respond to feedback promptly
- Be open to suggestions
- Ask questions if something is unclear
- Test your changes thoroughly

### For Reviewers
- Be constructive and respectful
- Focus on code quality and maintainability
- Check for security implications
- Verify tests and documentation

## 🏷️ Release Process

1. **Version bumping**
   - Update version in `package.json`
   - Update `CHANGELOG.md`
   - Create release notes

2. **Testing**
   - Run full test suite
   - Test in multiple environments
   - Verify examples work

3. **Publishing**
   - Build the package
   - Publish to npm
   - Create GitHub release

## 📞 Getting Help

- 💬 [Discord](https://discord.gg/zama) - Community support
- 🐛 [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues) - Bug reports and feature requests
- 📖 [Documentation](https://docs.zama.ai) - Official documentation

## 📄 License

By contributing to FHEVM SDK, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to FHEVM SDK! 🎉
