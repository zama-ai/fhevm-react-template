# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FHEVM React Template is a monorepo for building decentralized applications with Fully Homomorphic Encryption (FHE) support. It enables computation on encrypted data using Zama's FHEVM protocol.

## Initial Setup

Requires Node.js >= 20.0.0 and pnpm.

```bash
git submodule update --init --recursive  # Initialize hardhat submodule
pnpm install                             # Install deps (runs sdk:build via preinstall)
```

## Local Development Workflow (3 terminals)

```bash
# Terminal 1: Start local Hardhat node
pnpm chain                    # localhost:8545, chainId: 31337

# Terminal 2: Deploy contracts
pnpm deploy:localhost         # Deploys + generates TypeScript ABIs

# Terminal 3: Start frontend
pnpm start                    # http://localhost:3000
```

## Common Commands

### Smart Contracts (packages/hardhat)
```bash
pnpm compile              # Compile Solidity contracts
pnpm hardhat:test         # Run all contract tests
pnpm hardhat:lint         # Lint Solidity and TypeScript
pnpm deploy:sepolia       # Deploy to Sepolia testnet
pnpm verify:sepolia       # Verify contracts on Etherscan

# Run single test file
cd packages/hardhat && npx hardhat test test/FHECounter.ts
```

### SDK (packages/fhevm-sdk)
```bash
pnpm sdk:build            # Build the SDK (required before frontend works)
pnpm sdk:watch            # Watch mode for SDK development
pnpm sdk:test             # Run SDK tests with Vitest
pnpm sdk:test:watch       # Watch mode for SDK tests
pnpm sdk:clean            # Clean SDK build artifacts

# Run single test file
cd packages/fhevm-sdk && npx vitest run test/storage.test.ts
```

### Frontend (packages/nextjs)
```bash
pnpm next:build           # Production build
pnpm next:lint            # Lint frontend code
pnpm next:check-types     # TypeScript type checking
```

### Formatting & Linting
```bash
pnpm format               # Format all code (Next.js + Hardhat)
pnpm lint                 # Lint all code
```

## Architecture

### Monorepo Structure (pnpm workspaces)

**packages/hardhat** - Smart contract development (git submodule pointing to fhevm-hardhat-template)
- This is a **git submodule** — changes here are tracked in a separate repo
- Contracts in `contracts/`, deploy scripts in `deploy/`, tests in `test/`
- Uses `@fhevm/hardhat-plugin` for FHEVM support
- Solidity 0.8.27, EVM version: Cancun, optimizer: 800 runs

**packages/fhevm-sdk** - Core FHEVM utilities for React (package name: `@fhevm-sdk`)
- `src/react/` - React hooks: `useFHEDecrypt`, `useFHEEncryption`, `useFhevm`
- `src/storage/` - Ciphertext storage utilities (IndexedDB)
- `src/core/` - Core FHEVM functionality
- `src/FhevmDecryptionSignature.ts` - Decryption signature handling
- Exports: `/core`, `/storage`, `/types`, `/react`

**packages/nextjs** - React frontend application
- Next.js 15 with App Router (`app/` directory)
- RainbowKit + wagmi for wallet connection
- DaisyUI + Tailwind CSS for styling
- `hooks/fhecounter-example/` - Example FHEVM integration
- `hooks/helper/` - Wallet provider hooks (EIP-6963)
- `contracts/deployedContracts.ts` - Auto-generated contract addresses/ABIs
- TypeScript path alias: `~~/*` maps to project root

### Contract ABI Generation

Running `pnpm deploy:localhost` or `pnpm deploy:sepolia` automatically:
1. Deploys contracts
2. Runs `scripts/generateTsAbis.ts` to update `packages/nextjs/contracts/deployedContracts.ts`

### Network Configuration

**Hardhat** (`packages/hardhat/hardhat.config.ts`):
- localhost/hardhat: chainId 31337
- sepolia: chainId 11155111 (requires INFURA_API_KEY)

**Frontend** (`packages/nextjs/scaffold.config.ts`):
- Targets: hardhat, sepolia
- Production requires `NEXT_PUBLIC_ALCHEMY_API_KEY`

### Environment Variables

Hardhat (set via `npx hardhat vars set`):
- `MNEMONIC` - Wallet mnemonic
- `INFURA_API_KEY` - For Sepolia RPC
- `ETHERSCAN_API_KEY` - For contract verification

Frontend (.env.local):
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Required for production
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Optional

## Key Dependencies

- `@fhevm/solidity` - FHEVM Solidity contracts
- `@zama-fhe/relayer-sdk` - Relayer SDK for decryption
- `@openzeppelin/confidential-contracts` - OpenZeppelin FHE extensions
- `viem` + `wagmi` - Ethereum client library
- `@rainbow-me/rainbowkit` - Wallet connection UI

## Troubleshooting

**MetaMask nonce mismatch after Hardhat restart**: MetaMask tracks transaction nonces, but Hardhat resets them on restart. Fix: MetaMask → Settings → Advanced → "Clear Activity Tab"

**Cached view function results**: MetaMask caches smart contract view results. After restarting Hardhat, restart your entire browser (not just refresh) to clear the cache.
