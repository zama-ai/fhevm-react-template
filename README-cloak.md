# Cloak SDK - Universal FHEVM SDK

> **Built on [Zama's Official FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)**

A comprehensive, framework-agnostic SDK for building confidential dApps with FHEVM encryption. Built on top of Zama's proven FHEVM infrastructure with additional contracts, React integration, and developer tooling.

## 🚀 **Why Build on the Official Template?**

Instead of reinventing the wheel, we've built upon [Zama's official FHEVM Hardhat template](https://github.com/zama-ai/fhevm-hardhat-template) to create a more comprehensive solution:

- ✅ **Proven Foundation** - Built on Zama's tested and verified FHEVM infrastructure
- ✅ **Official Compatibility** - Maintains full compatibility with official FHEVM patterns
- ✅ **Extended Features** - Adds banking, voting, and other real-world contract examples
- ✅ **Framework Integration** - Provides React hooks, components, and CLI tools
- ✅ **Developer Experience** - Enhanced tooling and documentation

## 📦 **What's Included**

### **Core Packages**
- **`@cloak-sdk/core`** - Framework-agnostic FHEVM utilities
- **`@cloak-sdk/react`** - React hooks, components, and provider
- **`@cloak-sdk/cli`** - Command-line tools for development

### **Example Contracts** (Built on Official Template)
- **`FHECounter.sol`** - Official counter with increment/decrement operations
- **`FHEVoting.sol`** - Confidential voting system
- **`FHEBank.sol`** - Private banking with encrypted balances

### **Demo Applications**
- **Next.js Demo** - Full-featured app with clean UI and wallet integration
- **Vue.js Demo** - Simple Vue.js implementation
- **Node.js Demo** - Server-side usage with interactive CLI

## 🏆 **Zama FHEVM Bounty Submission**

> **Built for the Zama FHEVM Bounty Challenge - Universal FHEVM SDK**

This project is our submission for the Zama FHEVM Bounty Challenge, delivering a comprehensive, framework-agnostic SDK that makes building confidential dApps simple and developer-friendly.

### **🎬 Video Walkthrough**
[Watch our comprehensive demo video](VIDEO_SCRIPT.md) showcasing the SDK capabilities across multiple frameworks.

### **🚀 Live Demos**
- **Next.js Demo**: [Deploy Link Coming Soon]
- **Vue.js Demo**: [Deploy Link Coming Soon]  
- **Node.js Demo**: [CLI Demo Instructions]

## 🛠️ **Quick Start**

### Prerequisites
- **Node.js**: Version 20 or higher
- **pnpm**: Package manager (required - configured with .npmrc files)

### Installation

```bash
# Clone the repository
git clone https://github.com/0xNana/cloak-sdk.git
cd cloak-sdk

# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run tests
pnpm test
```

### Deploy Contracts

```bash
# Start local FHEVM node
pnpm node

# Deploy to local network
pnpm deploy:localhost

# Deploy to Sepolia testnet
pnpm deploy:sepolia
```

### Run Demos

```bash
# Next.js demo
cd examples/nextjs-demo
pnpm install
pnpm dev

# Vue.js demo
cd examples/vue-demo
pnpm install
pnpm dev

# Node.js demo
cd examples/node-demo
pnpm install
pnpm start
```

## 🏗️ **Architecture**

### **Built on Official FHEVM Template**
```
cloak-sdk/
├── fhevm-hardhat-template/  # Official Zama template with our contracts
│   ├── contracts/           # Smart contracts (official + our additions)
│   │   ├── FHECounter.sol   # Official counter contract
│   │   ├── FHEVoting.sol    # Our confidential voting
│   │   └── FHEBank.sol      # Our private banking
│   ├── hardhat.config.ts    # Official Hardhat configuration
│   └── package.json         # Official dependencies
├── packages/                # SDK packages
│   ├── core/               # Framework-agnostic core
│   ├── react/              # React integration
│   └── cli/                # CLI tools
├── examples/               # Demo applications
│   ├── nextjs-demo/        # Next.js showcase
│   ├── vue-demo/           # Vue.js example
│   └── node-demo/          # Node.js interactive CLI
└── docs/                   # Documentation
```

### **Key Differences from Official Template**

| Feature | Official Template | Cloak SDK |
|---------|------------------|-----------|
| **Contracts** | Basic counter | Counter + Voting + Banking |
| **Frontend** | None | React + Vue + Next.js + Node.js |
| **SDK** | None | Framework-agnostic core |
| **CLI** | None | Project setup & deployment |
| **Documentation** | Basic | Comprehensive guides |
| **Structure** | Single template | Monorepo with packages |

## 🔧 **Usage Examples**

### **React Integration**
```typescript
import { useCloakSDK, useCloakEncryption } from '@cloak-sdk/react'

function MyComponent() {
  const { sdk, isReady } = useCloakSDK()
  const { encrypt } = useCloakEncryption({
    sdk,
    contractAddress: '0x...'
  })

  const handleEncrypt = async () => {
    const result = await encrypt(42, 'externalEuint32')
    // Use encrypted data...
  }
}
```

### **Contract Interaction**
```typescript
import { CloakSDK } from '@cloak-sdk/core'

const sdk = new CloakSDK()
await sdk.initialize({ provider })

const encryption = sdk.getEncryption()
const encrypted = await encryption.encrypt({
  contractAddress: '0x...',
  data: 100,
  dataType: 'externalEuint32'
})
```

### **CLI Usage**
```bash
# Initialize new project
npx @cloak-sdk/cli init my-confidential-dapp

# Deploy contracts
npx @cloak-sdk/cli deploy --network sepolia
```

## 📚 **Documentation**

- **[Getting Started Guide](docs/getting-started.md)** - Quick setup and first steps
- **[Architecture Overview](docs/architecture.md)** - Technical deep dive
- **[API Reference](docs/api-reference.md)** - Complete API documentation
- **[Examples](docs/examples.md)** - Real-world usage patterns

## 🔗 **Official FHEVM Resources**

- **[FHEVM Documentation](https://docs.fhevm.io)** - Official FHEVM docs
- **[FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)** - Original template
- **[FHEVM Hardhat Plugin](https://github.com/zama-ai/fhevm-hardhat-plugin)** - Hardhat integration
- **[Zama Discord](https://discord.gg/zama)** - Community support

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🚨 **Troubleshooting**

### **Package Manager Issues**
If you encounter npm workspace errors with Next.js:
- Ensure you're using **pnpm** (not npm)
- The project includes `.npmrc` files to configure pnpm workspaces
- Run `pnpm install` from the root directory first
- The `packageManager` field in package.json enforces pnpm usage
- Scripts include `NPM_CONFIG_WORKSPACES=false` to prevent npm conflicts

### **Common Issues**
1. **"npm error code ENOWORKSPACES"**: Use pnpm instead of npm
2. **Build failures**: Ensure all dependencies are installed with `pnpm install`
3. **TypeScript errors**: Run `pnpm build` to compile packages first
4. **"Can't resolve '@react-native-async-storage/async-storage'"**: This is handled by our webpack fallback
5. **Circular dependency warnings**: Our webpack config uses aggressive chunk splitting to prevent this
6. **"Lit is in dev mode"**: This is disabled via `LIT_DEV_MODE=false` environment variable

## 📄 **License**

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 **Acknowledgments**

- **Zama Team** - For the excellent FHEVM infrastructure and official template
- **FHEVM Community** - For feedback and contributions
- **Open Source Contributors** - For building the foundation

---

**Built with ❤️ by the Cloak SDK team, powered by Zama's FHEVM**