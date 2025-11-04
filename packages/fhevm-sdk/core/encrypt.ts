// Universal FHEVM encryption utility
// Framework-agnostic
// Compatible with FHEVM v0.10.0+ (fully encrypted storage with complete explorer privacy)

export async function encryptBid(sdk: any, value: number): Promise<string> {
  if (!sdk || !sdk.encrypt) throw new Error('FHEVM SDK not initialized!');
  
  // Zama relayer SDK: euint256 encryption
  // v0.10.0+: Results in fully encrypted storage, 100% invisible on blockchain explorer
  // All bid amounts are end-to-end encrypted and cannot be decrypted without authorization
  
  return await sdk.encrypt.euint256(value);
}

// Usage:
// const encrypted = await encryptBid(sdk, 12500);
// Result: Fully encrypted value, completely private from explorer (v0.10.0+ feature)
