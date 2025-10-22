# 🚀 How to Use Your Universal FHEVM SDK

## 📋 Quick Start Guide

Your Universal FHEVM SDK is now integrated into this project! Here's how to use it:

## 🎮 Try the Demo

### 1. Start the Development Server
```bash
cd packages/site
npm run dev
```

### 2. Open the SDK Demo
- Go to: http://localhost:3000
- Click "Try SDK Demo" button
- Or go directly to: http://localhost:3000/sdk-demo

### 3. Test the SDK
- Connect your MetaMask wallet
- Initialize the FHEVM SDK
- Try encrypting and decrypting values
- See the SDK in action!

## 💻 Using the SDK in Your Code

### React Hook Usage
```tsx
import { useFHEVM, createSepoliaConfig } from '../../fhevm-sdk/src';

function MyComponent() {
  const fhevm = useFHEVM();

  const handleConnect = async () => {
    await fhevm.connect();
    await fhevm.initialize(createSepoliaConfig());
  };

  const handleEncrypt = async () => {
    const result = await fhevm.encrypt(
      '0x1234...', // contract address
      [42, 100, true] // values to encrypt
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
```

### Using Components
```tsx
import { EncryptButton, DecryptButton } from '../../fhevm-sdk/src';

function MyComponent() {
  return (
    <div>
      <EncryptButton
        contractAddress="0x1234..."
        values={[42, 100]}
        onSuccess={(result) => console.log('Encrypted:', result)}
        onError={(error) => console.error('Error:', error)}
      >
        Encrypt Values
      </EncryptButton>
    </div>
  );
}
```

### With Provider
```tsx
import { FHEVMProvider, createSepoliaConfig } from '../../fhevm-sdk/src';

function App() {
  return (
    <FHEVMProvider config={createSepoliaConfig()}>
      <MyComponent />
    </FHEVMProvider>
  );
}
```

## 🛠️ SDK Features

### Core Features
- **Framework Agnostic** - Works with React, Vue, Node.js
- **Wagmi-like API** - Familiar developer experience
- **TypeScript Support** - Full type safety
- **Easy Setup** - Simple configuration

### Available Hooks
- `useFHEVM()` - Main React hook
- `useFHEVMWithConfig()` - Auto-initialization hook

### Available Components
- `EncryptButton` - Reusable encryption component
- `DecryptButton` - Reusable decryption component
- `FHEVMProvider` - Context provider

### Configuration Helpers
- `createSepoliaConfig()` - Sepolia testnet config
- `createHardhatConfig()` - Hardhat local config
- `createDefaultConfig()` - Custom chain config

## 📁 SDK Structure

```
packages/fhevm-sdk/
├── src/
│   ├── core/                    # Framework-agnostic core
│   │   ├── fhevm-client.ts     # Main FHEVM client
│   │   ├── encryption.ts        # Encryption utilities
│   │   └── decryption.ts        # Decryption utilities
│   ├── adapters/               # Framework adapters
│   │   ├── react/              # React hooks & components
│   │   ├── vue/                # Vue composables
│   │   └── node/               # Node.js utilities
│   └── types.ts                # TypeScript definitions
├── examples/                   # Usage examples
├── demo/                       # Interactive demo
└── README.md                   # Complete documentation
```

## 🔧 Development

### Building the SDK
```bash
cd packages/fhevm-sdk
npm run build
```

### Running Tests
```bash
cd packages/fhevm-sdk
npm test
```

### Type Checking
```bash
cd packages/fhevm-sdk
npm run type-check
```

## 📚 Examples

### React Example
See: `packages/fhevm-sdk/examples/react-example.tsx`

### Vue Example
See: `packages/fhevm-sdk/examples/vue-example.vue`

### Node.js Example
See: `packages/fhevm-sdk/examples/node-example.ts`

## 🎯 Use Cases

### 1. Privacy-Preserving Voting
```tsx
const fhevm = useFHEVM();
const vote = await fhevm.encrypt(contractAddress, [candidateId]);
```

### 2. Private Auctions
```tsx
const fhevm = useFHEVM();
const bid = await fhevm.encrypt(contractAddress, [bidAmount]);
```

### 3. Confidential Transactions
```tsx
const fhevm = useFHEVM();
const transaction = await fhevm.encrypt(contractAddress, [amount, recipient]);
```

## 🚀 Next Steps

1. **Try the Demo** - Test the SDK functionality
2. **Read the Documentation** - Check `packages/fhevm-sdk/README.md`
3. **Explore Examples** - Look at the example files
4. **Build Your App** - Use the SDK in your own projects
5. **Contribute** - Help improve the SDK

## 🏆 Bounty Submission

This SDK was created for the **Zama Developer Program Bounty Track - October 2025**.

**Repository**: https://github.com/83mhpll/fhevm-react-template/tree/bounty-submission-october-2025

**Developer**: mk83

---

*Enjoy building privacy-preserving dApps with your Universal FHEVM SDK! 🎉*
