# FHEVM Simulate - Real Encryption Implementation

## 🎯 Goal
Simulate a multi-bid auction where participants make random price predictions and submit encrypted bids using **real FHEVM encryption**.

## 📋 Current Status

### ✅ What's Working:
- `userActions` → bid submit → encrypt → send to contract ✅
- Bid encryption: `useEncryptBid` hook ✅
- Contract submission: `useSubmitEncryptedBid` hook ✅

### ❌ What's Missing:
- `simulateFullAuction` only uses mock encryption
- Participants don't use real FHEVM encryption
- No real requests sent to Relayer

## 🔧 Real Implementation

### Option 1: Create Separate Simulate Hook (Recommended)

```typescript
// hooks/useSimulateAuctionBids.ts

import { useCallback } from 'react';
import { useEncryptBid } from '../../../packages/fhevm-sdk/react/useEncryptBid';
import { useSubmitEncryptedBid } from '../../../packages/fhevm-sdk/react/useSubmitEncryptedBid';
import { ethers } from 'ethers';

export function useSimulateAuctionBids({
  contractAddress,
  abi,
  signer
}: {
  contractAddress: string;
  abi: any;
  signer: ethers.Signer;
}) {
  const { encrypt } = useEncryptBid();
  const { submit } = useSubmitEncryptedBid({ contractAddress, abi, entryFee: 0.0001, signer });

  const simulateNBids = useCallback(async (count: number, targetPrice: number) => {
    console.log(`[SIMULATE] Starting to simulate ${count} real FHEVM bids...`);
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // 1. Random bid value around target price
        const randomBidValue = Math.floor(
          targetPrice - 2000 + Math.random() * 4000
        );
        const finalBidValue = Math.max(100, Math.min(randomBidValue, 10000));

        console.log(`[SIMULATE] Bid ${i + 1}/${count}: $${finalBidValue}`);

        // 2. ✅ GERÇEK FHEVM ŞİFRELEMESİ
        const encryptedBid = await encrypt(finalBidValue);
        console.log(`[SIMULATE] ✅ Bid encrypted`);

        // 3. ✅ GERÇEK CONTRACT SUBMIT
        const txHash = await submit(encryptedBid);
        console.log(`[SIMULATE] ✅ Submitted to contract: ${txHash}`);

        results.push({
          bidIndex: i + 1,
          bidValue: finalBidValue,
          encrypted: encryptedBid,
          txHash: txHash,
          status: 'success'
        });

      } catch (err) {
        console.error(`[SIMULATE] ❌ Error on bid ${i + 1}:`, err);
        results.push({
          bidIndex: i + 1,
          status: 'error',
          error: (err as Error).message
        });
      }

      // Small delay between submissions
      await new Promise(res => setTimeout(res, 500));
    }

    console.log(`[SIMULATE] ✅ Simulation complete! ${results.length} bids processed`);
    return results;
  }, [encrypt, submit]);

  return { simulateNBids };
}
```

### Option 2: useAuction Hook'unu Güncelle (Basit Yol)

```typescript
// examples/nextjs-app/hooks/useAuction.ts

export const useAuction = (product: Product | null) => {
  // ... existing code ...
  
  // ✅ REAL FHEVM SDK'sını import et
  const { encrypt } = useEncryptBid(); // Real SDK hook!
  const { submit } = useSubmitEncryptedBid({...}); // Real submit!

  const simulateFullAuction = useCallback(async () => {
    if (!product) return;
    setIsLoading(true);

    const bidsToSimulate = MAX_PARTICIPANTS - participants.length;
    if (bidsToSimulate <= 0) {
      setAuctionState(AuctionState.ENDED);
      setIsLoading(false);
      return;
    }

    console.log(`[SIMULATE] Starting ${bidsToSimulate} real FHEVM bids...`);

    const simulatedBids: Bid[] = [];
    
    for (let i = 0; i < bidsToSimulate; i++) {
      try {
        const randomBidValue = Math.floor(
          product.targetPrice - 2000 + Math.random() * 4000
        );
        const finalBidValue = Math.max(MIN_BID, Math.min(randomBidValue, MAX_BID));

        console.log(`[SIMULATE] Bid ${i + 1}: $${finalBidValue}`);

        // ✅ REAL FHEVM ENCRYPTION
        const encryptedBid = await encrypt(finalBidValue);

        // ✅ OPTIONAL: REAL CONTRACT SUBMIT
        try {
          const txHash = await submit(encryptedBid);
          console.log(`[SIMULATE] ✅ On-chain: ${txHash}`);
        } catch (submitErr) {
          console.log(`[SIMULATE] ⚠️ Submit skipped (optional for demo)`);
        }

        simulatedBids.push({
          address: `0x${Math.random().toString(16).slice(2, 12)}...sim${i}`,
          encryptedBid,
          originalBid: finalBidValue,
        });

      } catch (err) {
        console.error(`[SIMULATE] ❌ Bid ${i + 1} error:`, err);
      }

      await new Promise(res => setTimeout(res, 300));
    }

    setParticipants(prev => [...prev, ...simulatedBids]);
    setAuctionState(AuctionState.ENDED);
    setTimeLeft(0);
    setIsLoading(false);

    console.log(`[SIMULATE] ✅ Complete! ${simulatedBids.length} encrypted bids`);
  }, [participants.length, encrypt, submit, product]);

  return { /* ... */ simulateFullAuction };
};
```

## 🔐 Key Points

### Real vs Mock Encryption:

**Mock (Mevcut):**
```typescript
// ❌ Sadece string, gerçek şifreleme yok
encrypt: (value) => `0x_mock_${value}`
```

**Real (Gerekli):**
```typescript
// ✅ Relayer'ı kullanıyor, WASM ile şifreliyor
const encryptedBid = await encrypt(value);
// Returns: { handles: Array(1), inputProof: Uint8Array(100) }
```

### Smart Contract Integration:

**Simulate sadece UI'da:**
```typescript
// ⚠️ Contract'a göndermiyor
simulatedBids.push({ encrypted... })
```

**Simulate + On-Chain:**
```typescript
// ✅ Contract'a gerçekten gönder
const txHash = await submit(encryptedBid);
await tx.wait();
```

## 📝 Yapılması Gereken (Step by Step)

### Adım 1: Import Gerçek Hooks
```typescript
// useAuction.ts içinde
import { useEncryptBid } from '../../../packages/fhevm-sdk/react/useEncryptBid';
import { useSubmitEncryptedBid } from '../../../packages/fhevm-sdk/react/useSubmitEncryptedBid';
```

### Adım 2: Mock Encrypt'i Replace Et
```typescript
// REMOVE:
const { encrypt } = useEncrypt(); // ❌ Mock

// ADD:
const { encrypt } = useEncryptBid(); // ✅ Real
const { submit } = useSubmitEncryptedBid({...}); // ✅ Real
```

### Adım 3: Signer & Contract Props Ekle
```typescript
export const useAuction = (
  product: Product | null,
  signer?: ethers.Signer,  // ← Ekle
  contractAddress?: string, // ← Ekle
  abi?: any                 // ← Ekle
) => {
  // Use them in useSubmitEncryptedBid
}
```

### Adım 4: simulateFullAuction'da Real Encrypt Çağır
```typescript
const encryptedBid = await encrypt(finalBidValue); // Real!
```

## 🎬 Test Flow

1. Open browser console (F12)
2. Click "Join Auction" button
3. Enter a bid (e.g., 4444)
4. Click "Submit My Encrypted Bid"
5. Monitor console for encryption success
6. Click "Simulate Remaining Bids"
7. Monitor console for 9 simulated bid encryption logs:
   ```
   [SIMULATE] Starting 9 real FHEVM simulated bids...
   [SIMULATE] Bid 1: $5500
   [SIMULATE] ✅ Bid encrypted
   [SIMULATE] Bid 2: $4200
   [SIMULATE] ✅ Bid encrypted
   ...
   [SIMULATE] ✅ Complete! 10 total encrypted bids (1 manual + 9 simulated)
   ```

## ✅ Required for Zama Bounty

**CRITICAL:** Simulate function must:
- [ ] Use real FHEVM SDK
- [ ] Real encryption (not mock)
- [ ] Optional: On-chain submission
- [ ] Traceable via console logging
- [ ] Error handling

## 📊 Performance Note

10 bids (1 manual + 9 simulated) × 300ms (encryption per bid) = ~3-5 seconds
→ Show "Simulating..." progress in UI

---

**Final note:** Current code keeps simulation UI-only. What Zama wants is **real FHEVM workflow** + demo. Follow the steps above to fully solve it! 🚀
