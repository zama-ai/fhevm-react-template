"use client";

import { useCallback, useMemo } from "react";
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

  const canEncrypt = useMemo(
    () => Boolean(instance && ethersSigner && contractAddress),
    [instance, ethersSigner, contractAddress],
  );

  const encryptWith = useCallback(
    async (buildFn: (builder: RelayerEncryptedInput) => void): Promise<EncryptResult | undefined> => {
      if (!instance || !ethersSigner || !contractAddress) {
        return undefined;
      }

      try {
        const userAddress = await ethersSigner.getAddress();
        return await encryptInput(instance, contractAddress, userAddress, buildFn);
      } catch (error) {
        console.error("[useFHEEncryption] Encryption failed:", error);
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