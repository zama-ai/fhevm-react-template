import { FhevmInstance } from "../fhevmTypes.js";
import { FhevmDecryptionSignature } from "../FhevmDecryptionSignature.js";
import { GenericStringStorage } from "../storage/GenericStringStorage.js";
import { ethers } from "ethers";

/**
 * A single decryption request.
 * @public
 */
export interface FHEDecryptRequest {
  /** The encrypted handle to decrypt */
  handle: string;
  /** The contract address that owns this handle */
  contractAddress: `0x${string}`;
}

/**
 * Result of a decryption operation, mapping handles to their decrypted values.
 * @public
 */
export type DecryptResult = Record<string, string | bigint | boolean>;

/**
 * Decryption manager for FHEVM operations.
 * 
 * This class provides a framework-agnostic interface for decrypting FHE-encrypted
 * data from smart contracts. It handles the EIP-712 signature creation and caching,
 * making the decryption process seamless for developers.
 * 
 * @remarks
 * The DecryptionManager automatically manages decryption signatures and caches them
 * for improved performance. Users only need to sign once per session for each set
 * of contract addresses.
 * 
 * @example
 * Basic usage:
 * ```typescript
 * const manager = new DecryptionManager(
 *   fhevmInstance,
 *   signer,
 *   storage,
 *   11155111 // Sepolia chain ID
 * );
 * 
 * const results = await manager.decrypt([
 *   { handle: '0x...', contractAddress: '0x...' }
 * ]);
 * 
 * console.log('Decrypted value:', results['0x...']);
 * ```
 * 
 * @example
 * With multiple handles:
 * ```typescript
 * const results = await manager.decrypt([
 *   { handle: '0xhandle1', contractAddress: '0xcontract1' },
 *   { handle: '0xhandle2', contractAddress: '0xcontract1' },
 *   { handle: '0xhandle3', contractAddress: '0xcontract2' }
 * ]);
 * 
 * Object.entries(results).forEach(([handle, value]) => {
 *   console.log(`${handle}: ${value}`);
 * });
 * ```
 * 
 * @public
 */
export class DecryptionManager {
  /**
   * Creates a new DecryptionManager instance.
   * 
   * @param instance - The initialized FHEVM instance
   * @param signer - The user's ethers signer (for EIP-712 signatures)
   * @param signatureStorage - Storage for caching decryption signatures
   * @param chainId - The blockchain chain ID
   * 
   * @throws {TypeError} If any required parameter is missing
   */
  constructor(
    private readonly instance: FhevmInstance,
    private readonly signer: ethers.JsonRpcSigner,
    private readonly signatureStorage: GenericStringStorage,
    private readonly chainId: number
  ) {
    if (!instance) {
      throw new TypeError('DecryptionManager: instance is required');
    }
    if (!signer) {
      throw new TypeError('DecryptionManager: signer is required');
    }
    if (!signatureStorage) {
      throw new TypeError('DecryptionManager: signatureStorage is required');
    }
    if (!chainId) {
      throw new TypeError('DecryptionManager: chainId is required');
    }
  }

  /**
   * Decrypts multiple encrypted handles.
   * 
   * @param requests - Array of decryption requests
   * @returns Promise resolving to a mapping of handles to their decrypted values
   * 
   * @throws {Error} If decryption fails or signature creation fails
   * 
   * @remarks
   * This method automatically handles:
   * - Loading or creating EIP-712 signatures
   * - Caching signatures for future use
   * - Batching multiple decryption requests
   * - Converting results to appropriate JavaScript types
   * 
   * The first time you decrypt, the user will be prompted to sign an EIP-712 message.
   * This signature is cached and reused for subsequent decryptions.
   * 
   * @example
   * Decrypt a single value:
   * ```typescript
   * const results = await manager.decrypt([
   *   { handle: '0x123...', contractAddress: '0xabc...' }
   * ]);
   * 
   * const value = results['0x123...'];
   * if (typeof value === 'bigint') {
   *   console.log('Count:', value.toString());
   * }
   * ```
   * 
   * @example
   * Decrypt multiple values:
   * ```typescript
   * const results = await manager.decrypt([
   *   { handle: counterHandle, contractAddress: contractAddr },
   *   { handle: balanceHandle, contractAddress: contractAddr }
   * ]);
   * 
   * console.log('Counter:', results[counterHandle]);
   * console.log('Balance:', results[balanceHandle]);
   * ```
   */
  async decrypt(
    requests: FHEDecryptRequest[]
  ): Promise<DecryptResult> {
    if (!this.canDecrypt(requests)) {
      throw new Error('DecryptionManager: Cannot decrypt - invalid parameters or empty requests');
    }

    try {
      // Extract unique contract addresses
      const uniqueAddresses = Array.from(
        new Set(requests.map(r => r.contractAddress))
      );

      // Load or create decryption signature
      const signature = await this.loadOrCreateSignature(uniqueAddresses);

      if (!signature) {
        throw new Error('Failed to create or load decryption signature');
      }

      // Convert requests to mutable format for FHEVM API
      const mutableReqs = requests.map(r => ({
        handle: r.handle,
        contractAddress: r.contractAddress
      }));

      // Execute decryption
      const results = await this.instance.userDecrypt(
        mutableReqs,
        signature.privateKey,
        signature.publicKey,
        signature.signature,
        signature.contractAddresses,
        signature.userAddress,
        signature.startTimestamp,
        signature.durationDays
      );

      return results;
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Checks if decryption is possible with the given requests.
   * 
   * @param requests - Array of decryption requests to validate
   * @returns True if decryption is possible, false otherwise
   * 
   * @example
   * ```typescript
   * const requests = [
   *   { handle: '0x...', contractAddress: '0x...' }
   * ];
   * 
   * if (manager.canDecrypt(requests)) {
   *   const results = await manager.decrypt(requests);
   * } else {
   *   console.log('Cannot decrypt: missing parameters or invalid requests');
   * }
   * ```
   */
  canDecrypt(requests: FHEDecryptRequest[] | undefined): boolean {
    return Boolean(
      this.instance &&
      this.signer &&
      this.signatureStorage &&
      requests &&
      requests.length > 0
    );
  }

  /**
   * Gets the chain ID this manager is configured for.
   * 
   * @returns The chain ID
   */
  getChainId(): number {
    return this.chainId;
  }

  /**
   * Loads an existing decryption signature from storage or creates a new one.
   * 
   * @param addresses - Contract addresses to include in the signature
   * @returns Promise resolving to the decryption signature
   * 
   * @throws {Error} If signature creation fails
   * 
   * @remarks
   * This method is called automatically by {@link decrypt} and handles:
   * - Checking storage for existing valid signatures
   * - Prompting the user to sign if no valid signature exists
   * - Storing the new signature for future use
   * 
   * @internal
   */
  private async loadOrCreateSignature(
    addresses: string[]
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      return await FhevmDecryptionSignature.loadOrSign(
        this.instance,
        addresses as `0x${string}`[],
        this.signer,
        this.signatureStorage
      );
    } catch (error) {
      throw new Error(
        `Failed to load or create decryption signature: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

