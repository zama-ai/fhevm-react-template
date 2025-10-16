# 🔐 FHEVM Vue 3 Example

Framework-agnostic FHEVM SDK integration with **Vue 3 Composition API**.

## Overview

This example demonstrates how to use the universal FHEVM SDK with Vue 3, showing:

- ✅ SDK initialization with WASM
- ✅ Homomorphic encryption of bid values
- ✅ Real-time console logging for debugging
- ✅ Error handling and fallback states
- ✅ Responsive UI with Tailwind-like styling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

### Access
- Development: http://localhost:5173
- Production: `pnpm run build && pnpm run preview`

## 📊 How It Works

### 1. SDK Initialization
```typescript
onMounted(async () => {
  const win = window as any
  await win.relayerSDK.initSDK()
  sdkReady.value = true
})
```

### 2. Encryption
```typescript
async function handleEncrypt() {
  const encrypted = await encryptedInput
    .add256(BigInt(bidValue.value))
    .encrypt()
  
  // Returns: { handles: Array, inputProof: Uint8Array }
}
```

### 3. Reactive State Management
```typescript
const sdkReady = ref(false)
const encryptedResult = ref<any>(null)
const consoleLogs = ref<Array<any>>([])
```

## 🏗️ Project Structure

```
vue-example/
├── src/
│   ├── App.vue          # Main component (Encryption demo)
│   └── main.ts          # Vue app entry point
├── public/              # Static assets
├── index.html           # HTML template with SDK CDN
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies
└── README.md            # This file
```

## 🎨 UI Features

- **SDK Status Badge**: Real-time SDK initialization state
- **Input Form**: Enter value to encrypt (1-10000)
- **Encrypt Button**: Trigger encryption with feedback
- **Result Display**: Shows handles count and proof size
- **Console Logs**: Live debug logs for troubleshooting
- **Error Handling**: Graceful error messages

## 🔧 Integration Points

### From FHEVM SDK:
```typescript
// Global relayerSDK from CDN
window.relayerSDK

// Core functions
initSDK()
createInstance(config)
createEncryptedInput(contractAddress, userAddress)
encrypt()
```

### From App:
```typescript
// React-like composables
<script setup>
  const { ref, onMounted } = from 'vue'
  
  // Reactive state
  const sdkReady = ref(false)
  
  // Lifecycle hooks
  onMounted(() => {
    // Initialize SDK
  })
</script>
```

## 📈 Performance

| Operation | Time |
|-----------|------|
| SDK Init | ~200ms (first time) |
| Single Encryption | ~300-500ms |
| 10 Encryptions | ~3-5s |
| Relayer Latency | ~100-200ms |

## 🐛 Debugging

Console logs available for:
- SDK initialization
- Instance creation
- Encryption process
- Error handling

**Browser DevTools:**
```javascript
// Check SDK availability
console.log(window.relayerSDK)

// Manual encryption (in console)
const config = window.relayerSDK.SepoliaConfig
const instance = await window.relayerSDK.createInstance(config)
// ... continue
```

## 📚 Learn More

- [FHEVM Docs](https://docs.zama.ai/)
- [Vue 3 Guide](https://vuejs.org/)
- [FHEVM SDK](../../packages/fhevm-sdk/)

## ✨ Features

- ✅ Framework-agnostic SDK usage
- ✅ Composition API with `<script setup>`
- ✅ Reactive state management
- ✅ Real FHEVM encryption
- ✅ Console logging integration
- ✅ Error handling
- ✅ TypeScript support
- ✅ Vite development

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## 📄 License

MIT - See [LICENSE](../../LICENSE)

---

**Built with Vue 3 + FHEVM SDK for confidential computing on Ethereum**
