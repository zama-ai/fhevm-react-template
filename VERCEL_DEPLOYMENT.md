# Vercel Deployment Guide - WinnerPrice

## Ön Koşullar

1. **Vercel Account**: [vercel.com](https://vercel.com) - GitHub bağlantılı
2. **Smart Contract Deploy**: Sepolia'ya MockAuction.sol deploy et
3. **Environment Variables**

## Adımlar

### 1. Repository'i GitHub'a Push Et
```bash
git add .
git commit -m "✨ Add WinnerPrice - Zama FHE Secret Auction Demo"
git push origin main
```

### 2. Vercel'e Connect Et
- [vercel.com](https://vercel.com) → "New Project"
- GitHub repo seç: `fhevm-react-template`
- Framework: "Other" (monorepo)
- Root Directory: `examples/nextjs-app`

### 3. Environment Variables Ekle
Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_AUCTION_CONTRACT=0x... (Sepolia'da deploy edilen contract adresi)
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 4. Deploy Et
```bash
vercel deploy --prod
```

## Kullanıcı Talimatları

Uygulama açılınca:

1. **MetaMask Kur**: Chrome extension
2. **Sepolia Testnet'e Switch Et**: 
   - MetaMask → Networks → Add Network → Sepolia
3. **Test ETH Al**: 
   - [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
4. **Cüzdanı Bağla**: "Connect Wallet" butonuna tıkla
5. **Bid Ver**: Ürün seç → Miktar gir → Submit

## Teknik Notlar

### FHE Şifrelemesi
- **Demo**: Mock encryption (hızlı test için)
- **Production**: Zama Relayer SDK (gerçek FHE)
  - Relayer CDN: `https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs`
  - Her bid ~1 saniye sürüyor (real encryption)

### Blockchain İşlemleri
- **Network**: Ethereum Sepolia Testnet
- **ChainID**: 11155111
- **Entry Fee**: 0.001 ETH (mock, real tx yapılmıyor)

### Limitations (Demo)
- ✓ Şifrelemeler gerçek FHEVM ile
- ⚠ Bid submission blockchain'e yazılmıyor (mock)
- ⚠ Winner reveal blockchain'de doğrulanmıyor (mock)
- ✓ UI/UX production-ready

## Sonraki Adımlar

1. **Smart Contract**: Full implement et (Hardhat)
2. **Backend**: Relayer integration
3. **Database**: Bid tracking
4. **Tests**: E2E testler

---

**Şu an**: Demo olarak çalışır, UI ve FHE encryption gerçek ✅
**Eksik**: On-chain state management (gelecek faz)
