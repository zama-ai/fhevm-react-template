import { DecryptionSignature, StorageInterface } from '../types';

/**
 * Decryption utilities for FHEVM operations
 */
export class DecryptionUtils {
  /**
   * Create decryption signature
   */
  static async createDecryptionSignature(
    instance: any,
    contractAddresses: string[],
    signer: any,
    storage: StorageInterface
  ): Promise<DecryptionSignature | null> {
    try {
      // Load or create decryption signature
      const signature = await this.loadOrCreateSignature(
        instance,
        contractAddresses,
        signer,
        storage
      );

      return signature;
    } catch (error) {
      console.error('Failed to create decryption signature:', error);
      return null;
    }
  }

  /**
   * Load or create decryption signature
   */
  private static async loadOrCreateSignature(
    instance: any,
    contractAddresses: string[],
    signer: any,
    storage: StorageInterface
  ): Promise<DecryptionSignature | null> {
    const userAddress = await signer.getAddress();
    const key = `fhevm-signature-${userAddress}-${contractAddresses.join('-')}`;

    try {
      // Try to load existing signature
      const existingSignature = await storage.get(key);
      if (existingSignature) {
        const parsed = JSON.parse(existingSignature);
        // Check if signature is still valid
        if (this.isSignatureValid(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load existing signature:', error);
    }

    try {
      // Create new signature
      const signature = await instance.generatePublicKey(contractAddresses);
      const publicKey = signature.publicKey;
      const privateKey = signature.privateKey;

      // Sign the public key
      const signatureHash = await signer.signMessage(publicKey);
      
      const decryptionSignature: DecryptionSignature = {
        privateKey,
        publicKey,
        signature: signatureHash,
        contractAddresses,
        userAddress,
        startTimestamp: Math.floor(Date.now() / 1000),
        durationDays: 7, // 7 days validity
      };

      // Store signature
      await storage.set(key, JSON.stringify(decryptionSignature));

      return decryptionSignature;
    } catch (error) {
      console.error('Failed to create new signature:', error);
      return null;
    }
  }

  /**
   * Check if signature is still valid
   */
  private static isSignatureValid(signature: DecryptionSignature): boolean {
    const now = Math.floor(Date.now() / 1000);
    const expiry = signature.startTimestamp + (signature.durationDays * 24 * 60 * 60);
    return now < expiry;
  }

  /**
   * Decrypt handles with signature
   */
  static async decryptHandles(
    instance: any,
    handles: string[],
    contractAddress: string,
    signature: DecryptionSignature
  ): Promise<Record<string, any>> {
    try {
      const result = await instance.userDecrypt(
        handles.map(handle => ({ handle, contractAddress })),
        signature.privateKey,
        signature.publicKey,
        signature.signature,
        signature.contractAddresses,
        signature.userAddress,
        signature.startTimestamp,
        signature.durationDays
      );

      return result;
    } catch (error) {
      console.error('Failed to decrypt handles:', error);
      throw error;
    }
  }
}

/**
 * Helper function to create decryption signature
 */
export async function createDecryptionSignature(
  instance: any,
  contractAddresses: string[],
  signer: any,
  storage: StorageInterface
): Promise<DecryptionSignature | null> {
  return DecryptionUtils.createDecryptionSignature(instance, contractAddresses, signer, storage);
}

/**
 * Helper function to decrypt handles
 */
export async function decryptHandles(
  instance: any,
  handles: string[],
  contractAddress: string,
  signature: DecryptionSignature
): Promise<Record<string, any>> {
  return DecryptionUtils.decryptHandles(instance, handles, contractAddress, signature);
}
