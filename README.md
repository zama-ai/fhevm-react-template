# 🔐 FHEVM Universal SDK - Framework-Agnostic Implementation

> **A production-ready, framework-agnostic FHEVM SDK for building encrypted dApps across React, Vue.js, Node.js, and Vanilla JavaScript.**

Build secure, encrypted applications with **real Fully Homomorphic Encryption** (FHEVM) - works seamlessly whether you're building with React, Vue, Node.js, or plain JavaScript. Zero framework coupling, maximum flexibility.

**✨ Status:** Production-ready with 4 complete framework examples, comprehensive documentation, and **full FHEVM v0.10.0+ integration** (fully encrypted storage, end-to-end encrypted bids, complete explorer privacy).

---

## 📚 Documentation Quick Links

Choose your path based on what you need:

| Your Goal | Document | Time | Best For |
|-----------|----------|------|----------|
| **🚀 Get Started Now** | [GETTING_STARTED.md](./GETTING_STARTED.md) | 5 min | First-time users |
| **🏗️ Understand Design** | [ARCHITECTURE.md](./packages/fhevm-sdk/ARCHITECTURE.md) | 10 min | Developers & architects |
| **📖 Full API Reference** | [API_REFERENCE.md](./packages/fhevm-sdk/API_REFERENCE.md) | 15 min | Deep dives & integration |
| **🎯 Implementation Details** | [ZAMA_BOUNTY_SUBMISSION.md](./ZAMA_BOUNTY_SUBMISSION.md) | 10 min | Requirements & scope |
| **🔍 Real-World Examples** | [SIMULATE_REAL_FHEVM.md](./SIMULATE_REAL_FHEVM.md) | 8 min | Encryption examples |

---

## 🎯 Choose Your Framework

The FHEVM SDK is **completely framework-agnostic** - the core encryption logic has zero dependencies. Pick your JavaScript environment and start encrypting in minutes:

| Framework | Type | Setup | Best For | Status | Start |
|-----------|------|-------|----------|--------|-------|
| **React + Next.js** | Frontend | 2 min | Modern web apps with routing | ✅ Production | [nextjs-app](./examples/nextjs-app) |
| **Vue 3** | Frontend | 2 min | Composition API, SFC support | ✅ Production | [vue-example](./examples/vue-example) |
| **Node.js** | Backend | 1 min | CLI, batch processing, CI/CD | ✅ Production | [node-example](./examples/node-example) |
| **Vanilla JS** | Frontend | 0 min | No build, GitHub Pages, instant | ✅ Production | [vanilla-js-example](./examples/vanilla-js-example) |

**All examples are identical functionally - they share the same:**
- ✅ Real FHEVM encryption (Relayer SDK v0.2.0 + Protocol v0.10.0+)
- ✅ Multi-bid auction (1 manual + 9 simulated bids, fully encrypted)
- ✅ TypeScript support (strict mode ready)
- ✅ Complete Privacy: Bids 100% hidden from blockchain explorer
- ✅ Error handling & logging
- ✅ Copy-paste ready, production code

---

## ⚡ 2-Minute Quick Start

```bash
# Clone repository
git clone https://github.com/dharmanan/fhevm-react-template
cd fhevm-react-template

# Option 1: React + Next.js (Port 3000) - RECOMMENDED
cd examples/nextjs-app && pnpm install && pnpm dev
# → Automatically opens http://localhost:3000
# → Full UI for encrypted auction with v0.10.0+ features

# Option 2: Zero-setup demo (just open in browser!)
cd examples/vanilla-js-example
# → Open index.html in your browser (that's it!)

# Option 3: Vue.js with Vite
cd examples/vue-example && pnpm install && pnpm dev
# → Visit http://localhost:5173

# Option 4: Node.js backend / CLI
cd examples/node-example && pnpm install && node src/index.ts
```

---

## 🌐 Live Demo

Want to see it in action? 

### 🏆 WinnerPrice - Live Auction Application
**[Live Demo](https://winnerprice.vercel.app)** - Complete working auction app deployed on Vercel

- ✅ **Full FHE Encryption**: All bid amounts encrypted end-to-end (v0.10.0+)
- ✅ **100% Private on Explorer**: Bid values completely invisible from blockchain
- ✅ **Multi-bid Auction**: 1 manual + 9 simulated fully encrypted bids
- ✅ **Sepolia Testnet**: Real network with Zama's latest FHEVM protocol
- 📊 **Source Code**: [dharmanan/winnerprice](https://github.com/dharmanan/winnerprice)

**Other frameworks** (Vue, Vanilla JS, Node.js) can be run locally - see [Getting Started](#-getting-started) section.

---

## 🔐 What is FHEVM?

**Fully Homomorphic Encryption Virtual Machine (FHEVM)** enables computation on encrypted data without decryption. Imagine an auction where bids are encrypted end-to-end - the contract determines a winner without ever seeing the bid amounts. That's FHEVM.

This SDK demonstrates production-grade FHEVM integration across all JavaScript environments.

## ✨ Core Features

- **🔐 Framework-Agnostic Core**: Zero dependencies in core SDK
- **🚀 Real FHEVM**: Relayer SDK v0.2.0 + Protocol v0.10.0+ (latest)
- **⚛️ Multi-Framework**: React, Vue, Node.js, Vanilla JS (same code everywhere)
- **📦 Monorepo**: Organized `/packages` for SDK and `/examples` for demos
- **🧪 Multi-Bid Auction**: 1 manual bid + 9 simulated bids (all encrypted)
- **🌐 Sepolia Testnet**: Works on Zama's FHEVM testnet with v0.10.0+ features
- **🔒 Complete Privacy**: Bids 100% encrypted, invisible on explorer
- **📚 Full Documentation**: 2,900+ lines of guides and API refs

## 📋 Prerequisites

- **Node.js** v18 or higher
- **pnpm** package manager (`npm install -g pnpm`)
- **Git** for cloning
- **MetaMask** (only for testnet interaction, optional)

## 🚀 Project Structure

```
fhevm-react-template/
├── packages/
│   └── fhevm-sdk/              # 🔐 Framework-agnostic SDK (core dependency)
│       ├── core/               # ← Zero dependencies here!
│       │   ├── encrypt.ts      # FHEVM encryption
│       │   ├── contract.ts     # Contract interaction
│       │   ├── relayer.ts      # Relayer service
│       │   ├── decrypt.ts      # Decryption utils
│       │   └── readWinner.ts   # Data reading
│       ├── react/              # React hooks (optional)
│       │   ├── useEncryptBid.ts
│       │   ├── useDecryptWinner.ts
│       │   └── ... (3 more hooks)
│       └── [API_REFERENCE.md](./packages/fhevm-sdk/API_REFERENCE.md) & [ARCHITECTURE.md](./packages/fhevm-sdk/ARCHITECTURE.md)
│
├── examples/
│   ├── nextjs-app/             # React + Next.js full-featured demo
│   ├── vue-example/            # Vue 3 Composition API demo
│   ├── node-example/           # Node.js CLI & batch encryption
│   └── vanilla-js-example/     # Single HTML file, zero deps
│
└── contracts/
    └── MockAuction.sol         # Smart contract for auction
```

## 💡 How It Works

### 1. Core SDK (Zero Dependencies)
```typescript
// Works ANYWHERE - browser, Node.js, Deno, even edge functions!
import { encryptBid } from 'fhevm-sdk/core';

const encrypted = await encryptBid(bidAmount, contractAddress);
// Returns: { handles: Uint8Array[], inputProof: Uint8Array }
```

### 2. Framework-Specific Hooks (Optional)
```typescript
// React? Use the hook:
import { useEncryptBid } from 'fhevm-sdk/react';
const { encryptBid, isLoading } = useEncryptBid();

// Vue? Same SDK, different wrapper
// Node.js? Same SDK, no wrapper needed
// Vanilla JS? Same SDK, native await
```

### 3. Real FHEVM Encryption
- Uses official **Relayer SDK v0.2.0** from Zama
- Encrypted on client-side (frontend)
- Submitted via contract (backend)
- Never exposed in plaintext

## 📖 Using the SDK

### For React/Vue Developers
1. Open [GETTING_STARTED.md](./GETTING_STARTED.md)
2. Pick your framework
3. Copy the integration code from your example app
4. Done! ✅

### For Backend/Node.js Developers
1. See [node-example/README.md](./examples/node-example/README.md)
2. Import `encryptBid` from core
3. Integrate into your pipeline
4. No framework overhead! ✅

### For Advanced Users
1. Read [ARCHITECTURE.md](./packages/fhevm-sdk/ARCHITECTURE.md)
2. Review [API_REFERENCE.md](./packages/fhevm-sdk/API_REFERENCE.md)
3. Check [SIMULATE_REAL_FHEVM.md](./SIMULATE_REAL_FHEVM.md) for examples
4. Implement your own wrapper! ✅

## 🧪 Testing the Examples

Each example includes a **multi-bid auction** (1 manual + 9 simulated) that demonstrates real encryption:

```bash
# React - interactive UI with live simulation
cd examples/nextjs-app && pnpm install && pnpm dev

# Vue - same auction, different framework  
cd examples/vue-example && pnpm install && pnpm dev

# Node.js - encrypt multiple bids programmatically
cd examples/node-example && pnpm install && node src/index.ts

# Vanilla JS - open in browser immediately
cd examples/vanilla-js-example && open index.html
```

All examples produce encrypted bids ready for contract submission. ✅

## 🔧 Common Tasks

### Install Dependencies
```bash
cd fhevm-react-template
pnpm install  # Installs all monorepo packages
```

### Run Specific Example
```bash
cd examples/nextjs-app
pnpm dev --port 3000
```

### Build for Production
```bash
cd examples/nextjs-app
pnpm build
pnpm start
```

### Deploy to Sepolia Testnet (FHEVM v0.10.0+)
```bash
# 1. Ensure .env.local is configured with:
#    - PRIVATE_KEY (your wallet key)
#    - INFURA_URL (Sepolia RPC endpoint)

# 2. Deploy MockAuction contract
pnpm deploy:sepolia

# 3. Update contract address in .env.local
# 4. Start the app
cd examples/nextjs-app && pnpm dev
# → Open http://localhost:3000
```

### TypeScript Compilation Check
````
pnpm tsc --noEmit  # Verify no errors
```

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Setup guides per framework | 5 min |
| [ARCHITECTURE.md](./packages/fhevm-sdk/ARCHITECTURE.md) | Design patterns & decisions | 10 min |
| [API_REFERENCE.md](./packages/fhevm-sdk/API_REFERENCE.md) | Complete API docs | 15 min |
| [ZAMA_BOUNTY_SUBMISSION.md](./ZAMA_BOUNTY_SUBMISSION.md) | Bounty requirements & proof | 10 min |
| [SIMULATE_REAL_FHEVM.md](./SIMULATE_REAL_FHEVM.md) | Real encryption examples | 8 min |
| [TEST_STEPS.md](./TEST_STEPS.md) | Debugging & troubleshooting | 5 min |

## 🎥 Video Walkthrough

**[FHEVM SDK Implementation Walkthrough](https://www.youtube.com/watch?v=jVdb4_ishNA)** - Complete technical deep-dive covering SDK architecture, framework-agnostic design, real FHEVM integration, and deployment strategy.

## 🤝 Contributing

Have a framework you'd like to support? Found a bug? Want to optimize the encryption?

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

All contributions welcome! 🙌

## 📞 Support & Resources

- **🐛 Issues**: [GitHub Issues](https://github.com/dharmanan/fhevm-react-template/issues)
- **💬 Questions**: [FHEVM Discord](https://discord.com/invite/zama)
- **📖 Docs**: [Zama FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- **🎯 Relayer SDK**: [Relayer SDK Guide](https://docs.zama.ai/protocol/relayer-sdk-guides/)

## 👤 Author

**Koray** - Created as part of Zama Bounty Program

- GitHub: [@dharmanan](https://github.com/dharmanan)
- Repository: [fhevm-react-template](https://github.com/dharmanan/fhevm-react-template)
- Bonus Demo: [winnerprice.vercel.app](https://winnerprice.vercel.app) ([source](https://github.com/dharmanan/winnerprice))

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the FHEVM community**

*Last updated: November 4, 2025 - FHEVM v0.10.0+ fully integrated*
