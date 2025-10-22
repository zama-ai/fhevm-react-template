import { ethers } from 'ethers';
import { FHEVMConfig, FHEVMInstance, StorageInterface } from '../../types';
import { getFHEVMClient } from '../../core/fhevm-client';
import { createEncryptedInput } from '../../core/encryption';
import { createDecryptionSignature, decryptHandles } from '../../core/decryption';

/**
 * Node.js utilities for FHEVM operations
 * Provides server-side FHEVM functionality
 */
export class FHEVMNode {
  private client = getFHEVMClient();
  private instance: FHEVMInstance | undefined;
  private storage: StorageInterface;
  private provider: ethers.JsonRpcProvider | undefined;
  private signer: ethers.Wallet | undefined;

  constructor(storage?: StorageInterface) {
    this.storage = storage || this.createDefaultStorage();
  }

  /**
   * Create default storage implementation
   */
  private createDefaultStorage(): StorageInterface {
    return {
      get: async (_key: string) => {
        // In a real implementation, you might use a database
        return null;
      },
      set: async (key: string, value: string) => {
        // In a real implementation, you might use a database
        console.log(`Storing ${key}: ${value}`);
      },
      remove: async (key: string) => {
        // In a real implementation, you might use a database
        console.log(`Removing ${key}`);
      },
    };
  }

  /**
   * Initialize FHEVM with provider and signer
   */
  async initialize(
    config: FHEVMConfig,
    provider: ethers.JsonRpcProvider,
    signer: ethers.Wallet
  ): Promise<void> {
    this.provider = provider;
    this.signer = signer;

    const fhevmInstance = await this.client.initialize(config);
    
    if (fhevmInstance.status === 'error') {
      throw new Error(fhevmInstance.error || 'Failed to initialize FHEVM');
    }

    this.instance = fhevmInstance;
  }

  /**
   * Encrypt values
   */
  async encrypt(
    contractAddress: string,
    values: (number | bigint | boolean)[]
  ): Promise<any> {
    if (!this.instance?.instance || !this.signer) {
      throw new Error('FHEVM not initialized or signer not provided');
    }

    const userAddress = await this.signer.getAddress();
    const encryptedInput = this.instance.instance.createEncryptedInput(contractAddress, userAddress);
    
    return await createEncryptedInput(encryptedInput, values);
  }

  /**
   * Decrypt handles
   */
  async decrypt(handles: string[], contractAddress: string): Promise<Record<string, any>> {
    if (!this.instance?.instance || !this.signer) {
      throw new Error('FHEVM not initialized or signer not provided');
    }

    const signature = await createDecryptionSignature(
      this.instance.instance,
      [contractAddress],
      this.signer,
      this.storage
    );

    if (!signature) {
      throw new Error('Failed to create decryption signature');
    }

    return await decryptHandles(this.instance.instance, handles, contractAddress, signature);
  }

  /**
   * Get current instance
   */
  getInstance(): FHEVMInstance | undefined {
    return this.instance;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.instance?.status === 'ready';
  }
}

/**
 * Create FHEVM Node instance
 */
export function createFHEVMNode(storage?: StorageInterface): FHEVMNode {
  return new FHEVMNode(storage);
}

  /**
   * Helper function to create provider and signer
   */
  export function createProviderAndSigner(
    rpcUrl: string,
    privateKey: string
  ): { provider: ethers.JsonRpcProvider; signer: ethers.Wallet } {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    
    return { provider, signer };
  }
