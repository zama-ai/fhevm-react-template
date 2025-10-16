// ...existing code...
import type { FhevmInstanceConfig } from '../src/fhevmTypes';
// window globalı TypeScript için declare ediliyor
declare var window: any;
// React hook for FHEVM bid encryption
import { useCallback } from 'react';
import { encryptBid } from '../core/encrypt';
import { useFHEVMRelayer } from './useFHEVMRelayer';

export function useEncryptBid() {
  const { sdk, loading, error } = useFHEVMRelayer();

  const encrypt = useCallback(async (value: number) => {
    try {
      const win = typeof window !== 'undefined' ? (window as any) : undefined;
      if (!win || !win.relayerSDK) throw new Error('Relayer SDK global modul bulunmadi!');
      const relayerSDK = win.relayerSDK;
      
      // ÖNEMLI: WASM'i initialize et (ilk çağrı sırasında)
      console.log('[DEBUG] Initializing SDK with WASM...');
      try {
        await relayerSDK.initSDK();
        console.log('[DEBUG] ✅ SDK initialized');
      } catch (initErr) {
        console.log('[DEBUG] SDK already initialized or init error:', initErr);
      }
      
      // Sadece SDK'nin sağladığı SepoliaConfig'i direkt kullan
      const config = relayerSDK.SepoliaConfig;
      
      console.log('[DEBUG] Using SepoliaConfig directly');
      console.log('[DEBUG] config.relayerUrl:', config.relayerUrl);
      console.log('[DEBUG] config keys:', Object.keys(config));
      console.log('[DEBUG] createInstance çağrılıyor...');
      
      // Instance olustur
      const instance = await relayerSDK.createInstance(config);
      console.log('[DEBUG] ✅ Instance basariyla olusturuldu');
      console.log('[DEBUG] Instance keys:', Object.keys(instance));
      
      // createEncryptedInput'u kullan (SDK'nin doğru API'si)
      if (!instance.createEncryptedInput || typeof instance.createEncryptedInput !== 'function') {
        throw new Error('FHEVM SDK instance createEncryptedInput fonksiyonu yok!');
      }
      
      // Contract adresi gerekli - config'den al
      const contractAddress = config.verifyingContractAddressDecryption;
      if (!contractAddress) {
        throw new Error('Contract address not configured!');
      }
      
      // User adresi (MetaMask'ten veya mock'dan)
      let userAddress = '0x0000000000000000000000000000000000000000';
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ 
            method: 'eth_accounts' 
          });
          if (accounts && accounts.length > 0) {
            userAddress = accounts[0];
          }
        } catch (e) {
          console.log('[DEBUG] Could not get user address from MetaMask:', e);
        }
      }
      
      console.log('[DEBUG] Bid değeri şifrelenmeye başlanıyor, value:', value);
      console.log('[DEBUG] Contract address:', contractAddress);
      console.log('[DEBUG] User address:', userAddress);
      
      const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);
      console.log('[DEBUG] ✅ encryptedInput obje oluşturuldu');
      
      // euint256 ekleme (256-bit unsigned integer)
      const inputWithBid = encryptedInput.add256(BigInt(value));
      console.log('[DEBUG] ✅ value to encrypted input added');
      
      // Şifrele ve gönder
      const encrypted = await inputWithBid.encrypt();
      console.log('[DEBUG] ✅ Bid basariyla sifrelendi');
      console.log('[DEBUG] Encrypted output keys:', Object.keys(encrypted));
      
      return encrypted;
    } catch (err) {
      console.error('[DEBUG] ❌ Hata:', err);
      throw err;
    }
  }, []);

  return { encrypt, loading, error };
}

// Usage:
// const { encrypt } = useEncryptBid();
// const encryptedBid = await encrypt(12500);
