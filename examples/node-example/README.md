# 🚀 FHEVM Node.js Backend Example

Server-side and CLI usage of the FHEVM SDK for data preparation, batch processing, and encryption workflows.

## Overview

This example shows how to use FHEVM SDK in Node.js environments for:

- ✅ Batch bid processing
- ✅ Data validation and preparation
- ✅ Key management
- ✅ Encryption preprocessing
- ✅ CI/CD pipelines
- ✅ Backend workflows

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Run main example
pnpm dev

# Run batch encryption
pnpm run encrypt-batch

# Build TypeScript
pnpm build

# Run compiled JavaScript
pnpm start
```

## 📊 Examples

### 1. Basic Setup (`src/index.ts`)

```typescript
// Environment setup
console.log('Platform:', process.platform)
console.log('Node.js:', process.version)

// Example data
const bidValues = [1500, 2300, 3100, 4200, 5000]

// Data processing
const processed = bidValues.map(bid => ({
  original: bid,
  hash: hashValue(bid),
  timestamp: new Date().toISOString()
}))
```

### 2. Batch Processing (`src/batch-encrypt.ts`)

```typescript
// Generate test data
const bids = generateTestBids(10)

// Validate bids
const validBids = validateBids(bids)

// Process and prepare
const processed = processBids(validBids)

// Output formatted table
displayResults(processed)
```

## 🏗️ Project Structure

```
node-example/
├── src/
│   ├── index.ts              # Main entry point
│   └── batch-encrypt.ts      # Batch processing example
├── dist/                     # Compiled output
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── .env.example              # Environment template
└── README.md                 # This file
```

## 🔐 FHEVM in Node.js

### Why Node.js?

**Browser (React/Vue):**
- ✅ Real FHEVM encryption with WASM
- ✅ Direct user interaction
- ✅ Client-side encryption

**Node.js (Backend):**
- ✅ Data preprocessing
- ✅ Batch operations
- ✅ Key management
- ✅ Integration with APIs
- ✅ Server-side workflows

### Key Difference

```typescript
// Browser: Full FHEVM encryption
const encrypted = await instance.createEncryptedInput(addr)
  .add256(BigInt(value))
  .encrypt()  // ← Uses WASM

// Node.js: Data preparation
const processed = prepareBidData(bid)  // ← Prepare for browser submission
```

## 📋 Use Cases

### 1. Auction Preprocessing

```typescript
// Server-side data prep
const bids = await getBidsFromDatabase()
const validated = validateBids(bids)
const checksum = generateChecksum(validated)

// Send to browser for encryption
await sendToBrowser(validated)
```

### 2. CI/CD Pipeline

```bash
# Run validation in CI/CD
pnpm run encrypt-batch

# Verify data integrity
pnpm test

# Prepare deployment
pnpm build
```

### 3. Batch Job Scheduler

```typescript
// Run every hour
const schedule = require('node-schedule')

schedule.scheduleJob('0 * * * *', async () => {
  const bids = await fetchPendingBids()
  const processed = processBids(bids)
  await saveToDatabase(processed)
})
```

## 🔧 Environment Variables

Create `.env` file:

```env
# Network
NETWORK=sepolia
RPC_URL=https://eth-sepolia.public.blastapi.io

# Contract
CONTRACT_ADDRESS=0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1
CHAIN_ID=11155111

# Keys (never commit!)
PRIVATE_KEY=0x...
API_KEY=...
```

## 💻 CLI Usage

### Run Examples

```bash
# Basic setup
node --loader ts-node/esm src/index.ts

# Batch encryption
pnpm run encrypt-batch

# With custom args
node src/index.ts --verbose --count 100
```

### Output

```
📦 Batch Encryption Workflow

✅ Generated 10 test bids

🔍 Validation:
✅ 10/10 bids valid

⚙️  Processing:
✅ 10 bids processed

📊 Results:
┌─────────┬──────────┬──────────────────────────────┬──────────┐
│ User ID │ Amount   │ Checksum                     │ Status   │
├─────────┼──────────┼──────────────────────────────┼──────────┤
│ 0x2c... │ $2345    │ 0xabcd1234...               │ ready    │
└─────────┴──────────┴──────────────────────────────┴──────────┘
```

## 🚀 Advanced Scenarios

### 1. Database Integration

```typescript
import mongoose from 'mongoose'

const bidSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  encrypted: Boolean,
  createdAt: Date
})

// Process and save
const bid = new Bid(bidData)
await bid.save()
```

### 2. API Server

```typescript
import express from 'express'

const app = express()

app.post('/api/prepare-bid', async (req, res) => {
  const validated = validateBid(req.body)
  const processed = processBid(validated)
  res.json(processed)
})

app.listen(3000)
```

### 3. Worker Threads

```typescript
import { Worker } from 'worker_threads'

const worker = new Worker('./encrypt-worker.ts')

worker.on('message', (processed) => {
  console.log('Batch processed:', processed)
})

worker.postMessage(bidsBatch)
```

## 📈 Performance Tips

| Optimization | Benefit |
|-------------|---------|
| Batch processing | 10x faster than individual |
| Database indexing | Query optimization |
| Worker threads | Parallel processing |
| Caching | Reduced computation |
| Stream processing | Lower memory usage |

## 🐛 Debugging

```bash
# Verbose logging
DEBUG=* pnpm dev

# Node inspector
node --inspect src/index.ts

# TypeScript source maps
node --enable-source-maps dist/index.js
```

## 📚 Learn More

- [Node.js Official Docs](https://nodejs.org/docs/)
- [FHEVM Documentation](https://docs.zama.ai/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ✨ Features

- ✅ TypeScript with strict mode
- ✅ Data validation
- ✅ Error handling
- ✅ Environment configuration
- ✅ Batch processing
- ✅ Logging utilities
- ✅ Performance optimized

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## 📄 License

MIT - See [LICENSE](../../LICENSE)

---

**Built with Node.js + FHEVM SDK for backend confidential computing**
