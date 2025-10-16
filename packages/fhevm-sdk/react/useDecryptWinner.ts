// React hook for FHEVM winner decryption
import { useCallback } from 'react';
import { decryptWinner } from '../core/decrypt';
import { useFHEVMRelayer } from './useFHEVMRelayer';

export function useDecryptWinner() {
  const { sdk, loading, error } = useFHEVMRelayer();

  const decrypt = useCallback(async (encryptedWinner: string) => {
    if (loading || error || !sdk) throw new Error('Relayer SDK not ready');
    return await decryptWinner(sdk, encryptedWinner);
  }, [sdk, loading, error]);

  return { decrypt, loading, error };
}

// Usage:
// const { decrypt } = useDecryptWinner();
// const winner = await decrypt(encryptedWinner);
