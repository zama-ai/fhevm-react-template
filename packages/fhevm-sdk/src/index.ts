 bounty-submission-october-2025
// Core exports
export { getFHEVMClient, createFHEVMClient } from './core/fhevm-client';
export { createEncryptedInput, encryptSingleValue, EncryptionUtils } from './core/encryption';
export { createDecryptionSignature, decryptHandles, DecryptionUtils } from './core/decryption';

// Types
export type {
  FHEVMConfig,
  FHEVMInstance,
  EncryptedInput,
  EncryptedResult,
  DecryptionSignature,
  FHEVMClient,
  StorageInterface,
  WalletProvider,
  FHEVMHookReturn,
  FHEVMComponentProps,
} from './types';

// React exports
export { useFHEVM, useFHEVMWithConfig } from './adapters/react/useFHEVM';
export { FHEVMProvider, useFHEVMContext, withFHEVM } from './adapters/react/FHEVMProvider';
export { EncryptButton, DecryptButton } from './adapters/react/components/EncryptButton';

// Vue exports
export { useFHEVM as useFHEVMVue, useFHEVMWithConfig as useFHEVMWithConfigVue } from './adapters/vue/useFHEVM';

// Node.js exports
export { FHEVMNode, createFHEVMNode, createProviderAndSigner } from './adapters/node/fhevm-node';

// Utility functions
export const SUPPORTED_CHAINS = [31337, 11155111]; // Hardhat, Sepolia

/**
 * Check if chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return SUPPORTED_CHAINS.includes(chainId);
}

/**
 * Get supported chains
 */
export function getSupportedChains(): number[] {
  return [...SUPPORTED_CHAINS];
}

/**
 * Create default FHEVM config
 */
export function createDefaultConfig(chainId: number) {
  return {
    chainId,
    mockChains: [31337],
  };
}

/**
 * Create Sepolia config
 */
export function createSepoliaConfig(rpcUrl?: string) {
  return {
    chainId: 11155111,
    rpcUrl,
    mockChains: [31337],
  };
}

/**
 * Create Hardhat config
 */
export function createHardhatConfig(rpcUrl = 'http://127.0.0.1:8545') {
  return {
    chainId: 31337,
    rpcUrl,
    mockChains: [31337],
  };
}
export * from "./core/index";
export * from "./storage/index";
export * from "./fhevmTypes";
export * from "./FhevmDecryptionSignature";
export * from "./react/index";

main
