"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { DecryptionManager, FHEDecryptRequest, DecryptResult } from "../core/DecryptionManager.js";
import { GenericStringStorage } from "../storage/GenericStringStorage.js";
import { FhevmInstance } from "../fhevmTypes.js";
import { ethers } from "ethers";

// Re-export types for backward compatibility
export type { FHEDecryptRequest, DecryptResult };

/**
 * React hook for FHE decryption operations.
 * 
 * This hook provides a React-friendly interface to decrypt FHE-encrypted data
 * from smart contracts. It manages the DecryptionManager lifecycle, handles
 * loading states, and provides user-friendly status messages.
 * 
 * @param params - Configuration parameters
 * @param params.instance - The FHEVM instance (from useFhevm hook)
 * @param params.ethersSigner - The user's ethers signer
 * @param params.fhevmDecryptionSignatureStorage - Storage for caching signatures
 * @param params.chainId - The blockchain chain ID
 * @param params.requests - Array of handles to decrypt
 * 
 * @returns Object containing decryption status, methods, and results
 * 
 * @remarks
 * This hook automatically manages:
 * - EIP-712 signature creation and caching
 * - Loading states during decryption
 * - Error handling and user feedback
 * - Preventing duplicate decryption requests
 * 
 * The hook uses internal state tracking to ensure decryptions are not
 * triggered multiple times simultaneously.
 * 
 * @example
 * Basic usage:
 * ```tsx
 * import { useFHEDecrypt } from '@fhevm-sdk';
 * 
 * function MyComponent() {
 *   const { instance } = useFhevm({ provider, chainId });
 *   const { ethersSigner } = useEthersSigner();
 *   const { storage } = useInMemoryStorage();
 *   
 *   const requests = useMemo(() => [
 *     { handle: counterHandle, contractAddress: '0x...' }
 *   ], [counterHandle]);
 *   
 *   const {
 *     canDecrypt,
 *     decrypt,
 *     isDecrypting,
 *     results,
 *     message,
 *     error
 *   } = useFHEDecrypt({
 *     instance,
 *     ethersSigner,
 *     fhevmDecryptionSignatureStorage: storage,
 *     chainId: 11155111,
 *     requests
 *   });
 *   
 *   return (
 *     <div>
 *       <button onClick={decrypt} disabled={!canDecrypt || isDecrypting}>
 *         {isDecrypting ? 'Decrypting...' : 'Decrypt'}
 *       </button>
 *       {message && <p>{message}</p>}
 *       {error && <p style={{color: 'red'}}>{error}</p>}
 *       {results[counterHandle] && (
 *         <p>Value: {results[counterHandle].toString()}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * With automatic updates:
 * ```tsx
 * const [handle, setHandle] = useState<string | undefined>();
 * 
 * const requests = useMemo(() => {
 *   if (!handle) return undefined;
 *   return [{ handle, contractAddress }];
 * }, [handle, contractAddress]);
 * 
 * const { decrypt, results, isDecrypting } = useFHEDecrypt({
 *   instance,
 *   ethersSigner,
 *   fhevmDecryptionSignatureStorage: storage,
 *   chainId,
 *   requests
 * });
 * 
 * // Decrypt automatically when handle changes
 * useEffect(() => {
 *   if (handle && !isDecrypting) {
 *     decrypt();
 *   }
 * }, [handle, decrypt, isDecrypting]);
 * ```
 * 
 * @public
 */
export const useFHEDecrypt = (params: {
  /** The FHEVM instance */
  instance: FhevmInstance | undefined;
  /** The user's ethers signer */
  ethersSigner: ethers.JsonRpcSigner | undefined;
  /** Storage for caching decryption signatures */
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  /** The blockchain chain ID */
  chainId: number | undefined;
  /** Array of handles to decrypt */
  requests: readonly FHEDecryptRequest[] | undefined;
}) => {
  const { instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId, requests } = params;

  // React state for UI feedback
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [results, setResults] = useState<DecryptResult>({});
  const [error, setError] = useState<string | null>(null);

  // Internal state tracking
  const isDecryptingRef = useRef<boolean>(false);
  const lastReqKeyRef = useRef<string>('');

  // Create a stable key for the requests to detect changes
  const requestsKey = useMemo(() => {
    if (!requests || requests.length === 0) return '';
    const sorted = [...requests].sort((a, b) =>
      (a.handle + a.contractAddress).localeCompare(b.handle + b.contractAddress)
    );
    return JSON.stringify(sorted);
  }, [requests]);

  // Create and memoize DecryptionManager instance
  const manager = useMemo(() => {
    if (!instance || !ethersSigner || !chainId || !fhevmDecryptionSignatureStorage) {
      return null;
    }

    try {
      return new DecryptionManager(
        instance,
        ethersSigner,
        fhevmDecryptionSignatureStorage,
        chainId
      );
    } catch (error) {
      console.error('useFHEDecrypt: Failed to create DecryptionManager:', error);
      return null;
    }
  }, [instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId]);

  // Check if decryption is possible
  const canDecrypt = useMemo(() => {
    return Boolean(
      manager?.canDecrypt(requests as any) && 
      !isDecrypting &&
      requests &&
      requests.length > 0
    );
  }, [manager, requests, isDecrypting]);

  // Memoized decryption function
  const decrypt = useCallback(async () => {
    // Prevent concurrent decryption attempts
    if (isDecryptingRef.current) {
      console.warn('useFHEDecrypt: Decryption already in progress');
      return;
    }

    if (!manager || !requests || requests.length === 0) {
      console.warn('useFHEDecrypt: Cannot decrypt - manager or requests not available');
      return;
    }

    // Capture current state for staleness checks
    const thisChainId = chainId;
    const thisSigner = ethersSigner;
    const thisRequestsKey = requestsKey;

    // Update the last request key to avoid false "stale" detection
    lastReqKeyRef.current = requestsKey;

    // Set decrypting state
    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage('Starting decryption...');
    setError(null);

    try {
      // Helper function to check if state has changed
      const isStale = () =>
        thisChainId !== chainId ||
        thisSigner !== ethersSigner ||
        thisRequestsKey !== lastReqKeyRef.current;

      // Check staleness before starting
      if (isStale()) {
        setMessage('Decryption cancelled: parameters changed');
        return;
      }

      setMessage('Loading decryption signature...');

      // Execute decryption
      const decryptedResults = await manager.decrypt(requests as FHEDecryptRequest[]);

      // Check staleness after decryption
      if (isStale()) {
        setMessage('Decryption completed but results discarded: parameters changed');
        return;
      }

      // Update results
      setResults(decryptedResults);
      setMessage('Decryption completed successfully!');
      setError(null);
    } catch (err) {
      // Handle errors
      const errorObj = err as Error;
      const errorMessage = errorObj.message || String(err);

      console.error('useFHEDecrypt: Decryption failed:', errorObj);

      setError(errorMessage);
      setMessage('Decryption failed');
      setResults({});
    } finally {
      // Reset decrypting state
      isDecryptingRef.current = false;
      setIsDecrypting(false);
    }
  }, [manager, requests, chainId, ethersSigner, requestsKey]);

  return {
    /** Whether decryption is currently possible */
    canDecrypt,
    /** Function to trigger decryption */
    decrypt,
    /** Whether decryption is currently in progress */
    isDecrypting,
    /** Status message for user feedback */
    message,
    /** Decryption results mapping handles to values */
    results,
    /** Error message if decryption failed */
    error,
    /** Function to manually set status message */
    setMessage,
    /** Function to manually set error message */
    setError,
  } as const;
};
