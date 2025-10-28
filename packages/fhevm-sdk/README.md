# FHEVM SDK

Universal FHEVM SDK - Framework-agnostic SDK for building privacy-preserving dApps with FHEVM.

> **Created by mk83** - Privacy-First Developer

## Features

- 🚀 **Framework Agnostic** - Works with React, Vue, Node.js, and more
- 🔒 **Privacy First** - Built-in encryption and decryption utilities
- 🎯 **Easy to Use** - Wagmi-like API for familiar developer experience
- 📦 **Modular Design** - Use only what you need
- 🛠️ **TypeScript Support** - Full type safety
- 🧪 **Well Tested** - Comprehensive test coverage

## Installation

```bash
npm install fhevm-sdk
```

## Quick Start

### React

```tsx
import { useFHEVM, FHEVMProvider, createSepoliaConfig } from 'fhevm-sdk';

function App() {
  const fhevm = useFHEVM();

  const handleConnect = async () => {
    await fhevm.connect();
    await fhevm.initialize(createSepoliaConfig());
  };

  const handleEncrypt = async () => {
    const result = await fhevm.encrypt(
      '0x1234...',
      [42, 100]
    );
    console.log('Encrypted:', result);
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect</button>
      <button onClick={handleEncrypt}>Encrypt</button>
    </div>
  );
}

// Wrap your app with FHEVMProvider
export default function Root() {
  return (
    <FHEVMProvider config={createSepoliaConfig()}>
      <App />
    </FHEVMProvider>
  );
}
```

### Vue

```vue
<template>
  <div>
    <button @click="handleConnect">Connect</button>
    <button @click="handleEncrypt">Encrypt</button>
  </div>
</template>

<script setup>
import { useFHEVM, createSepoliaConfig } from 'fhevm-sdk';

const fhevm = useFHEVM();

const handleConnect = async () => {
  await fhevm.connect();
  await fhevm.initialize(createSepoliaConfig());
};

const handleEncrypt = async () => {
  const result = await fhevm.encrypt('0x1234...', [42, 100]);
  console.log('Encrypted:', result);
};
</script>
```

### Node.js

```typescript
import { createFHEVMNode, createProviderAndSigner, createSepoliaConfig } from 'fhevm-sdk';
import { ethers } from 'ethers';

async function main() {
  const fhevmNode = createFHEVMNode();
  
  const { provider, signer } = createProviderAndSigner(
    'https://sepolia.infura.io/v3/YOUR_KEY',
    'YOUR_PRIVATE_KEY'
  );

  await fhevmNode.initialize(createSepoliaConfig(), provider, signer);

  const result = await fhevmNode.encrypt('0x1234...', [42, 100]);
  console.log('Encrypted:', result);
}
```

## API Reference

### Core API

#### `useFHEVM(config?)`

React hook for FHEVM operations.

**Returns:**
- `isConnected: boolean` - Wallet connection status
- `isInitialized: boolean` - FHEVM initialization status
- `isLoading: boolean` - Loading state
- `error?: string` - Error message
- `connect(): Promise<void>` - Connect wallet
- `disconnect(): void` - Disconnect wallet
- `initialize(config): Promise<void>` - Initialize FHEVM
- `encrypt(contractAddress, values): Promise<EncryptedResult>` - Encrypt values
- `decrypt(handles, contractAddress): Promise<Record<string, any>>` - Decrypt handles

#### `FHEVMProvider`

React context provider for FHEVM.

**Props:**
- `config: FHEVMConfig` - FHEVM configuration
- `onError?: (error: string) => void` - Error handler
- `onReady?: () => void` - Ready handler

#### `createFHEVMNode(storage?)`

Create FHEVM Node.js instance.

**Parameters:**
- `storage?: StorageInterface` - Custom storage implementation

### Configuration

#### `createSepoliaConfig(rpcUrl?)`

Create Sepolia testnet configuration.

#### `createHardhatConfig(rpcUrl?)`

Create Hardhat local configuration.

#### `createDefaultConfig(chainId)`

Create default configuration for any chain.

### Components

#### `EncryptButton`

Reusable encrypt button component.

**Props:**
- `contractAddress: string` - Contract address
- `values: (number | bigint | boolean)[]` - Values to encrypt
- `onSuccess?: (result) => void` - Success callback
- `onError?: (error: string) => void` - Error callback
- `className?: string` - CSS classes
- `disabled?: boolean` - Disabled state

#### `DecryptButton`

Reusable decrypt button component.

**Props:**
- `handles: string[]` - Encrypted handles
- `contractAddress: string` - Contract address
- `onSuccess?: (result) => void` - Success callback
- `onError?: (error: string) => void` - Error callback
- `className?: string` - CSS classes
- `disabled?: boolean` - Disabled state

## Examples

Check out the `examples/` directory for complete examples:

- `react-example.tsx` - React usage example
- `vue-example.vue` - Vue usage example
- `node-example.ts` - Node.js usage example

## Supported Chains

- **Hardhat Local**: 31337
- **Sepolia Testnet**: 11155111

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

## Author

**mk83** - Blockchain Developer & Privacy Enthusiast

- 🔒 **Specialization** - Privacy-preserving blockchain applications
- 🚀 **Mission** - Making FHEVM accessible to all developers
- 💡 **Focus** - Building developer-friendly tools for Web3

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit a pull request.

## Support

- 📖 [Documentation](https://docs.zama.ai)
- 💬 [Discord](https://discord.gg/zama)
- 🐛 [Issues](https://github.com/zama-ai/fhevm-react-template/issues)

---

*Built with ❤️ by mk83 for the FHEVM community*
