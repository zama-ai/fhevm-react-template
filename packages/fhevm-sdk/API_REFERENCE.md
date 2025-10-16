# FHEVM SDK - API Reference

Complete API documentation for the universal FHEVM SDK.

## Table of Contents

1. [Core API](#core-api)
2. [React Hooks](#react-hooks)
3. [TypeScript Types](#typescript-types)
4. [Examples](#examples)
5. [Error Handling](#error-handling)

---

## Core API

### Initialization

#### `initSDK(): Promise<void>`

Initialize the FHEVM SDK with WebAssembly support.

**Usage:**
```typescript
import { initSDK } from 'fhevm-sdk/core'

await initSDK()
console.log('✅ SDK ready')
```

**Parameters:** None

**Returns:** Promise that resolves when initialization complete

**Throws:** Error if SDK loading fails

---

### Encryption

#### `createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInput`

Create an encrypted input instance for a specific contract and user.

**Usage:**
```typescript
const encryptedInput = instance.createEncryptedInput(
  '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
  '0x20cdad07152ef163cad9be2cde1766298b883d71'
)
```

**Parameters:**
- `contractAddress` (string): Target contract address (EVM checksum format)
- `userAddress` (string): User's Ethereum address

**Returns:** EncryptedInput instance

**Throws:** Error if addresses are invalid

---

#### `EncryptedInput.add256(value: bigint): EncryptedInput`

Add a 256-bit unsigned integer to the encrypted input.

**Usage:**
```typescript
const input = encryptedInput.add256(BigInt(5000))
```

**Parameters:**
- `value` (bigint): Value to encrypt (0 to 2^256-1)

**Returns:** Self (chainable)

---

#### `EncryptedInput.encrypt(): Promise<EncryptedBid>`

Perform the actual encryption using the Relayer service.

**Usage:**
```typescript
const encrypted = await encryptedInput.add256(BigInt(5000)).encrypt()
console.log(encrypted.handles)
console.log(encrypted.inputProof)
```

**Parameters:** None

**Returns:** Promise with encrypted data:
```typescript
{
  handles: Array<Uint8Array>,      // FHE handles
  inputProof: Uint8Array           // ZK proof (100 bytes)
}
```

**Throws:** Error if encryption service fails

---

### Contract Interaction

#### `submitEncryptedBid(config: SubmitConfig): Promise<string>`

Submit an encrypted bid to the smart contract.

**Usage:**
```typescript
import { submitEncryptedBid } from 'fhevm-sdk/core'

const txHash = await submitEncryptedBid({
  contractAddress: '0x...',
  abi: MockAuctionABI,
  encryptedBid: encrypted,
  entryFee: 0.0001,
  signer: ethersProvider.getSigner()
})

console.log('Transaction:', txHash)
```

**Parameters:**
```typescript
interface SubmitConfig {
  contractAddress: string      // Contract address
  abi: any[]                   // Contract ABI
  encryptedBid: EncryptedBid   // Encrypted data
  entryFee: number             // Entry fee in ETH
  signer: ethers.Signer        // Signer for transaction
}
```

**Returns:** Transaction hash (string)

**Throws:** Error if submission fails

---

## React Hooks

### `useEncryptBid()`

React hook for encrypting bid values using FHEVM SDK.

**Usage:**
```typescript
import { useEncryptBid } from 'fhevm-sdk/react'

function MyComponent() {
  const { encrypt, loading, error } = useEncryptBid()
  
  const handleEncrypt = async () => {
    try {
      const encrypted = await encrypt(5000)
      console.log('Encrypted:', encrypted)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <>
      <button onClick={handleEncrypt} disabled={loading}>
        {loading ? 'Encrypting...' : 'Encrypt Bid'}
      </button>
      {error && <div>Error: {error}</div>}
    </>
  )
}
```

**Returns:**
```typescript
{
  encrypt: (value: number) => Promise<EncryptedBid>,
  loading: boolean,
  error: string | null
}
```

---

### `useSubmitEncryptedBid(config: SubmitConfig)`

React hook for submitting encrypted bids to contract.

**Usage:**
```typescript
import { useSubmitEncryptedBid } from 'fhevm-sdk/react'

function BidForm() {
  const { submit, loading, error } = useSubmitEncryptedBid({
    contractAddress: '0x...',
    abi: ABI,
    entryFee: 0.0001,
    signer: userSigner
  })

  const handleSubmit = async (encrypted) => {
    const txHash = await submit(encrypted)
    console.log('Submitted:', txHash)
  }

  return (
    <button onClick={() => handleSubmit(encrypted)} disabled={loading}>
      {loading ? 'Submitting...' : 'Submit Bid'}
    </button>
  )
}
```

**Returns:**
```typescript
{
  submit: (encryptedBid: EncryptedBid) => Promise<string>,
  loading: boolean,
  error: string | null
}
```

---

### `useFHEVMRelayer()`

React hook for SDK initialization and relayer management.

**Usage:**
```typescript
import { useFHEVMRelayer } from 'fhevm-sdk/react'

function App() {
  const { sdk, loading, error } = useFHEVMRelayer()

  if (loading) return <div>Loading SDK...</div>
  if (error) return <div>Error: {error}</div>
  if (!sdk) return <div>SDK not available</div>

  return <YourApp sdk={sdk} />
}
```

**Returns:**
```typescript
{
  sdk: FhevmSDK | null,
  loading: boolean,
  error: string | null
}
```

---

## TypeScript Types

### `EncryptedBid`

```typescript
interface EncryptedBid {
  handles: Array<Uint8Array>    // FHE handles (typically 1 per value)
  inputProof: Uint8Array        // Zero-knowledge proof (100 bytes)
}
```

---

### `FhevmInstanceConfig`

```typescript
interface FhevmInstanceConfig {
  aclContractAddress: string
  kmsContractAddress: string
  inputVerifierContractAddress: string
  verifyingContractAddressDecryption: string
  verifyingContractAddressInputVerification: string
  chainId: number
  gatewayChainId: number
  network: string               // RPC URL
  relayerUrl: string
}
```

---

## Examples

### Complete Flow

```typescript
import { useEncryptBid } from 'fhevm-sdk/react'
import { useSubmitEncryptedBid } from 'fhevm-sdk/react'

function AuctionBid() {
  const [bid, setBid] = useState('')
  
  // Encryption
  const { encrypt, loading: encLoading } = useEncryptBid()
  
  // Submission
  const { submit, loading: submitLoading } = useSubmitEncryptedBid({
    contractAddress: '0x...',
    abi: ABI,
    entryFee: 0.0001,
    signer: signer
  })

  const handleSubmitBid = async () => {
    // 1. Encrypt
    const encrypted = await encrypt(Number(bid))
    
    // 2. Submit
    const txHash = await submit(encrypted)
    
    // 3. Confirm
    console.log('Bid submitted:', txHash)
  }

  return (
    <div>
      <input
        type="number"
        value={bid}
        onChange={(e) => setBid(e.target.value)}
        placeholder="Bid amount"
      />
      <button
        onClick={handleSubmitBid}
        disabled={encLoading || submitLoading}
      >
        {encLoading || submitLoading ? 'Processing...' : 'Submit Bid'}
      </button>
    </div>
  )
}
```

---

### Vue Integration

```typescript
import { ref, onMounted } from 'vue'

export function useVueEncryption() {
  const encrypted = ref(null)
  const loading = ref(false)

  const encrypt = async (value) => {
    loading.value = true
    try {
      const instance = await window.relayerSDK.createInstance(config)
      encrypted.value = await instance
        .createEncryptedInput(contractAddr, userAddr)
        .add256(BigInt(value))
        .encrypt()
    } finally {
      loading.value = false
    }
  }

  return { encrypt, encrypted, loading }
}
```

---

### Node.js Usage

```typescript
import { initSDK } from 'fhevm-sdk/core'
import { ethers } from 'ethers'

async function preprocessBids(bids: number[]) {
  // Note: Node.js WASM encryption requires additional setup
  // This is primarily for data preparation
  
  const prepared = bids.map(bid => ({
    original: bid,
    timestamp: Date.now(),
    hash: ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['uint256'], [bid])
    )
  }))

  return prepared
}
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| SDK not initialized | Missing `initSDK()` | Call init before use |
| Invalid address | Wrong format | Use checksummed address |
| Encryption timeout | Network slow | Retry with timeout |
| Contract error | ABI mismatch | Verify contract interface |

### Try-Catch Pattern

```typescript
try {
  const encrypted = await encrypt(bidValue)
  await submit(encrypted)
} catch (err) {
  if (err.message.includes('SDK')) {
    // SDK initialization error
  } else if (err.message.includes('address')) {
    // Address validation error
  } else {
    // Generic error
  }
}
```

---

## Best Practices

1. **Initialize Once** - Call `initSDK()` once at app startup
2. **Validate Input** - Check bid values before encryption
3. **Handle Errors** - Always have try-catch around async calls
4. **Show Loading** - Display loading state during encryption/submission
5. **Secure Keys** - Never expose private keys in frontend code
6. **Type Safety** - Use TypeScript for better DX

---

## Performance

| Operation | Time | Notes |
|-----------|------|-------|
| SDK Init | ~200ms | First time only |
| Encryption | ~300-500ms | WASM computation |
| Relayer Call | ~100-200ms | Network latency |
| Contract Submit | ~30s | Block confirmation |

---

## Troubleshooting

**Q: SDK loading fails**
- A: Check CDN link and internet connection

**Q: Encryption is slow**
- A: Normal for WASM; cache results when possible

**Q: Contract submit fails**
- A: Verify ABI matches contract interface

**Q: Address validation error**
- A: Use checksummed addresses (ethers.utils.getAddress())

---

## Related Resources

- [FHEVM Documentation](https://docs.zama.ai/)
- [Zama SDK GitHub](https://github.com/zama-ai/fhevm)
- [Ethereum Address Format](https://ethereum.org/en/developers/docs/data-structures-and-encoding/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)

---

**Last Updated:** October 2025

**API Version:** 0.1.0

**Maintainer:** Zama Developer Community
