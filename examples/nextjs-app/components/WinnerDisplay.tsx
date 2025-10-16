
import React, { useEffect, useState } from 'react';
import { type Winner } from '../types';
import { useReadEncryptedWinner } from '../../../packages/fhevm-sdk/react/useReadEncryptedWinner';
import { useDecryptWinner } from '../../../packages/fhevm-sdk/react/useDecryptWinner';
import { ethers } from 'ethers';


interface WinnerDisplayProps {
  winner?: Winner; // Optional for backward compatibility
  targetPrice: number;
  contractAddress?: string;
  abi?: any;
  signer?: ethers.providers.JsonRpcSigner;
}


const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner, targetPrice, contractAddress, abi, signer }) => {
  // State for encrypted and decrypted winner
  const [encryptedWinner, setEncryptedWinner] = useState<string | null>(null);
  const [decryptedWinner, setDecryptedWinner] = useState<Winner | null>(winner || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { readWinner } = useReadEncryptedWinner({ contractAddress: contractAddress || '', abi: abi || [], signer: signer as ethers.providers.JsonRpcSigner });
  const { decrypt } = useDecryptWinner();

  useEffect(() => {
    async function fetchAndDecryptWinner() {
      if (!contractAddress || !abi || !signer) return;
      setLoading(true);
      setError(null);
      try {
        const encWinner = await readWinner();
        setEncryptedWinner(encWinner);
        const decWinner = await decrypt(encWinner);
        setDecryptedWinner(decWinner);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch/decrypt winner');
      } finally {
        setLoading(false);
      }
    }
    // Only fetch if winner prop is not provided (onchain mode)
    if (!winner && contractAddress && abi && signer) {
      fetchAndDecryptWinner();
    }
  }, [winner, contractAddress, abi, signer, readWinner, decrypt]);

  return (
    <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-yellow-400">
      <div className="mb-4">
        <span className="text-5xl">🏆</span>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">We Have a Winner!</h2>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg space-y-3 text-left">
        <div className="flex justify-between items-baseline">
          <span className="text-md text-gray-600">Secret Target Price:</span>
          <span className="font-bold text-lg text-gray-900">${targetPrice.toLocaleString()}</span>
        </div>
        {loading && (
          <div className="text-yellow-600 font-semibold py-2">Decrypting winner onchain...</div>
        )}
        {error && (
          <div className="text-red-600 font-semibold py-2">{error}</div>
        )}
        {decryptedWinner && (
          <>
            <div className="flex justify-between items-baseline">
              <span className="text-md text-gray-600">Winning Bid:</span>
              <span className="font-bold text-lg text-yellow-600">${decryptedWinner.bid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-md text-gray-600">Difference:</span>
              <span className="font-bold text-lg text-gray-900">${decryptedWinner.difference.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <span className="text-md text-gray-600 block">Winner's Address:</span>
              <span className="font-mono text-sm text-blue-600 break-all">{decryptedWinner.address}</span>
            </div>
          </>
        )}
      </div>
      <p className="mt-6 text-gray-700">Congratulations to the winner!</p>
    </div>
  );
};

export default WinnerDisplay;