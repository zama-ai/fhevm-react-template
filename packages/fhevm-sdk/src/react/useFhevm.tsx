import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import type { FhevmInstance } from "../fhevmTypes.js";
import { FhevmClient, type FhevmClientStatus } from "../core/FhevmClient.js";

/**
 * Legacy type alias for backward compatibility
 * @deprecated Use FhevmClientStatus from core instead
 */
export type FhevmGoState = FhevmClientStatus;

/**
 * React hook for managing FHEVM instances.
 * 
 * This hook provides a React-friendly interface to the FhevmClient,
 * handling lifecycle management, state updates, and cleanup automatically.
 * 
 * @remarks
 * The hook will automatically initialize the FHEVM instance when the provider
 * and chainId are available (and `enabled` is true). It will clean up resources
 * when the component unmounts or when dependencies change.
 * 
 * **Note**: This hook now uses the refactored FhevmClient internally for better
 * stability and testability while maintaining the same API.
 * 
 * @param parameters - Configuration options
 * @returns FHEVM instance state and control functions
 * 
 * @example
 * Basic usage:
 * ```typescript
 * function MyComponent() {
 *   const { instance, status, error, refresh } = useFhevm({
 *     provider: window.ethereum,
 *     chainId: 11155111
 *   });
 *   
 *   if (status === 'loading') return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!instance) return <div>Not initialized</div>;
 *   
 *   return <div>Ready! Instance: {instance}</div>;
 * }
 * ```
 * 
 * @example
 * With manual control:
 * ```typescript
 * function MyComponent() {
 *   const { instance, status, refresh } = useFhevm({
 *     provider: window.ethereum,
 *     chainId: 11155111,
 *     enabled: false // Don't auto-initialize
 *   });
 *   
 *   const handleInit = async () => {
 *     refresh(); // Manually trigger initialization
 *   };
 *   
 *   return <button onClick={handleInit}>Initialize FHEVM</button>;
 * }
 * ```
 * 
 * @example
 * With local development:
 * ```typescript
 * function MyComponent() {
 *   const { instance, status } = useFhevm({
 *     provider: window.ethereum,
 *     chainId: 31337,
 *     initialMockChains: { 31337: 'http://localhost:8545' }
 *   });
 *   
 *   // Hook automatically detects local chain and uses mock mode
 *   return <div>Status: {status}</div>;
 * }
 * ```
 * 
 * @public
 */
export function useFhevm(parameters: {
  /** Web3 provider (EIP-1193 or RPC URL) */
  provider: string | ethers.Eip1193Provider | undefined;
  /** Blockchain chain ID */
  chainId: number | undefined;
  /** Enable auto-initialization (default: true) */
  enabled?: boolean;
  /** Mock chain RPC URLs for local development */
  initialMockChains?: Readonly<Record<number, string>>;
}): {
  /** The initialized FHEVM instance, or undefined */
  instance: FhevmInstance | undefined;
  /** Function to manually refresh/re-initialize the instance */
  refresh: () => void;
  /** Last error that occurred, or undefined */
  error: Error | undefined;
  /** Current initialization status */
  status: FhevmGoState;
} {
  const { provider, chainId, initialMockChains, enabled = true } = parameters;

  // State
  const [instance, setInstance] = useState<FhevmInstance | undefined>(undefined);
  const [status, setStatus] = useState<FhevmGoState>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);

  // Ref to hold the client instance
  const clientRef = useRef<FhevmClient | null>(null);
  
  // Track previous values to detect changes
  const prevValuesRef = useRef<{
    provider: string | ethers.Eip1193Provider | undefined;
    chainId: number | undefined;
    enabled: boolean;
  }>({ provider: undefined, chainId: undefined, enabled: false });

  /**
   * Manual refresh function
   */
  const refresh = useCallback(() => {
    if (!clientRef.current || !enabled || !provider) {
      return;
    }

    clientRef.current
      .refresh()
      .then((inst) => {
        setInstance(inst);
        setError(undefined);
      })
      .catch((err) => {
        // Ignore cancellation errors silently
        if (err?.message?.includes("cancelled") || err?.message?.includes("Initialization was cancelled")) {
          return;
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, [enabled, provider]);

  /**
   * Initialize or update the client when parameters change
   */
  useEffect(() => {
    // Check if parameters changed
    const prevValues = prevValuesRef.current;
    const hasChanges =
      prevValues.provider !== provider ||
      prevValues.chainId !== chainId ||
      prevValues.enabled !== enabled;

    if (!hasChanges) {
      return;
    }

    // Update tracked values
    prevValuesRef.current = { provider, chainId, enabled };

    // If not enabled or missing provider, clean up
    if (!enabled || !provider) {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
      setInstance(undefined);
      setStatus("idle");
      setError(undefined);
      return;
    }

    // Create or update client
    if (!clientRef.current) {
      // Create new client
      const client = new FhevmClient({
        provider,
        chainId,
        mockChains: initialMockChains as Record<number, string>,
        enabled,
      });

      // Set up event listeners
      client.on("statusChange", (s) => {
        setStatus(s);
      });

      client.on("error", (err) => {
        setError(err);
      });

      clientRef.current = client;

      // Initialize
      client
        .initialize()
        .then((inst) => {
          setInstance(inst);
          setError(undefined);
        })
        .catch((err) => {
          // Ignore cancellation errors silently
          if (err?.message?.includes("cancelled") || err?.message?.includes("Initialization was cancelled")) {
            return;
          }
          setError(err instanceof Error ? err : new Error(String(err)));
        });
    } else {
      // Update existing client config
      clientRef.current
        .updateConfig({
          provider,
          chainId,
          mockChains: initialMockChains as Record<number, string>,
          enabled,
        })
        .then((inst) => {
          setInstance(inst);
          setError(undefined);
        })
        .catch((err) => {
          // Ignore cancellation errors silently
          if (err?.message?.includes("cancelled") || err?.message?.includes("Initialization was cancelled")) {
            return;
          }
          setError(err instanceof Error ? err : new Error(String(err)));
        });
    }
  }, [provider, chainId, enabled, initialMockChains]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, []);

  return {
    instance,
    refresh,
    error,
    status,
  };
}
