import { useState, useEffect } from 'react';
import { getInstance } from '@/lib/fhevm/fhevmjs';

type EncryptedAmount = {
  handles: Uint8Array[];
  inputProof: Uint8Array;
};

export const useEncrypt = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedAmount, setEncryptedAmount] = useState<EncryptedAmount>(null);
  const [amount, setAmount] = useState<bigint>(0n);
  const [contractAddress, setContractAddress] = useState<`0x${string}`>(null);
  const [userAddress, setUserAddress] = useState<`0x${string}`>(null);

  useEffect(() => {
    if (!isEncrypting) return;
    async function createEncryptedInput() {
      try {
        const instance = getInstance();
        // wait for next javascript event loop to enable rendering
        await new Promise((resolve) => setTimeout(resolve, 0));
        const result = await instance
          .createEncryptedInput(contractAddress, userAddress)
          .add64(BigInt(amount))
          .encrypt();

        setEncryptedAmount(result);
      } catch (error) {
        console.error('Encryption failed:', error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    }
    createEncryptedInput();
  }, [isEncrypting, amount, contractAddress, userAddress]);

  async function encryptAmount(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    amount: bigint,
  ) {
    setContractAddress(contractAddress);
    setUserAddress(userAddress);
    setAmount(amount);
    setIsEncrypting(true);
  }

  async function resetEncrypt() {
    setEncryptedAmount(null);
    setIsEncrypting(false);
    setAmount(0n);
    setContractAddress(null);
    setUserAddress(null);
  }

  return { encryptAmount, isEncrypting, encryptedAmount, resetEncrypt };
};
