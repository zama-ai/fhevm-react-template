# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-XX

### Added
- 🚀 Initial release of FHEVM SDK
- 🔧 Framework-agnostic core implementation
- ⚛️ React hooks and components (`useFHEVM`, `FHEVMProvider`, `EncryptButton`, `DecryptButton`)
- 🟢 Vue composables (`useFHEVM`)
- 🖥️ Node.js utilities (`FHEVMNode`, `createFHEVMNode`)
- 🔐 Encryption and decryption utilities
- 📦 Modular design with separate adapters
- 🛠️ TypeScript support with full type definitions
- 📚 Comprehensive documentation and examples
- 🧪 Test suite with Jest
- 🎨 Demo page showcasing all features
- 📋 Wagmi-like API for familiar developer experience

### Features
- **Core SDK**: Framework-agnostic FHEVM client
- **React Adapter**: Hooks, providers, and reusable components
- **Vue Adapter**: Composables for Vue 3
- **Node.js Adapter**: Server-side utilities
- **Encryption Utils**: Easy-to-use encryption functions
- **Decryption Utils**: Secure decryption with signature management
- **Storage Interface**: Pluggable storage system
- **Type Safety**: Full TypeScript support
- **Examples**: Complete examples for all frameworks
- **Documentation**: Comprehensive README and API docs

### Supported Chains
- Hardhat Local (31337)
- Sepolia Testnet (11155111)

### Dependencies
- `@zama-fhe/relayer-sdk`: ^0.1.2
- `ethers`: ^6.0.0

### Peer Dependencies
- `react`: >=16.8.0 (optional)
- `vue`: >=3.0.0 (optional)

## [0.1.0] - 2024-10-XX

### Added
- 🏗️ Initial project structure
- 📝 Basic documentation
- 🔧 Development tooling setup
