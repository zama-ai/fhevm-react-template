# Vercel Deployment Guide - WinnerPrice

## Prerequisites

1. **Vercel Account**: [vercel.com](https://vercel.com) - connected to GitHub
2. **Smart Contract Deployed**: Deploy MockAuction.sol to Sepolia
3. **Environment Variables**

## Steps

### 1. Push Repository to GitHub
```bash
git add .
git commit -m "✨ Add WinnerPrice - Zama FHE Secret Auction Demo"
git push origin main
```

### 2. Connect to Vercel
- [vercel.com](https://vercel.com) → "New Project"
- Select GitHub repo: `fhevm-react-template`
- Framework: "Other" (monorepo)
- Root Directory: `examples/nextjs-app`

### 3. Add Environment Variables
Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_AUCTION_CONTRACT=0x... (Deployed contract address on Sepolia)
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 4. Deploy
```bash
vercel deploy --prod
```

## User Instructions

When the app opens:

1. **Install MetaMask**: Chrome extension
2. **Switch to Sepolia Testnet**: 
   - MetaMask → Networks → Add Network → Sepolia
3. **Get Test ETH**: 
   - [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
4. **Connect Wallet**: Click "Connect Wallet" button
5. **Place Bid**: Select product → Enter amount → Submit

## Technical Notes

### FHE Encryption
- **Demo**: Mock encryption (fast testing)
- **Production**: Zama Relayer SDK (real FHE)
  - Relayer CDN: `https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs`
  - Each bid ~1 second (real encryption)

### Blockchain Transactions
- **Network**: Ethereum Sepolia Testnet
- **ChainID**: 11155111
- **Entry Fee**: 0.001 ETH (mock, no real tx)

### Limitations (Demo)
- ✓ Encryptions use real FHEVM
- ⚠ Bid submission not written to blockchain (mock)
- ⚠ Winner reveal not verified on-chain (mock)
- ✓ UI/UX production-ready

## Next Steps

1. **Smart Contract**: Full implementation (Hardhat)
2. **Backend**: Relayer integration
3. **Database**: Bid tracking
4. **Tests**: E2E testing

---

**Current**: Works as demo, UI and FHE encryption are real ✅
**Missing**: On-chain state management (future phase)
