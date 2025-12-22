"use client";

import { useCallback, useMemo, useRef } from "react";
import { FhevmInstance } from "../fhevmTypes.js";
import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import { ethers } from "ethers";
import {
  type EncryptResult,
  getEncryptionMethod,
  toHex,
  buildParamsFromAbi,
  encryptInput,
} from "../utils/encryption.js";
import { useStableCallback } from "./useFhevmCache.js";

// Re-export commonly used types and utilities for convenience
export type { EncryptResult };
export { getEncryptionMethod, toHex, buildParamsFromAbi };

/**
 * React Hook for FHE encryption
 * 
 * Provides utilities to encrypt values for FHEVM contracts.
 * 
 * @param params - Hook configuration
 * @returns Encryption utilities and status
 * 
 * @example
 * ```typescript
 * const { canEncrypt, encryptWith } = useFHEEncryption({
 *   instance: fhevmInstance,
 *   ethersSigner: signer,
 *   contractAddress: "0x123..."
 * });
 * 
 * if (canEncrypt) {
 *   const result = await encryptWith((input) => {
 *     input.add32(42);
 *   });
 * }
 * ```
 */
export const useFHEEncryption = (params: {
  instance: FhevmInstance | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  contractAddress: `0x${string}` | undefined;
}) => {
  const { instance, ethersSigner, contractAddress } = params;

  // Cache user address to avoid repeated calls
  const userAddressRef = useRef<string | undefined>(undefined);
  
  const canEncrypt = useMemo(
    () => Boolean(instance && ethersSigner && contractAddress),
    [instance, ethersSigner, contractAddress],
  );

  // Use stable callback to prevent unnecessary re-renders
  const encryptWith = useStableCallback(
    async (buildFn: (builder: RelayerEncryptedInput) => void): Promise<EncryptResult | undefined> => {
      if (!instance || !ethersSigner || !contractAddress) {
        return undefined;
      }

      try {
        // Cache user address
        if (!userAddressRef.current) {
          userAddressRef.current = await ethersSigner.getAddress();
        }
        
        return await encryptInput(instance, contractAddress, userAddressRef.current as `0x${string}`, buildFn);
      } catch (error) {
        console.error("[useFHEEncryption] Encryption failed:", error);
        // Clear cache on error
        userAddressRef.current = undefined;
        throw error;
      }
    },
    [instance, ethersSigner, contractAddress],
  );

  return {
    canEncrypt,
    encryptWith,
  } as const;
};