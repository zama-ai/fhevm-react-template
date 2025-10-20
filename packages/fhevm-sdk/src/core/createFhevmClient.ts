import { FhevmClient, FhevmClientConfig } from "./FhevmClient";
import { getNetworkPreset } from "./presets";

/**
 * Create and initialize an FHEVM client in one step
 *
 * This is a convenience function that creates a new FhevmClient
 * and immediately initializes it.
 *
 * @param config - Configuration options for the client, or a network preset name
 * @returns A promise that resolves to an initialized FhevmClient
 *
 * @throws {FhevmError} If initialization fails
 * @throws {FhevmAbortError} If initialization is aborted
 *
 * @example
 * ```typescript
 * // Simple usage with provider
 * const client = await createFhevmClient({
 *   provider: window.ethereum
 * });
 *
 * // With mock chains for local development
 * const client = await createFhevmClient({
 *   provider: "http://localhost:8545",
 *   mockChains: {
 *     31337: "http://localhost:8545"
 *   }
 * });
 *
 * // Using a network preset
 * const client = await createFhevmClient("localhost");
 *
 * // With status updates
 * const client = await createFhevmClient({
 *   provider: window.ethereum,
 *   onStatusChange: (status) => {
 *     console.log('FHEVM status:', status);
 *   }
 * });
 * ```
 */
export async function createFhevmClient(
  config: FhevmClientConfig | string
): Promise<FhevmClient> {
  let clientConfig: FhevmClientConfig;

  // If config is a string, treat it as a network preset name
  if (typeof config === "string") {
    const preset = getNetworkPreset(config);
    clientConfig = {
      provider: preset.rpcUrl,
      mockChains: preset.mockChains,
    };
  } else {
    clientConfig = config;
  }

  const client = new FhevmClient(clientConfig);
  await client.initialize();
  return client;
}

