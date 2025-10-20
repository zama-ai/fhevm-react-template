import { useMemo } from "react";
import { useFhevm } from "./useFhevm";
import type { FhevmInstance } from "../fhevmTypes";
import type { Eip1193Provider } from "ethers";

/**
 * Configuration for useFhevmInstance hook
 */
export interface UseFhevmInstanceConfig {
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
   * Maps chainId to RPC URL
   */
  mockChains?: Readonly<Record<number, string>>;
}

/**
 * Return type for useFhevmInstance hook
 */
export interface UseFhevmInstanceResult {
  /**
   * The FHEVM instance, or undefined if not ready
   */
  instance: FhevmInstance | undefined;

  /**
   * Whether the instance is ready for use
   */
  isReady: boolean;

  /**
   * Whether the instance is currently loading
   */
  isLoading: boolean;

  /**
   * Error that occurred during initialization, if any
   */
  error: Error | undefined;

  /**
   * Refresh the instance (re-initialize)
   */
  refresh: () => void;
}

/**
 * Hook to get an FHEVM instance
 * 
 * This is a Wagmi-style hook that provides a simple interface for
 * accessing the FHEVM instance.
 * 
 * @param config - Configuration options
 * @returns FHEVM instance and status
 * 
 * @example
 * ```typescript
 * import { useFhevmInstance } from '@fhevm-sdk/react';
 * import { useAccount } from 'wagmi';
 * 
 * function MyComponent() {
 *   const { address, chainId } = useAccount();
 *   const { instance, isReady, isLoading, error } = useFhevmInstance({
 *     provider: window.ethereum,
 *     chainId,
 *   });
 * 
 *   if (isLoading) return <div>Loading FHEVM...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!isReady) return <div>FHEVM not ready</div>;
 * 
 *   return <div>FHEVM is ready!</div>;
 * }
 * ```
 */
export function useFhevmInstance(
  config: UseFhevmInstanceConfig
): UseFhevmInstanceResult {
  const { provider, chainId, enabled = true, mockChains } = config;

  const { instance, status, error, refresh } = useFhevm({
    provider,
    chainId,
    enabled,
    initialMockChains: mockChains,
  });

  const isReady = useMemo(() => status === "ready", [status]);
  const isLoading = useMemo(() => status === "loading", [status]);

  return {
    instance,
    isReady,
    isLoading,
    error,
    refresh,
  };
}

