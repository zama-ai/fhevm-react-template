# FHEVM SDK - Architecture Guide

Understand how the SDK is designed to work across all frameworks.

## Design Philosophy

**Three Principles:**

1. **Framework-Agnostic** - Core logic runs in any environment
2. **Modular** - Use only what you need
3. **Composable** - Mix and match components

---

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│          Application Layer                  │
│  (React | Vue | Node.js | Vanilla JS)      │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│    Framework Adapters (React/Vue hooks)     │
│                                             │
│  ├── useEncryptBid (React)                 │
│  ├── useFHEVMRelayer (React)               │
│  ├── useEncryptBid (Vue composable)        │
│  └── Framework-specific utilities          │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         Core SDK Layer                      │
│                                             │
│  ├── Encryption (createEncryptedInput)     │
│  ├── Decryption (readWinner)               │
│  ├── Contract Submission (submitBid)       │
│  ├── Relayer (HTTP client)                 │
│  └── Config (SepoliaConfig)                │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      FHEVM Relayer SDK (UMD Bundle)        │
│   CDN: https://cdn.zama.ai/relayer-...    │
│                                             │
│  ├── WASM Encryption Engine                │
│  ├── Relayer HTTP Interface                │
│  └── Contract ABI Interactions             │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      External Services                      │
│                                             │
│  ├── Relayer: https://relayer.testnet... │
│  ├── Chain: Sepolia Testnet (11155111)    │
│  └── Web3 Provider (ethers.js)            │
└─────────────────────────────────────────────┘
```

---

## Core Components

### 1. Initialization (`core/contract.ts`)

**Purpose:** Setup and manage SDK lifecycle

```typescript
// Load WASM, initialize relayer connection
await relayerSDK.initSDK()

// Create instance with chain config
const instance = await relayerSDK.createInstance(
  relayerSDK.SepoliaConfig
)
```

**Key Responsibility:**
- Lazy-load WASM (only once per session)
- Establish relayer connection
- Configure chain parameters

---

### 2. Encryption (`core/encrypt.ts`)

**Purpose:** Convert plaintext values to encrypted data

```typescript
// Step 1: Create input handler
const input = instance.createEncryptedInput(
  contractAddress,
  userAddress
)

// Step 2: Add values to encrypt
input.add256(BigInt(bidValue))

// Step 3: Execute encryption
const { handles, inputProof } = await input.encrypt()
```

**Flow:**
1. Receive plaintext value (bid amount)
2. WASM encodes with user's public key
3. Relayer generates zero-knowledge proof
4. Return handles + proof

**Output Format:**
```typescript
{
  handles: [Uint8Array],      // FHE handles for smart contract
  inputProof: Uint8Array      // 100-byte ZK proof
}
```

---

### 3. Contract Submission (`core/contract.ts`)

**Purpose:** Submit encrypted data to blockchain

```typescript
// Convert encrypted object to bytes
const bidBytes = encryptedBidToBytes(encrypted)

// Submit via Web3 transaction
const tx = await contract.submitEncryptedBid(bidBytes)
```

**Conversion Logic:**
```
Input: { handles: [Uint8Array], inputProof: Uint8Array }
       ↓
Convert each Uint8Array to hex string
       ↓
Concatenate: 0x[handles_hex][proof_hex]
       ↓
Output: "0x1a2b3c4d5e6f..." (submitted to contract)
```

---

### 4. Decryption (`core/readWinner.ts`)

**Purpose:** Read and decrypt winner from contract

```typescript
// Contract stores encrypted winner
const encryptedWinner = await contract.getWinner()

// Decrypt using relayer
const winner = await readWinner(encryptedWinner)
```

---

### 5. Relayer Integration (`core/relayer.ts`)

**Purpose:** HTTP communication with Zama's relayer

```typescript
// Relayer manages:
// ├── Public key generation
// ├── Encryption requests
// ├── Proof generation
// └── Decryption requests

const response = await relayer.encrypt({
  contractAddress: '0x...',
  handles: [...],
  value: 5000
})
```

---

## Framework Adapters

### React Hooks Pattern

```typescript
// File: packages/fhevm-sdk/react/useEncryptBid.ts

export function useEncryptBid() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const encrypt = useCallback(async (value: number) => {
    setLoading(true)
    try {
      // Call core SDK
      const result = await encryptCore(value)
      return result
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { encrypt, loading, error }
}
```

**Pattern Advantage:**
- UI automatically updates on state change
- Error handling built-in
- Cleanup on unmount

### Vue Composition API Pattern

```typescript
// File: examples/vue-example/src/App.vue

import { ref, computed } from 'vue'

export function useVueEncryption() {
  const encrypted = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const encrypt = async (value: number) => {
    loading.value = true
    try {
      encrypted.value = await window.relayerSDK
        .createInstance(config)
        .createEncryptedInput(contractAddr, userAddr)
        .add256(BigInt(value))
        .encrypt()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return { encrypt, encrypted, loading, error }
}
```

**Pattern Advantage:**
- Similar to React hooks
- Reactive data binding
- Better TypeScript support

### Node.js Pattern

```typescript
// File: examples/node-example/src/batch-encrypt.ts

// Process bids without UI
const encrypted = await Promise.all(
  bids.map(bid => encrypt(bid))
)

// Validate results
const valid = encrypted.filter(
  e => e.handles && e.inputProof
)

// Output formatted table
console.table(valid)
```

**Pattern Advantage:**
- No UI overhead
- Parallel processing
- Batch validation

---

## Data Flow Diagram

### Encryption Pipeline

```
User Input (5000)
    ↓
Validate [1, 10000]
    ↓
SDK.initSDK() [Once]
    ↓
createEncryptedInput(contractAddr, userAddr)
    ↓
add256(BigInt(5000))
    ↓
encrypt() [WASM + Relayer]
    ↓
WASM Engine:
  ├── Encode with pubKey
  ├── Create FHE handles
  └── Return to Relayer
    ↓
Relayer:
  ├── Generate ZK proof
  ├── Verify encryption
  └── Return proof
    ↓
{ handles: [Uint8Array], inputProof: Uint8Array(100) }
    ↓
Convert to Bytes: 0x[hex_string]
    ↓
submitEncryptedBid(bytes) [Web3]
    ↓
Transaction Submitted ✅
```

---

## State Management

### Initialization State

```typescript
// Global state (per app instance)
{
  sdkInitialized: false,
  wasm: null,
  config: SepoliaConfig,
  relayerUrl: 'https://relayer.testnet.zama.cloud'
}
```

### Per-Operation State

```typescript
// Component/Hook state
{
  loading: false,           // Encryption in progress
  error: null,              // Error message
  encrypted: null,          // Result
  submitted: false          // Submitted to contract
}
```

---

## Security Considerations

### Public Key Management

```
1. User's address → Derived public key (on-chain)
   ↓
2. Relayer maintains public key registry
   ↓
3. WASM uses public key for encryption
   ↓
4. Only contract + relayer can decrypt
```

### Input Validation

```typescript
// All inputs validated before encryption
{
  bidValue: [1, 10000],                    // Range check
  contractAddress: /^0x[a-f0-9]{40}$/i,   // Format check
  userAddress: /^0x[a-f0-9]{40}$/i,       // Format check
  relayerUrl: 'https://...'                // HTTPS only
}
```

### WASM Isolation

```
User Data (bid amount)
    ↓
[WASM Sandbox]
  ├── Encrypted immediately
  ├── Never stored plaintext
  ├── No console logs
  └── Results only returned
    ↓
{ handles, inputProof }
```

---

## Performance Optimization

### Caching Strategy

```typescript
// Expensive: SDK Initialization (200ms)
const sdkCache = new Map()
if (!sdkCache.has('instance')) {
  sdkCache.set('instance', await createInstance())
}

// Cheap: Encryption (300-500ms per value)
// → Process in parallel for batch operations
const results = await Promise.all(
  bids.map(bid => encrypt(bid))
)
```

### Lazy Loading

```typescript
// WASM loaded only on first encrypt() call
// Subsequent calls reuse same WASM instance
// Reduces bundle size in production

// Pseudo-code:
if (!wasmInitialized) {
  await fetchAndInitWasm()  // 200ms
  wasmInitialized = true
}

// All subsequent encryptions use cached WASM
```

---

## Error Recovery

### Retry Strategy

```typescript
async function encryptWithRetry(
  value: number,
  maxRetries = 3
): Promise<EncryptedBid> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await encrypt(value)
    } catch (err) {
      if (i === maxRetries - 1) throw err
      await sleep(200 * Math.pow(2, i))  // Exponential backoff
    }
  }
}
```

### Fallback Patterns

```typescript
// Development fallback (mock encryption)
let encrypted = null
try {
  encrypted = await realEncrypt(bid)
} catch (err) {
  console.warn('Using mock encryption:', err)
  encrypted = mockEncrypt(bid)
}
```

---

## Extension Points

### Add Custom Chain

```typescript
// Extend SepoliaConfig
const CustomConfig = {
  ...SepoliaConfig,
  chainId: 12345,
  network: 'https://my-rpc.com',
  aclContractAddress: '0x...'
}

const instance = await createInstance(CustomConfig)
```

### Add Custom Hook

```typescript
// Create React hook wrapper
export function useCustomEncryption(config: Config) {
  const { encrypt } = useEncryptBid()
  const [customState, setCustomState] = useState()

  return { encrypt, customState }
}
```

---

## Comparison: Before/After Architecture

### Before (Tightly Coupled)

```
React App
  ↓
Hardcoded FHEVM SDK import
  ↓
Direct window.relayerSDK access
  ↓
Encryption logic scattered in components
  ↓
Cannot reuse in Node.js or Vue
```

### After (Decoupled & Modular)

```
┌─ React App ──┐   ┌─ Vue App ──┐   ┌─ Node App ──┐
│ useEncryptBid│   │ Composable │   │ Direct call │
└──────┬────────┘   └──────┬─────┘   └──────┬──────┘
       │                   │                │
       └───────────┬───────┴────────────────┘
                   │
         ┌─────────▼─────────┐
         │   Core SDK        │
         │  (Framework-free) │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │ Relayer SDK (UMD) │
         │  (Any JS env)     │
         └───────────────────┘
```

---

## Testing Strategy

### Unit Tests (Core Layer)

```typescript
// Test encryption/decryption logic
test('encrypt should return valid structure', async () => {
  const result = await encrypt(5000)
  expect(result.handles).toHaveLength(1)
  expect(result.inputProof).toHaveLength(100)
})
```

### Integration Tests (Framework Layer)

```typescript
// Test React hook
test('useEncryptBid hook should load data', async () => {
  const { result } = renderHook(() => useEncryptBid())
  await act(async () => {
    await result.current.encrypt(5000)
  })
  expect(result.current.loading).toBe(false)
})
```

### E2E Tests (Full Flow)

```typescript
// Test complete encryption → submission
test('should encrypt bid and submit to contract', async () => {
  const encrypted = await encrypt(5000)
  const tx = await submit(encrypted)
  expect(tx).toMatch(/^0x[a-f0-9]{64}$/)  // Valid tx hash
})
```

---

## Migration Path

### From Mock Encryption

```typescript
// Step 1: Install SDK
npm install fhevm-sdk

// Step 2: Replace mock functions
- import { mockEncrypt } from './mock'
+ import { useEncryptBid } from 'fhevm-sdk/react'

// Step 3: Use real hook
- const encrypted = mockEncrypt(bid)
+ const { encrypt } = useEncryptBid()
+ const encrypted = await encrypt(bid)

// Result: Real FHEVM encryption ✅
```

---

## Deployment Checklist

- [ ] SDK initialized at app startup
- [ ] Error handling added for all encrypt calls
- [ ] Loading states displayed to user
- [ ] Contract addresses verified
- [ ] Chain ID matches testnet (11155111)
- [ ] Relayer URL accessible (https://relayer.testnet.zama.cloud)
- [ ] WASM bundle cached (set Cache-Control headers)
- [ ] TypeScript strict mode enabled
- [ ] All bids validated before encryption

---

**Next:** See [API_REFERENCE.md](./API_REFERENCE.md) for detailed function documentation.

**Questions?** Check [troubleshooting](./API_REFERENCE.md#troubleshooting) section.
