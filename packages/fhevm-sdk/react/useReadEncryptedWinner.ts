// React hook for reading encrypted winner onchain
import { useCallback } from 'react';
import { readEncryptedWinner } from '../core/readWinner';
import { ethers } from 'ethers';

export function useReadEncryptedWinner({ contractAddress, abi, signer }: {
  contractAddress: string;
  abi: any;
  signer: ethers.Signer;
}) {
  const readWinner = useCallback(async () => {
    return await readEncryptedWinner({ contractAddress, abi, signer });
  }, [contractAddress, abi, signer]);

  return { readWinner };
}

// Usage:
// const { readWinner } = useReadEncryptedWinner({ contractAddress, abi, signer });
// const encryptedWinner = await readWinner();
