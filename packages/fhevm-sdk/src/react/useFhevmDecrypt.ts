import { useFhevmInstance } from "./useFhevmInstance";
import type { Eip1193Provider } from "ethers";

/**
 * Configuration for useFhevmDecrypt hook
 */
export interface UseFhevmDecryptConfig {
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
 * Return type for useFhevmDecrypt hook
 */
export interface UseFhevmDecryptResult {
  /**
   * Whether the decryption is ready to use
   *
   * Note: This hook provides the FHEVM instance for decryption.
   * For full decryption functionality including signature management,
   * use the useFHEDecrypt hook.
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

  /**
   * The FHEVM instance for advanced decryption operations
   *
   * Use this with useFHEDecrypt for full decryption functionality
   */
  instance: ReturnType<typeof useFhevmInstance>["instance"];
}

/**
 * Hook for accessing FHEVM instance for decryption
 *
 * This is a Wagmi-style hook that provides the FHEVM instance.
 * For full decryption functionality including signature management,
 * use this in combination with useFHEDecrypt.
 *
 * @param config - Configuration options
 * @returns FHEVM instance and status
 *
 * @example
 * ```typescript
 * import { useFhevmDecrypt, useFHEDecrypt } from '@fhevm-sdk/react';
 * import { useAccount, useSigner } from 'wagmi';
 *
 * function DecryptComponent() {
 *   const { chainId } = useAccount();
 *   const { data: signer } = useSigner();
 *   const { instance, isReady } = useFhevmDecrypt({
 *     provider: window.ethereum,
 *     chainId,
 *   });
 *
 *   // Use with useFHEDecrypt for full decryption
 *   const decryption = useFHEDecrypt({
 *     instance,
 *     ethersSigner: signer,
 *     // ... other params
 *   });
 *
 *   return (
 *     <div>
 *       {isReady ? "Ready to decrypt" : "Loading..."}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFhevmDecrypt(
  config: UseFhevmDecryptConfig
): UseFhevmDecryptResult {
  const { instance, isReady, isLoading, error } = useFhevmInstance(config);

  return {
    instance,
    isReady,
    isLoading,
    error,
  };
}

