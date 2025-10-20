/**
 * Network presets for common FHEVM networks
 * 
 * These presets provide default configurations for commonly used networks,
 * making it easier to get started with FHEVM.
 */

/**
 * Network preset configuration
 */
export interface NetworkPreset {
  /**
   * Network name
   */
  name: string;

  /**
   * Chain ID
   */
  chainId: number;

  /**
   * RPC URL
   */
  rpcUrl: string;

  /**
   * Mock chains configuration (if applicable)
   */
  mockChains?: Record<number, string>;

  /**
   * Description of the network
   */
  description?: string;
}

/**
 * Localhost / Hardhat network preset
 * 
 * Use this for local development with Hardhat node
 */
export const LOCALHOST_PRESET: NetworkPreset = {
  name: "localhost",
  chainId: 31337,
  rpcUrl: "http://localhost:8545",
  mockChains: {
    31337: "http://localhost:8545",
  },
  description: "Local Hardhat node for development",
};

/**
 * Sepolia testnet preset
 * 
 * Use this for testing on Sepolia testnet
 */
export const SEPOLIA_PRESET: NetworkPreset = {
  name: "sepolia",
  chainId: 11155111,
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  description: "Sepolia Ethereum testnet",
};

/**
 * All available network presets
 */
export const NETWORK_PRESETS: Record<string, NetworkPreset> = {
  localhost: LOCALHOST_PRESET,
  sepolia: SEPOLIA_PRESET,
};

/**
 * Get a network preset by name
 * 
 * @param name - Network name (e.g., "localhost", "sepolia")
 * @returns Network preset configuration
 * @throws Error if preset not found
 * 
 * @example
 * ```typescript
 * const preset = getNetworkPreset("localhost");
 * const client = await createFhevmClient({
 *   provider: preset.rpcUrl,
 *   mockChains: preset.mockChains
 * });
 * ```
 */
export function getNetworkPreset(name: string): NetworkPreset {
  const preset = NETWORK_PRESETS[name.toLowerCase()];
  if (!preset) {
    throw new Error(
      `Network preset "${name}" not found. Available presets: ${Object.keys(NETWORK_PRESETS).join(", ")}`
    );
  }
  return preset;
}

/**
 * Check if a network preset exists
 * 
 * @param name - Network name
 * @returns True if preset exists
 * 
 * @example
 * ```typescript
 * if (hasNetworkPreset("localhost")) {
 *   const preset = getNetworkPreset("localhost");
 * }
 * ```
 */
export function hasNetworkPreset(name: string): boolean {
  return name.toLowerCase() in NETWORK_PRESETS;
}

/**
 * Get all available network preset names
 * 
 * @returns Array of network preset names
 * 
 * @example
 * ```typescript
 * const networks = getAvailableNetworks();
 * console.log("Available networks:", networks);
 * // Output: ["localhost", "sepolia"]
 * ```
 */
export function getAvailableNetworks(): string[] {
  return Object.keys(NETWORK_PRESETS);
}

