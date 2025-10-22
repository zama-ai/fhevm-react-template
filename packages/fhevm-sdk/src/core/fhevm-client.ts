// import { ethers } from 'ethers'; // Not used in this file
import { FHEVMConfig, FHEVMInstance, EncryptedInput, DecryptionSignature, FHEVMClient } from '../types';

/**
 * Core FHEVM Client - Framework agnostic
 * Provides the main functionality for FHEVM operations
 */
export class FHEVMClientImpl implements FHEVMClient {
  private instance: any = null;
  private config: FHEVMConfig | null = null;
  private supportedChains: number[] = [31337, 11155111]; // Hardhat, Sepolia

  constructor() {
    this.supportedChains = [31337, 11155111];
  }

  /**
   * Initialize FHEVM instance
   */
  async initialize(config: FHEVMConfig): Promise<FHEVMInstance> {
    try {
      this.config = config;
      
      // Dynamic import to avoid bundling issues
      const { createInstance } = await import('@zama-fhe/relayer-sdk');
      
      const instance = await createInstance({
        chainId: config.chainId,
      } as any);

      this.instance = instance;

      return {
        status: 'ready',
        instance,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create encrypted input for FHE operations
   */
  createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInput {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized');
    }

    return this.instance.createEncryptedInput(contractAddress, userAddress);
  }

  /**
   * Decrypt FHE handles
   */
  async decrypt(
    handles: string[], 
    contractAddress: string, 
    signature: DecryptionSignature
  ): Promise<Record<string, any>> {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized');
    }

    return await this.instance.userDecrypt(
      handles.map(handle => ({ handle, contractAddress })),
      signature.privateKey,
      signature.publicKey,
      signature.signature,
      signature.contractAddresses,
      signature.userAddress,
      signature.startTimestamp,
      signature.durationDays
    );
  }

  /**
   * Check if chain is supported
   */
  isSupported(chainId: number): boolean {
    return this.supportedChains.includes(chainId);
  }

  /**
   * Get list of supported chains
   */
  getSupportedChains(): number[] {
    return [...this.supportedChains];
  }

  /**
   * Get current instance
   */
  getInstance() {
    return this.instance;
  }

  /**
   * Get current config
   */
  getConfig() {
    return this.config;
  }
}

// Singleton instance
let clientInstance: FHEVMClientImpl | null = null;

/**
 * Get or create FHEVM client instance
 */
export function getFHEVMClient(): FHEVMClient {
  if (!clientInstance) {
    clientInstance = new FHEVMClientImpl();
  }
  return clientInstance;
}

/**
 * Create new FHEVM client instance
 */
export function createFHEVMClient(): FHEVMClient {
  return new FHEVMClientImpl();
}
