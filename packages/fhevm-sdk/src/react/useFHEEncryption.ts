"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FhevmInstance } from "../fhevmTypes.js";
import { EncryptionManager, EncryptResult } from "../core/EncryptionManager.js";
import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import { ethers } from "ethers";

/**
 * Re-export utility functions from EncryptionManager for backward compatibility.
 * @deprecated Import directly from EncryptionManager instead
 */
export const getEncryptionMethod = EncryptionManager.getEncryptionMethod;

/**
 * Re-export toHex utility function for backward compatibility.
 * @deprecated Import directly from EncryptionManager instead
 */
export const toHex = EncryptionManager.toHex;

/**
 * Re-export buildParamsFromAbi utility function for backward compatibility.
 * @deprecated Import directly from EncryptionManager instead
 */
export const buildParamsFromAbi = EncryptionManager.buildParamsFromAbi;

// Re-export types
export type { EncryptResult };

/**
 * React hook for FHE encryption operations.
 * 
 * This hook provides a React-friendly interface to encrypt data using
 * Fully Homomorphic Encryption before sending it to smart contracts.
 * It manages the EncryptionManager lifecycle and provides memoized functions.
 * 
 * @param params - Configuration parameters
 * @param params.instance - The FHEVM instance (from useFhevm hook)
 * @param params.ethersSigner - The user's ethers signer
 * @param params.contractAddress - The target contract address
 * 
 * @returns Object containing encryption status and methods
 * 
 * @example
 * Basic usage:
 * ```tsx
 * import { useFHEEncryption } from '@fhevm-sdk';
 * 
 * function MyComponent() {
 *   const { instance } = useFhevm({ provider, chainId });
 *   const { ethersSigner } = useEthersSigner();
 *   
 *   const { canEncrypt, encryptWith } = useFHEEncryption({
 *     instance,
 *     ethersSigner,
 *     contractAddress: '0x1234...'
 *   });
 *   
 *   const handleEncrypt = async () => {
 *     const result = await encryptWith((builder) => {
 *       builder.add32(42);
 *     });
 *     console.log('Encrypted:', result);
 *   };
 *   
 *   return (
 *     <button onClick={handleEncrypt} disabled={!canEncrypt}>
 *       Encrypt Value
 *     </button>
 *   );
 * }
 * ```
 * 
 * @example
 * With contract interaction:
 * ```tsx
 * const { canEncrypt, encryptWith } = useFHEEncryption({
 *   instance,
 *   ethersSigner,
 *   contractAddress
 * });
 * 
 * const handleIncrement = async () => {
 *   const encrypted = await encryptWith((builder) => {
 *     builder.add32(1);
 *   });
 *   
 *   const params = buildParamsFromAbi(encrypted, contractAbi, 'increment');
 *   await contract.increment(...params);
 * };
 * ```
 * 
 * @public
 */
export const useFHEEncryption = (params: {
  /** The FHEVM instance */
  instance: FhevmInstance | undefined;
  /** The user's ethers signer */
  ethersSigner: ethers.JsonRpcSigner | undefined;
  /** The target contract address */
  contractAddress: `0x${string}` | undefined;
}) => {
  const { instance, ethersSigner, contractAddress } = params;

  // Track user address from signer
  const [userAddress, setUserAddress] = useState<string | undefined>();

  // Fetch user address when signer changes
  useEffect(() => {
    if (!ethersSigner) {
      setUserAddress(undefined);
      return;
    }

    let cancelled = false;

    ethersSigner
      .getAddress()
      .then((address) => {
        if (!cancelled) {
          setUserAddress(address);
        }
      })
      .catch((error) => {
        console.error('useFHEEncryption: Failed to get user address:', error);
        if (!cancelled) {
          setUserAddress(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ethersSigner]);

  // Create and memoize EncryptionManager instance
  const manager = useMemo(() => {
    if (!instance || !contractAddress || !userAddress) {
      return null;
    }

    try {
      return new EncryptionManager(instance, contractAddress, userAddress);
    } catch (error) {
      console.error('useFHEEncryption: Failed to create EncryptionManager:', error);
      return null;
    }
  }, [instance, contractAddress, userAddress]);

  // Check if encryption is possible
  const canEncrypt = useMemo(
    () => Boolean(manager?.canEncrypt()),
    [manager]
  );

  // Memoized encryption function
  const encryptWith = useCallback(
    async (
      buildFn: (builder: RelayerEncryptedInput) => void
    ): Promise<EncryptResult | undefined> => {
      if (!manager) {
        console.warn('useFHEEncryption: EncryptionManager not available');
        return undefined;
      }

      try {
        const result = await manager.encrypt(buildFn);
        return result;
      } catch (error) {
        console.error('useFHEEncryption: Encryption failed:', error);
        throw error;
      }
    },
    [manager]
  );

  return {
    canEncrypt,
    encryptWith,
  } as const;
};
