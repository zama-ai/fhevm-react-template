"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FhevmDecryptionSignature } from "../FhevmDecryptionSignature.js";
import { GenericStringStorage } from "../storage/GenericStringStorage.js";
import { FhevmInstance } from "../fhevmTypes.js";
import { ethers } from "ethers";
import {
  type FHEDecryptRequest,
  type DecryptedValue,
  createRequestsKey,
  canDecrypt as canDecryptUtil,
} from "../utils/decryption.js";
import { useStableObject, useComputedValue } from "./useFhevmCache.js";

// Re-export types for convenience
export type { FHEDecryptRequest, DecryptedValue };

/**
 * React Hook for FHE decryption
 * 
 * Provides utilities to decrypt encrypted values from FHEVM contracts.
 * 
 * @param params - Hook configuration
 * @returns Decryption utilities, status, and results
 * 
 * @example
 * ```typescript
 * const { canDecrypt, decrypt, results, isDecrypting, error } = useFHEDecrypt({
 *   instance: fhevmInstance,
 *   ethersSigner: signer,
 *   fhevmDecryptionSignatureStorage: storage,
 *   chainId: 31337,
 *   requests: [{ handle: "0x123", contractAddress: "0xabc" }]
 * });
 * 
 * if (canDecrypt) {
 *   await decrypt();
 *   console.log(results);
 * }
 * ```
 */
export const useFHEDecrypt = (params: {
  instance: FhevmInstance | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  chainId: number | undefined;
  requests: readonly FHEDecryptRequest[] | undefined;
}) => {
  const { instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId, requests } = params;

  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [results, setResults] = useState<Record<string, DecryptedValue>>({});
  const [error, setError] = useState<string | null>(null);

  const isDecryptingRef = useRef<boolean>(false);
  const lastReqKeyRef = useRef<string>("");

  // Stabilize requests object reference (avoid re-renders when content is same)
  const stableRequests = useStableObject(requests as any);

  // Create unique key for current requests with caching
  const requestsKey = useComputedValue(
    () => createRequestsKey(stableRequests || []),
    [stableRequests],
    { timeout: 60000 } // Cache for 1 minute
  );

  // Check if decryption is available
  const canDecrypt = useMemo(() => {
    return canDecryptUtil(instance, ethersSigner, requests) && !isDecrypting;
  }, [instance, ethersSigner, requests, isDecrypting]);

  const decrypt = useCallback(() => {
    // Prevent concurrent decryption
    if (isDecryptingRef.current) {
      console.warn("[useFHEDecrypt] Decryption already in progress");
      return;
    }

    if (!instance || !ethersSigner || !requests || requests.length === 0) {
      console.warn("[useFHEDecrypt] Missing required parameters");
      return;
    }

    // Capture current values for staleness check
    const thisChainId = chainId;
    const thisSigner = ethersSigner;
    const thisRequests = requests;

    // Update refs
    lastReqKeyRef.current = requestsKey;
    isDecryptingRef.current = true;

    // Reset state
    setIsDecrypting(true);
    setMessage("Starting decryption...");
    setError(null);

    const performDecryption = async () => {
      // Check if request is stale
      const isStale = () =>
        thisChainId !== chainId ||
        thisSigner !== ethersSigner ||
        requestsKey !== lastReqKeyRef.current;

      try {
        // Get unique contract addresses
        const uniqueAddresses = Array.from(
          new Set(thisRequests.map((r) => r.contractAddress))
        );

        // Load or create decryption signature
        setMessage("Loading decryption signature...");
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          uniqueAddresses as `0x${string}`[],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          throw new Error("Failed to create decryption signature");
        }

        // Check staleness before proceeding
        if (isStale()) {
          setMessage("Request cancelled (parameters changed)");
          return;
        }

        // Perform decryption
        setMessage("Decrypting values...");
        const mutableReqs = thisRequests.map((r) => ({
          handle: r.handle,
          contractAddress: r.contractAddress,
        }));

        const decryptedResults = await instance.userDecrypt(
          mutableReqs,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        // Final staleness check
        if (isStale()) {
          setMessage("Request cancelled (parameters changed)");
          return;
        }

        // Update results
        setResults(decryptedResults);
        setMessage("Decryption completed successfully!");
        console.log("[useFHEDecrypt] Decryption successful:", decryptedResults);
      } catch (err) {
        // Format error message
        const error = err as Error;
        const errorMessage = `${error.name || "DecryptionError"}: ${error.message || "Unknown error"}`;
        
        setError(errorMessage);
        setMessage("Decryption failed");
        console.error("[useFHEDecrypt] Decryption failed:", error);
      } finally {
        // Cleanup
        isDecryptingRef.current = false;
        setIsDecrypting(false);
        lastReqKeyRef.current = requestsKey;
      }
    };

    performDecryption();
  }, [instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId, requests, requestsKey]);

  return {
    canDecrypt,
    decrypt,
    isDecrypting,
    message,
    results,
    error,
    setMessage,
    setError,
  } as const;
};