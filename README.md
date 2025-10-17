# Universal FHEVM SDK - Cloak SDK

A comprehensive, framework-agnostic FHEVM SDK built on Zama's official template. This repository provides a complete toolkit for building confidential dApps across multiple frameworks including React, Vue, Node.js, and Next.js.

## 🚀 What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) enables computation on encrypted data directly on Ethereum. This SDK provides a universal interface for building dApps that can perform computations while keeping data private.

## ✨ Features

- **🔐 Universal FHEVM SDK**: Framework-agnostic core SDK that works with any frontend
- **⚛️ React Integration**: Complete React hooks and components for FHEVM
- **🛠️ CLI Tools**: Command-line interface for contract management
- **🌐 Multi-Framework Support**: Works with React, Vue, Node.js, and Next.js
- **🎨 Multiple Examples**: Complete demos for different frameworks
- **🔗 RainbowKit Integration**: Seamless wallet connection and management
- **🌐 Multi-Network Support**: Works on both Sepolia testnet and local Hardhat node
- **📦 Monorepo Structure**: Organized packages for SDK, contracts, and examples

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v20 or higher)
- **pnpm** package manager
- **MetaMask** browser extension
- **Git** for cloning the repository

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/0xNana/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Set up your environment variables by copying the example files:

```bash
# For examples
cp examples/nextjs-demo/.env.example examples/nextjs-demo/.env.local
cp examples/node-demo/.env.example examples/node-demo/.env
cp examples/vue-demo/.env.example examples/vue-demo/.env
```

Configure your environment variables:
- `MNEMONIC`: Your wallet mnemonic phrase
- `INFURA_API_KEY`: Your Infura API key for Sepolia
- `NEXT_PUBLIC_ALCHEMY_API_KEY`: Your Alchemy API key

### 3. Build the SDK

```bash
# Build all packages
pnpm build

# Or build individual packages
pnpm core:build
pnpm react:build
pnpm cli:build
```

### 4. Start Development Environment

**Option A: Local Development (Recommended for testing)**

```bash
# Terminal 1: Start local Hardhat node
pnpm chain
# RPC URL: http://127.0.0.1:8545 | Chain ID: 31337

# Terminal 2: Deploy contracts to localhost
pnpm contracts:deploy

# Terminal 3: Start the Next.js example
pnpm start
```

**Option B: Sepolia Testnet**

```bash
# Deploy to Sepolia testnet
pnpm contracts:deploy:sepolia

# Start the Next.js example
pnpm start
```

## 📁 Project Structure

This template uses a monorepo structure with multiple packages and examples:

```
fhevm-react-template/
├── packages/
│   ├── core/                    # Universal FHEVM SDK core
│   ├── react/                   # React hooks and components
│   ├── cli/                     # Command-line tools
│   ├── fhevm-sdk/              # Original FHEVM SDK (preserved)
│   ├── hardhat/                # Smart contracts & deployment
│   └── nextjs/                 # Next.js frontend application
├── examples/
│   ├── nextjs-demo/            # Next.js example with Cloak SDK
│   ├── node-demo/              # Node.js example
│   └── vue-demo/               # Vue.js example
└── scripts/                    # Build and deployment scripts
```

## 🎯 SDK Packages

### @cloak-sdk/core
Framework-agnostic core SDK providing:
- Encryption and decryption utilities
- Contract interaction helpers
- FHEVM instance management
- Storage utilities

### @cloak-sdk/react
React-specific package with:
- `useCloakSDK` - Main SDK hook
- `useCloakEncryption` - Encryption utilities
- `useCloakDecryption` - Decryption utilities
- `useCloakContract` - Contract interaction
- Pre-built components for common use cases

### @cloak-sdk/cli
Command-line tools for:
- Project initialization
- Contract compilation
- Deployment management
- Development workflow automation

## 🚀 Usage Examples

### React/Next.js

```tsx
import { useCloakSDK } from '@cloak-sdk/react';

function MyComponent() {
  const { encrypt, decrypt, isReady } = useCloakSDK();
  
  const handleEncrypt = async () => {
    const encrypted = await encrypt(42);
    console.log('Encrypted:', encrypted);
  };
  
  return (
    <div>
      <button onClick={handleEncrypt} disabled={!isReady}>
        Encrypt Data
      </button>
    </div>
  );
}
```

### Node.js

```javascript
import { CloakSDK } from '@cloak-sdk/core';

const sdk = new CloakSDK({
  rpcUrl: 'http://127.0.0.1:8545',
  chainId: 31337
});

const encrypted = await sdk.encrypt(42);
console.log('Encrypted:', encrypted);
```

### Vue.js

```vue
<template>
  <div>
    <button @click="handleEncrypt" :disabled="!isReady">
      Encrypt Data
    </button>
  </div>
</template>

<script setup>
import { useCloakSDK } from '@cloak-sdk/react';

const { encrypt, isReady } = useCloakSDK();

const handleEncrypt = async () => {
  const encrypted = await encrypt(42);
  console.log('Encrypted:', encrypted);
};
</script>
```

## 🔧 Available Scripts

### Core SDK
- `pnpm core:build` - Build core SDK
- `pnpm core:test` - Test core SDK

### React Package
- `pnpm react:build` - Build React package
- `pnpm react:test` - Test React package

### CLI Tools
- `pnpm cli:build` - Build CLI tools
- `pnpm cli:test` - Test CLI tools

### Examples
- `pnpm node-demo:start` - Start Node.js demo
- `pnpm node-demo:dev` - Run Node.js demo in dev mode
- `pnpm node-demo:demo` - Run Node.js demo

### Contracts
- `pnpm contracts:compile` - Compile contracts
- `pnpm contracts:deploy` - Deploy to localhost
- `pnpm contracts:deploy:sepolia` - Deploy to Sepolia

## 🔧 Troubleshooting

### Common MetaMask + Hardhat Issues

#### ❌ Nonce Mismatch Error

**Problem**: MetaMask tracks transaction nonces, but when you restart Hardhat, the node resets while MetaMask doesn't update its tracking.

**Solution**:
1. Open MetaMask extension
2. Select the Hardhat network
3. Go to **Settings** → **Advanced**
4. Click **"Clear Activity Tab"** (red button)
5. This resets MetaMask's nonce tracking

#### ❌ Cached View Function Results

**Problem**: MetaMask caches smart contract view function results. After restarting Hardhat, you may see outdated data.

**Solution**:
1. **Restart your entire browser** (not just refresh the page)
2. MetaMask's cache is stored in extension memory and requires a full browser restart to clear

> 💡 **Pro Tip**: Always restart your browser after restarting Hardhat to avoid cache issues.

## 📚 Additional Resources

### Official Documentation
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/) - Complete FHEVM guide
- [FHEVM Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat) - Hardhat integration
- [Relayer SDK Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/) - SDK reference
- [Environment Setup](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) - MNEMONIC & API keys

### Development Tools
- [MetaMask + Hardhat Setup](https://docs.metamask.io/wallet/how-to/run-devnet/) - Local development
- [React Documentation](https://reactjs.org/) - React framework guide

### Community & Support
- [FHEVM Discord](https://discord.com/invite/zama) - Community support
- [GitHub Issues](https://github.com/0xNana/fhevm-react-template/issues) - Bug reports & feature requests

## 🏆 Bounty Submission

This repository is a submission for the Zama Bounty Program October 2025: "Build an Universal FHEVM SDK". 

**Key Features Delivered:**
- ✅ Framework-agnostic SDK that works with React, Vue, Node.js, and Next.js
- ✅ Wagmi-like modular API structure with hooks and adapters
- ✅ Complete encryption and decryption flows with EIP-712 signing
- ✅ Reusable components for different encryption/decryption scenarios
- ✅ Multiple working examples across different frameworks
- ✅ CLI tools for development workflow
- ✅ Comprehensive documentation and setup guides

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a bounty submission repository. For issues and feature requests, please use the GitHub Issues page.

---

**Built with ❤️ for the FHEVM ecosystem**