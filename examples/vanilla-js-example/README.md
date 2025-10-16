# 🔓 FHEVM Vanilla JavaScript Example

**Zero dependencies.** Pure JavaScript + FHEVM SDK. No frameworks, no build tools, no complexity.

## Overview

This example shows the absolute simplest way to use FHEVM:

- ✅ Single HTML file
- ✅ No build process
- ✅ No package manager
- ✅ No framework overhead
- ✅ Real FHEVM encryption
- ✅ Works anywhere (even offline with SDK cached)

## 🚀 Quick Start

### Option 1: Open Locally

```bash
# Just open the file
open index.html

# Or use Python's simple server
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Option 2: Deploy to GitHub Pages

```bash
# Copy index.html to your repo
# Push to main branch
# Enable GitHub Pages
# Done! 🎉
```

## 📊 What It Does

1. **Loads SDK** from CDN (2 lines of code)
2. **Initializes WASM** (1 line)
3. **Encrypts values** on button click (5 lines)
4. **Displays results** with live logging

Total: ~150 lines of HTML + JavaScript

## 💻 Code Structure

```html
<!-- Load SDK -->
<script src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"></script>

<!-- Initialize -->
<script>
  async function initSDK() {
    await window.relayerSDK.initSDK()
  }
</script>

<!-- Encrypt -->
<button onclick="handleEncrypt()">Encrypt</button>
```

## 🎯 Features

| Feature | Lines | Status |
|---------|-------|--------|
| SDK Loading | 1 | ✅ |
| WASM Init | 1 | ✅ |
| Encryption | 5 | ✅ |
| UI | ~100 | ✅ |
| Logging | 10 | ✅ |
| Error Handling | 10 | ✅ |

## 🔐 How to Encrypt

```javascript
// 1. Get SDK
const sdk = window.relayerSDK

// 2. Initialize (one-time)
await sdk.initSDK()

// 3. Get config
const config = sdk.SepoliaConfig

// 4. Create instance
const instance = await sdk.createInstance(config)

// 5. Encrypt
const input = instance.createEncryptedInput(contractAddr, userAddr)
const encrypted = await input.add256(BigInt(5000)).encrypt()

// Done! encrypted = { handles: [...], inputProof: ... }
```

## 🎨 UI Components

- **Status Badge**: Green when SDK ready, red on error
- **Input Field**: Enter bid value (1-10000)
- **Encrypt Button**: Click to encrypt, shows loading state
- **Result Display**: Shows handles count and proof size
- **Console Logs**: Live debugging with color coding

## 📦 CDN Links

All needed libraries are already loaded from CDN:

```html
<!-- FHEVM SDK -->
<script src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"></script>

<!-- That's it! No other dependencies -->
```

## 🧪 Testing

### In Browser Console

```javascript
// Check SDK
console.log(window.relayerSDK)

// Get config
window.relayerSDK.SepoliaConfig

// Initialize manually
await window.relayerSDK.initSDK()

// Manual encryption
const instance = await window.relayerSDK.createInstance(config)
const encrypted = await instance.createEncryptedInput(addr, user).add256(BigInt(1000)).encrypt()
```

## 🚀 Deploy Examples

### GitHub Pages
```bash
# 1. Create repo
# 2. Push index.html to main branch
# 3. Settings → Pages → Enable
# 4. Access at: https://username.github.io/repo
```

### Netlify
```bash
# 1. Drag & drop folder to Netlify
# 2. Deploy instantly
# 3. Works!
```

### Vercel
```bash
# 1. Connect GitHub repo
# 2. Deploy
# 3. Works!
```

### Any Static Host
- AWS S3
- Google Cloud Storage
- Cloudflare Pages
- Any web server

## 💡 Why Vanilla JS?

**vs React:**
- ✅ No Node.js required
- ✅ No build process
- ✅ Instant load
- ✅ Smaller bundle
- ✅ Works offline

**vs Vue:**
- ✅ Simpler learning curve
- ✅ Zero framework overhead
- ✅ Easier to understand FHEVM
- ✅ Perfect for beginners

**Real use cases:**
- Learning FHEVM
- Quick prototypes
- Static websites
- Embedding in other sites
- CI/CD dashboards

## 🔧 Customization

### Change Bid Range
```javascript
// In input element
min="100"
max="50000"
```

### Change Network
```javascript
// From Sepolia to other networks
const config = window.relayerSDK.EthereumConfig  // or other
```

### Add Custom Styling
```css
/* Modify colors */
--primary-color: #667eea;
--secondary-color: #764ba2;
```

## 📱 Responsive Design

Works on:
- ✅ Desktop (tested)
- ✅ Tablet (responsive grid)
- ✅ Mobile (touches optimized)
- ✅ Any screen size

## ⚡ Performance

| Metric | Value |
|--------|-------|
| Initial Load | ~500ms |
| SDK Init | ~200ms |
| Encryption | ~300-500ms |
| Total First Bid | ~1s |

## 🐛 Troubleshooting

**SDK not loading?**
- Check CDN link in browser DevTools
- Check internet connection
- Check CORS settings

**Encryption fails?**
- Ensure SDK initialized first
- Check contract address format
- Check user address format

**Slow performance?**
- Normal for WASM computation
- First encryption is slowest
- Cached subsequent operations

## 📚 Learn More

- [FHEVM Docs](https://docs.zama.ai/)
- [FHEVM SDK](../../packages/fhevm-sdk/)
- [Vanilla JS Guide](https://javascript.info/)
- [WASM Intro](https://webassembly.org/)

## ✨ Features

- ✅ Zero dependencies
- ✅ Single file
- ✅ Real FHEVM encryption
- ✅ Live logging
- ✅ Error handling
- ✅ Responsive UI
- ✅ Browser DevTools compatible
- ✅ Easy to understand

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## 📄 License

MIT - See [LICENSE](../../LICENSE)

---

**Vanilla JS + FHEVM = Simplest possible confidential computing**

No frameworks. No complexity. Just JavaScript. 🚀
