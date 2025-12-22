/**
 * Configuration validation and utilities
 */

import { FhevmConfig } from "../types/index";
import { FhevmConfigurationError } from "../utils/errors";

/**
 * Validate FHEVM configuration
 * 
 * @param config - Configuration to validate
 * @throws {FhevmConfigurationError} If configuration is invalid
 * 
 * @example
 * ```typescript
 * try {
 *   validateFhevmConfig({ provider: window.ethereum, chainId: 31337 });
 * } catch (error) {
 *   console.error('Invalid config:', error.message);
 * }
 * ```
 */
export function validateFhevmConfig(config: Partial<FhevmConfig>): void {
  if (!config.provider) {
    throw new FhevmConfigurationError("Provider is required");
  }

  if (config.chainId !== undefined) {
    if (typeof config.chainId !== "number") {
      throw new FhevmConfigurationError(
        `Invalid chainId type: expected number, got ${typeof config.chainId}`
      );
    }

    if (config.chainId < 0) {
      throw new FhevmConfigurationError(
        `Invalid chainId: ${config.chainId} (must be non-negative)`
      );
    }
  }

  if (config.mockChains !== undefined) {
    if (typeof config.mockChains !== "object" || config.mockChains === null) {
      throw new FhevmConfigurationError(
        "Invalid mockChains: must be an object"
      );
    }

    // Validate each mock chain entry
    for (const [chainId, rpcUrl] of Object.entries(config.mockChains)) {
      const numChainId = Number(chainId);
      if (isNaN(numChainId) || numChainId < 0) {
        throw new FhevmConfigurationError(
          `Invalid mock chain ID: ${chainId} (must be a non-negative number)`
        );
      }

      if (typeof rpcUrl !== "string" || rpcUrl.length === 0) {
        throw new FhevmConfigurationError(
          `Invalid RPC URL for chain ${chainId}: must be a non-empty string`
        );
      }
    }
  }
}

/**
 * Merge configuration with defaults
 * 
 * @param config - Partial configuration
 * @returns Complete configuration with defaults applied
 * 
 * @example
 * ```typescript
 * const config = mergeFhevmConfig({
 *   provider: window.ethereum,
 *   chainId: 31337
 * });
 * // Returns: { provider, chainId: 31337, enabled: true, mockChains: undefined }
 * ```
 */
export function mergeFhevmConfig(
  config: Partial<FhevmConfig>
): FhevmConfig {
  return {
    provider: config.provider!,
    chainId: config.chainId,
    enabled: config.enabled ?? true,
    mockChains: config.mockChains,
  };
}

/**
 * Check if configuration has changed
 * 
 * @param oldConfig - Previous configuration
 * @param newConfig - New configuration
 * @returns True if configuration has changed
 */
export function hasConfigChanged(
  oldConfig: Partial<FhevmConfig> | undefined,
  newConfig: Partial<FhevmConfig>
): boolean {
  if (!oldConfig) return true;

  // Check provider (by reference)
  if (oldConfig.provider !== newConfig.provider) return true;

  // Check chainId
  if (oldConfig.chainId !== newConfig.chainId) return true;

  // Check enabled
  if (oldConfig.enabled !== newConfig.enabled) return true;

  // Check mockChains (shallow comparison)
  const oldChains = oldConfig.mockChains;
  const newChains = newConfig.mockChains;

  if (oldChains === newChains) return false;
  if (!oldChains || !newChains) return true;

  const oldKeys = Object.keys(oldChains);
  const newKeys = Object.keys(newChains);

  if (oldKeys.length !== newKeys.length) return true;

  for (const key of oldKeys) {
    if (oldChains[Number(key)] !== newChains[Number(key)]) {
      return true;
    }
  }

  return false;
}

