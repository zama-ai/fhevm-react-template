# FHEVM SDK - Getting Started Guide

Start encrypting bids in < 5 minutes. Choose your framework below.

---

## ⚡ Quick Start (60 seconds)

### Copy-Paste Templates

**React Hook:**
```typescript
import { useEncryptBid } from 'fhevm-sdk/react'

function MyComponent() {
  const { encrypt, loading } = useEncryptBid()
  
  const handleEncrypt = async () => {
    const encrypted = await encrypt(5000)
    console.log('Encrypted:', encrypted)
  }

  return <button onClick={handleEncrypt}>{loading ? '...' : 'Encrypt'}</button>
}
```

**Vue Composable:**
```typescript
import { ref } from 'vue'

export default {
  setup() {
    const encrypted = ref(null)
    const loading = ref(false)

    const encrypt = async (value) => {
      loading.value = true
      const instance = await window.relayerSDK.createInstance(config)
      encrypted.value = await instance
        .createEncryptedInput(contractAddr, userAddr)
        .add256(BigInt(value))
        .encrypt()
      loading.value = false
    }

    return { encrypt, encrypted, loading }
  }
}
```

**Vanilla JavaScript:**
```html
<input type="number" id="bidInput" placeholder="Bid amount" />
<button onclick="encryptBid()">Encrypt</button>

<script src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"></script>
<script>
  async function encryptBid() {
    const value = document.getElementById('bidInput').value
    const instance = await window.relayerSDK.createInstance(config)
    const encrypted = await instance
      .createEncryptedInput(contractAddr, userAddr)
      .add256(BigInt(value))
      .encrypt()
    console.log('✅ Encrypted:', encrypted)
  }
</script>
```

**Node.js:**
```typescript
import { initSDK } from 'fhevm-sdk/core'

async function encryptBatch(bids: number[]) {
  await initSDK()
  const config = relayerSDK.SepoliaConfig
  const instance = await relayerSDK.createInstance(config)
  
  const results = await Promise.all(
    bids.map(bid =>
      instance
        .createEncryptedInput(contractAddr, userAddr)
        .add256(BigInt(bid))
        .encrypt()
    )
  )
  return results
}
```

---

## 📁 Framework Examples

### 1. React + Next.js (Recommended)

```bash
cd examples/nextjs-app
pnpm install
pnpm dev
# Open http://localhost:3000
```

**File:** `examples/nextjs-app/hooks/useAuction.ts` (with 99-bid simulation)

**Features:**
- Full auction UI with encrypted bids
- Real FHEVM encryption
- 99-bid simulation demo
- Production-ready error handling

---

### 2. Vue.js 3 (Composition API)

```bash
cd examples/vue-example
pnpm install
pnpm dev
# Open http://localhost:5173
```

**Files:**
- `src/App.vue` - Main component (757 lines)
- Shows encryption flow step-by-step
- Live console log viewer
- Responsive UI

**Key Points:**
- No build setup needed (Vite handles it)
- Real FHEVM SDK via CDN
- Perfect for learning

---

### 3. Node.js Backend

```bash
cd examples/node-example
pnpm install
pnpm dev
```

**Files:**
- `src/index.ts` - Main demo
- `src/batch-encrypt.ts` - Batch processing (99 bids)

**Use Cases:**
- Preprocessing bids before frontend submission
- CI/CD pipelines
- Data validation workflows
- Batch encryption with checksums

**Output:**
```
📋 Batch Encryption Results
┌─────────┬────────┬────────────────┬────────┐
│ Bid ID  │ Amount │ Hash           │ Status │
├─────────┼────────┼────────────────┼────────┤
│ 1       │ 1234   │ 0x1a2b3c...    │ ✅     │
│ 2       │ 5678   │ 0x4d5e6f...    │ ✅     │
│ ...     │ ...    │ ...            │ ...    │
│ 99      │ 9999   │ 0x7g8h9i...    │ ✅     │
└─────────┴────────┴────────────────┴────────┘
```

---

### 4. Vanilla JavaScript (Zero Dependencies)

```bash
cd examples/vanilla-js-example
# Simply open index.html in browser
# Or run: npx http-server
```

**File:** `index.html` (719 lines - everything in one file)

**No Setup Needed:**
- Pure HTML + CSS + JavaScript
- Works on GitHub Pages, Netlify, any static host
- Real FHEVM SDK loaded from CDN
- Production-ready

**Perfect For:**
- Prototyping quickly
- Learning FHEVM API
- Simple projects without build tools

---

## 🔐 API Reference

### Core Functions

#### `initSDK()`
Initialize WASM and relayer connection. Call once at app startup.

```typescript
await initSDK()
```

#### `createEncryptedInput(contractAddress, userAddress)`
Create encryption handler for specific contract and user.

```typescript
const input = instance.createEncryptedInput(
  '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
  '0x20cdad07152ef163cad9be2cde1766298b883d71'
)
```

#### `add256(value: bigint)`
Add a 256-bit value to encrypt.

```typescript
input.add256(BigInt(5000))
```

#### `encrypt()`
Execute encryption via Relayer.

```typescript
const { handles, inputProof } = await input.encrypt()
// handles: Array<Uint8Array>
// inputProof: Uint8Array(100)
```

**Complete Example:**
```typescript
const encrypted = await instance
  .createEncryptedInput(contractAddr, userAddr)
  .add256(BigInt(5000))
  .encrypt()

console.log(encrypted)
// {
//   handles: [Uint8Array(32)],
//   inputProof: Uint8Array(100)
// }
```

---

## ⚙️ Configuration

### Sepolia Testnet (Default)

```typescript
const config = {
  aclContractAddress: '0x...',
  kmsContractAddress: '0x...',
  inputVerifierContractAddress: '0x...',
  verifyingContractAddressDecryption: '0x...',
  verifyingContractAddressInputVerification: '0x...',
  chainId: 11155111,
  gatewayChainId: 55815,
  network: 'https://sepolia.infura.io/v3/YOUR_KEY',
  relayerUrl: 'https://relayer.testnet.zama.cloud'
}

const instance = await relayerSDK.createInstance(config)
```

### Custom Chain

```typescript
const customConfig = {
  ...SomeChainConfig,
  chainId: 31337,  // Hardhat local
  relayerUrl: 'http://localhost:3000'  // Local relayer
}

const instance = await relayerSDK.createInstance(customConfig)
```

---

## 🐛 Debugging

### Enable Console Logging

```typescript
// React
const { encrypt, loading, error } = useEncryptBid()

// Log each step
console.log('1. Initializing SDK...')
const encrypted = await encrypt(5000)
console.log('2. Encrypted:', encrypted)
console.log('3. Handles:', encrypted.handles.length)
console.log('4. Proof size:', encrypted.inputProof.length)
```

### Check Browser Console

Open DevTools (F12 → Console) to see:
- SDK initialization status
- Encryption progress
- Error messages
- Network requests to Relayer

### Common Issues

| Error | Solution |
|-------|----------|
| "SDK not initialized" | Call `initSDK()` first |
| "Invalid address" | Use checksummed address (0x...) |
| "Encryption timeout" | Network slow - retry |
| "Cannot fetch public key" | Relayer unreachable |

---

## 📊 Performance

| Operation | Time | Notes |
|-----------|------|-------|
| SDK Init | ~200ms | Once per session |
| Encrypt | ~300-500ms | WASM + Relayer |
| Batch (99 bids) | ~30-40s | Parallel possible |

### Optimize for Batch

```typescript
// Encrypt all at once (parallel)
const encrypted = await Promise.all(
  bids.map(bid => encrypt(bid))
)
// ~40 seconds total (not 99 × 500ms)
```

---

## 🚀 Deployment

### Frontend (React/Vue/Vanilla)

1. Build: `pnpm build`
2. Deploy to Vercel, Netlify, or GitHub Pages
3. Set environment variables if needed
4. Test encryption in production

### Backend (Node.js)

```bash
# Build
pnpm build

# Deploy to AWS Lambda, Google Cloud, Heroku, etc.
pnpm start

# Or containerize
docker build -t fhevm-processor .
docker run -e RELAYER_URL=... fhevm-processor
```

---

## 📚 Learn More

| Topic | Link |
|-------|------|
| Full API Docs | [API_REFERENCE.md](./packages/fhevm-sdk/API_REFERENCE.md) |
| Architecture | [ARCHITECTURE.md](./packages/fhevm-sdk/ARCHITECTURE.md) |
| Test Steps | [TEST_STEPS.md](./TEST_STEPS.md) |
| Real FHEVM Flow | [SIMULATE_REAL_FHEVM.md](./SIMULATE_REAL_FHEVM.md) |
| Zama Docs | https://docs.zama.ai/ |

---

## ✅ Verification Checklist

- [ ] SDK initialized at app startup
- [ ] Contract addresses are valid (0x...)
- [ ] User address is correct
- [ ] Bids within valid range [1, 10000]
- [ ] Error handling added
- [ ] Loading states shown to user
- [ ] Console logs verified
- [ ] Works on Sepolia testnet
- [ ] All 4 framework examples tested
- [ ] Ready for deployment ✨

---

## 🎉 Next Steps

1. **Choose a framework** above
2. **Copy the template code**
3. **Set your contract address & user address**
4. **Test encryption locally**
5. **Deploy to testnet**
6. **Submit transaction**

**That's it!** You're now using real FHEVM encryption. 🔐✨

---

**Questions?** Check [API_REFERENCE.md](./packages/fhevm-sdk/API_REFERENCE.md#troubleshooting) for troubleshooting.

**Found a bug?** Create an issue on [GitHub](https://github.com/dharmanan/fhevm-react-template/issues).

---

**Happy encrypting!** 🚀
