// Universal FHEVM encryption utility
// Framework-agnostic

export async function encryptBid(sdk: any, value: number): Promise<string> {
  if (!sdk || !sdk.encrypt) throw new Error('FHEVM SDK not initialized!');
  // Zama relayer SDK: euint256 şifreleme
  return await sdk.encrypt.euint256(value);
}

// Usage:
// const encrypted = await encryptBid(sdk, 12500);
