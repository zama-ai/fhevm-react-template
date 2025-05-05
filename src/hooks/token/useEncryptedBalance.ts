import { useState } from 'react';
import { getInstance } from '@/lib/fhevm/fhevmjs';
import { reencryptEuint64 } from '@/lib/reencrypt';
import { Signer } from 'ethers';
import { FhevmInstance } from 'fhevmjs';
import { useFhevm } from '@/providers/FhevmProvider';

interface UseEncryptedBalanceProps {
  signer: Signer | null;
}

export const useEncryptedBalance = ({ signer }: UseEncryptedBalanceProps) => {
  const [decryptedBalance, setDecryptedBalance] = useState<bigint | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Never');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isInitialized, instanceStatus } = useFhevm();

  const decrypt = async (handle: bigint, contractAddress: `0x${string}`) => {
    setIsDecrypting(true);
    setError(null);
    try {
      if (!signer)
        throw new Error('Signer not initialized - please connect your wallet');
      if (!isInitialized) throw new Error('Fhevm not initialized');
      if (instanceStatus !== 'ready')
        throw new Error('Create instance not initialized');
      if (!handle || handle === 0n) {
        setDecryptedBalance(0n);
        setLastUpdated(new Date().toLocaleString());
        return;
      }

      const instance = getInstance();
      // console.log(getInstance);
      // Use type assertion to safely pass the instance
      // console.log(handle, contractAddress);
      const clearBalance = await reencryptEuint64(
        signer,
        instance as FhevmInstance,
        BigInt(handle),
        contractAddress,
      );
      // console.log(clearBalance.toString());

      setDecryptedBalance(clearBalance);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Decryption error:', error);
      if (error === 'Handle is not initialized') {
        setDecryptedBalance(0n);
      } else {
        setError(
          error instanceof Error ? error.message : 'Failed to decrypt balance',
        );
        throw error;
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  return {
    decryptedBalance,
    lastUpdated,
    isDecrypting,
    decrypt,
    error,
  };
};
