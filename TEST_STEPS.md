# FHEVM Bid Şifrelemesi Test Adımları

## 1. Browser Konsolu Açma
- F12 tuşuna basarak Developer Tools açın
- Console sekmesine tıklayın

## 2. SDK Kontrolü
```javascript
console.log('[TEST] window.relayerSDK:', typeof window.relayerSDK);
```
Çıktı: `object` olmalı

## 3. SDK Initialize Et
```javascript
await window.relayerSDK.initSDK();
```
Çıktı: `undefined` (hata yoksa başarılı)

## 4. Config Al
```javascript
const config = window.relayerSDK.SepoliaConfig;
console.log('Config relayerUrl:', config.relayerUrl);
console.log('Config contract:', config.verifyingContractAddressDecryption);
```

## 5. Instance Oluştur
```javascript
const instance = await window.relayerSDK.createInstance(config);
console.log('Instance keys:', Object.keys(instance));
```

## 6. User Adresi Al
```javascript
const accounts = await window.ethereum.request({ method: 'eth_accounts' });
const userAddress = accounts[0];
console.log('User address:', userAddress);
```

## 7. Encrypted Input Oluştur
```javascript
const encryptedInput = instance.createEncryptedInput(
  config.verifyingContractAddressDecryption,
  userAddress
);
console.log('Encrypted input created');
```

## 8. Bid Değeri Ekle ve Şifrele
```javascript
const encrypted = await encryptedInput.add256(BigInt(555)).encrypt();
console.log('Encrypted bid:', encrypted);
console.log('Handles:', encrypted.handles);
console.log('InputProof length:', encrypted.inputProof.length);
```

## Beklenen Sonuç
- `handles`: Array içinde bir veya birkaç eleman
- `inputProof`: 100 byte'lik Uint8Array
- Hata yoksa şifreleme başarılı!

## 9. UI'dan Test Etme
1. "Join Auction" butonuna tıkla
2. Bid miktarını gir (ör: 555)
3. "Submit My Encrypted Bid" butonuna tıkla
4. Konsolu izle - debug mesajlarını gör

Hatalı çıktılar:
- ❌ "submitEncryptedBid is not a function" → Contract ABI sorunu
- ❌ "publicKey must be a Uint8Array" → SDK initialize edilmedi
- ❌ "createEncryptedInput is not a function" → Yanlış SDK versiyonu
