// Universal FHEVM decryption utility
// Framework-agnostic
export async function decryptWinner(sdk: any, encryptedWinner: string): Promise<any> {
  if (!sdk || !sdk.decrypt) throw new Error('FHEVM SDK not initialized!');
  // Zama relayer SDK: winner decryption
  return await sdk.decrypt(encryptedWinner);
}

// Usage:
// const winner = await decryptWinner(sdk, encryptedWinner);
