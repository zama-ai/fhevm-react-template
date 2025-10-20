import { useCallback, useMemo } from "react";
import { useFhevmInstance } from "./useFhevmInstance";
import type { Eip1193Provider } from "ethers";
import type { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";

/**
 * Configuration for useFhevmEncrypt hook
 */
export interface UseFhevmEncryptConfig {
  /**
   * Ethereum provider (EIP-1193 compatible) or RPC URL
   */
  provider: string | Eip1193Provider | undefined;

  /**
   * Chain ID of the network
   */
  chainId: number | undefined;

  /**
   * Whether the hook is enabled (default: true)
   */
  enabled?: boolean;

  /**
   * Optional mock chain configurations for testing
   */
  mockChains?: Readonly<Record<number, string>>;
}

/**
 * Parameters for creating an encrypted input
 */
export interface CreateEncryptedInputParams {
  /**
   * The contract address that will receive the encrypted input
   */
  contractAddress: string;

  /**
   * The user address (typically the connected wallet address)
   */
  userAddress: string;
}

/**
 * Return type for useFhevmEncrypt hook
 */
export interface UseFhevmEncryptResult {
  /**
   * Create an encrypted input builder
   * 
   * @param params - Contract and user addresses
   * @returns Encrypted input builder
   * 
   * @example
   * ```typescript
   * const input = createEncryptedInput({
   *   contractAddress: "0x1234...",
   *   userAddress: address
   * });
   * input.add32(42);
   * const encrypted = await input.encrypt();
   * ```
   */
  createEncryptedInput: (
    params: CreateEncryptedInputParams
  ) => RelayerEncryptedInput | undefined;

  /**
   * Whether the encryption is ready to use
   */
  isReady: boolean;

  /**
   * Whether the FHEVM instance is loading
   */
  isLoading: boolean;

  /**
   * Error that occurred during initialization, if any
   */
  error: Error | undefined;
}

/**
 * Hook for encrypting data with FHEVM
 * 
 * This is a Wagmi-style hook that provides a simple interface for
 * creating encrypted inputs.
 * 
 * @param config - Configuration options
 * @returns Encryption utilities and status
 * 
 * @example
 * ```typescript
 * import { useFhevmEncrypt } from '@fhevm-sdk/react';
 * import { useAccount } from 'wagmi';
 * 
 * function EncryptComponent() {
 *   const { address, chainId } = useAccount();
 *   const { createEncryptedInput, isReady } = useFhevmEncrypt({
 *     provider: window.ethereum,
 *     chainId,
 *   });
 * 
 *   const handleEncrypt = async () => {
 *     if (!isReady || !address) return;
 * 
 *     const input = createEncryptedInput({
 *       contractAddress: "0x1234...",
 *       userAddress: address,
 *     });
 * 
 *     if (!input) return;
 * 
 *     input.add32(42);
 *     input.add64(1000n);
 *     const encrypted = await input.encrypt();
 *     
 *     // Use encrypted.handles and encrypted.inputProof in your contract call
 *   };
 * 
 *   return (
 *     <button onClick={handleEncrypt} disabled={!isReady}>
 *       Encrypt Data
 *     </button>
 *   );
 * }
 * ```
 */
export function useFhevmEncrypt(
  config: UseFhevmEncryptConfig
): UseFhevmEncryptResult {
  const { instance, isReady, isLoading, error } = useFhevmInstance(config);

  const createEncryptedInput = useCallback(
    (params: CreateEncryptedInputParams): RelayerEncryptedInput | undefined => {
      if (!instance) {
        return undefined;
      }

      return instance.createEncryptedInput(
        params.contractAddress,
        params.userAddress
      ) as RelayerEncryptedInput;
    },
    [instance]
  );

  return {
    createEncryptedInput,
    isReady,
    isLoading,
    error,
  };
}

