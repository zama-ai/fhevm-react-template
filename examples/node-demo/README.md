# Cloak SDK Node.js Demo

A comprehensive Node.js demonstration of the Cloak SDK showcasing server-side FHEVM integration with interactive and automated demos.

## 🚀 **Features**

- **Interactive CLI Demo** - Menu-driven interface for exploring SDK features
- **Automated Demo** - Comprehensive showcase of all SDK capabilities
- **Test Suite** - Complete testing of SDK functionality
- **Server-side Integration** - Node.js specific patterns and best practices
- **Environment Configuration** - Full environment variable support

## 🛠️ **Getting Started**

### Prerequisites

- Node.js 18+
- Cloak SDK dependencies installed
- Environment variables configured

### Installation

```bash
# Navigate to the demo directory
cd examples/node-demo

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### Running the Demos

#### Interactive Demo
```bash
# Start interactive demo
pnpm start

# Or with auto-reload
pnpm dev
```

#### Automated Demo
```bash
# Run comprehensive automated demo
pnpm demo
```

#### Test Suite
```bash
# Run all tests
pnpm test
```

## 📋 **Demo Components**

### 1. Interactive Demo (`src/index.js`)
- **Menu-driven interface** with chalk styling
- **Encryption/Decryption** demonstrations
- **Contract interaction** examples
- **SDK status** and configuration display
- **Real-time feedback** with ora spinners

### 2. Automated Demo (`src/demo.js`)
- **Comprehensive showcase** of all SDK features
- **Multiple data types** encryption testing
- **Contract interaction** simulation
- **Feature validation** and testing
- **Configuration display**

### 3. Test Suite (`src/test.js`)
- **Complete test coverage** of SDK functionality
- **Environment validation** testing
- **Network connection** verification
- **Error handling** validation
- **Detailed test results** reporting

## 🔧 **Configuration**

### Environment Variables

The demo uses the following environment variables:

```env
# Network Configuration
CHAIN_ID=11155111
RPC_URL=https://sepolia.infura.io/v3/your_api_key

# FHEVM Configuration
FHEVM_NETWORK=sepolia
GATEWAY_URL=https://gateway.sepolia.zama.ai

# Contract Addresses
COUNTER_CONTRACT_ADDRESS=0x...
VOTING_CONTRACT_ADDRESS=0x...
BANK_CONTRACT_ADDRESS=0x...

# Development
DEBUG=true
LOG_LEVEL=debug

# Wallet Configuration (Optional)
# If not provided, a demo wallet will be generated
PRIVATE_KEY=0x...
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm start` | Run interactive demo |
| `pnpm dev` | Run with auto-reload |
| `pnpm demo` | Run automated demo |
| `pnpm test` | Run test suite |

## 🎯 **Usage Examples**

### Basic SDK Usage
```javascript
import { CloakSDK } from '@cloak-sdk/core';
import { ethers } from 'ethers';

// Initialize SDK
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const sdk = new CloakSDK();

await sdk.initialize({
  provider,
  chainId: parseInt(process.env.CHAIN_ID),
  // Chain ID is automatically resolved from the provider
});

// Encrypt data
const encryption = sdk.getEncryption();
const result = await encryption.encrypt({
  contractAddress: process.env.COUNTER_CONTRACT_ADDRESS,
  userAddress: this.userAddress, // Real wallet address from environment or generated
  data: 42,
  dataType: 'externalEuint32'
});
```

### Contract Interaction
```javascript
// Get contract utilities
const contract = sdk.getContract();

// Call contract method with encrypted parameters
const result = await contract.callContractMethod({
  contractAddress: process.env.COUNTER_CONTRACT_ADDRESS,
  methodName: 'increment',
  parameters: [encryptedData],
  abi: contractABI
});
```

## 🧪 **Testing**

The test suite covers:

- ✅ **SDK Initialization** - Proper SDK setup and configuration
- ✅ **Environment Variables** - All required variables are set
- ✅ **Network Connection** - RPC connection and chain ID validation
- ✅ **Encryption Module** - Data encryption functionality
- ✅ **Decryption Module** - Data decryption functionality
- ✅ **Contract Interaction** - Contract method calling
- ✅ **Data Types** - All supported FHEVM data types
- ✅ **Error Handling** - Proper error handling and validation

## 🔍 **Debugging**

### Enable Debug Mode
```env
DEBUG=true
LOG_LEVEL=debug
```

### Common Issues

1. **Network Connection Errors**
   - Check RPC URL and API keys
   - Verify network connectivity
   - Ensure correct chain ID

2. **SDK Initialization Errors**
   - Verify environment variables
   - Check provider configuration
   - Ensure FHEVM network is accessible

3. **Contract Interaction Errors**
   - Verify contract addresses
   - Check contract deployment
   - Ensure proper ABI configuration

## 📚 **Integration Patterns**

### Server-side Applications
```javascript
// Express.js integration
import express from 'express';
import { CloakSDK } from '@cloak-sdk/core';

const app = express();
const sdk = new CloakSDK();

// Initialize SDK once
await sdk.initialize({ /* config */ });

// Use in routes
app.post('/encrypt', async (req, res) => {
  const encryption = sdk.getEncryption();
  const result = await encryption.encrypt(req.body);
  res.json(result);
});
```

### Background Jobs
```javascript
// Worker process integration
import { Worker } from 'worker_threads';
import { CloakSDK } from '@cloak-sdk/core';

// Initialize SDK in worker
const sdk = new CloakSDK();
await sdk.initialize({ /* config */ });

// Process encrypted data
setInterval(async () => {
  const decryption = sdk.getDecryption();
  // Process queued decryption requests
}, 5000);
```

## 🚀 **Next Steps**

1. **Deploy Contracts** - Deploy FHEVM contracts to Sepolia
2. **Update Addresses** - Update contract addresses in environment
3. **Custom Integration** - Adapt patterns for your application
4. **Production Setup** - Configure for production environment

## 📄 **License**

MIT License - see [LICENSE](../../LICENSE) for details.
