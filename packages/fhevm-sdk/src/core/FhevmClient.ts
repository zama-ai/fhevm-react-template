import { Eip1193Provider } from "ethers";
import { FhevmInstance } from "../fhevmTypes";
import { createFhevmInstance, FhevmAbortError } from "../internal/fhevm";
import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import { FhevmError, ErrorCodes, createError } from "./errors";

/**
 * Configuration options for creating an FHEVM client
 */
export interface FhevmClientConfig {
  /**
   * Ethereum provider (EIP-1193 compatible) or RPC URL
   */
  provider: Eip1193Provider | string;

  /**
   * Optional mock chain configurations for testing
   * Maps chainId to RPC URL
   * 
   * @example
   * ```typescript
   * {
   *   31337: "http://localhost:8545"
   * }
   * ```
   */
  mockChains?: Record<number, string>;

  /**
   * Optional abort signal to cancel initialization
   */
  signal?: AbortSignal;

  /**
   * Optional callback for status updates during initialization
   */
  onStatusChange?: (status: FhevmClientStatus) => void;
}

/**
 * Status of the FHEVM client during initialization
 */
export type FhevmClientStatus =
  | "idle"
  | "sdk-loading"
  | "sdk-loaded"
  | "sdk-initializing"
  | "sdk-initialized"
  | "creating"
  | "ready"
  | "error";

/**
 * Result of an encryption operation
 */
export interface EncryptionResult {
  /**
   * Encrypted handles (one per encrypted value)
   */
  handles: Uint8Array[];

  /**
   * Input proof for verification
   */
  inputProof: Uint8Array;
}

/**
 * Request for decryption
 */
export interface DecryptionRequest {
  /**
   * The encrypted handle to decrypt
   */
  handle: string;

  /**
   * The contract address that owns this encrypted value
   */
  contractAddress: `0x${string}`;
}

// Re-export error utilities for convenience
export { FhevmError, ErrorCodes, createError } from "./errors";

/**
 * FhevmClient - Core client for FHEVM operations
 * 
 * This class provides a framework-agnostic interface for working with
 * Fully Homomorphic Encryption on Ethereum. It handles:
 * - Instance initialization and management
 * - Encryption of values
 * - Decryption of encrypted handles
 * 
 * @example
 * ```typescript
 * // Create and initialize a client
 * const client = new FhevmClient({
 *   provider: window.ethereum,
 *   mockChains: { 31337: "http://localhost:8545" }
 * });
 * 
 * await client.initialize();
 * 
 * // Encrypt a value
 * const encrypted = await client.createEncryptedInput(
 *   "0x...", // contract address
 *   "0x..."  // user address
 * );
 * encrypted.add32(42);
 * const result = await encrypted.encrypt();
 * ```
 */
export class FhevmClient {
  private instance: FhevmInstance | undefined;
  private config: FhevmClientConfig;
  private status: FhevmClientStatus = "idle";
  private initializationPromise: Promise<void> | undefined;
  private abortController: AbortController | undefined;

  /**
   * Creates a new FHEVM client
   * 
   * @param config - Configuration options
   */
  constructor(config: FhevmClientConfig) {
    this.config = config;
    this.abortController = new AbortController();
  }

  /**
   * Initialize the FHEVM client
   * 
   * This method must be called before using any encryption/decryption features.
   * It loads the FHEVM SDK, initializes it, and creates an instance.
   * 
   * @throws {FhevmError} If initialization fails
   * @throws {FhevmAbortError} If initialization is aborted
   * 
   * @example
   * ```typescript
   * const client = new FhevmClient({ provider: window.ethereum });
   * await client.initialize();
   * ```
   */
  async initialize(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.instance && this.status === "ready") {
      return Promise.resolve();
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      this.updateStatus("sdk-loading");

      const signal = this.config.signal || this.abortController!.signal;

      this.instance = await createFhevmInstance({
        provider: this.config.provider,
        mockChains: this.config.mockChains,
        signal,
        onStatusChange: (status) => {
          this.updateStatus(status as FhevmClientStatus);
        },
      });

      this.updateStatus("ready");
    } catch (error) {
      this.updateStatus("error");
      
      if (error instanceof FhevmAbortError) {
        throw error;
      }

      throw new FhevmError(
        "INITIALIZATION_FAILED",
        "Failed to initialize FHEVM client",
        "Please check your provider and network configuration",
        { cause: error }
      );
    }
  }

  private updateStatus(status: FhevmClientStatus): void {
    this.status = status;
    if (this.config.onStatusChange) {
      this.config.onStatusChange(status);
    }
  }

  /**
   * Get the current FHEVM instance
   * 
   * @returns The FHEVM instance, or undefined if not initialized
   */
  getInstance(): FhevmInstance | undefined {
    return this.instance;
  }

  /**
   * Get the current status of the client
   * 
   * @returns The current status
   */
  getStatus(): FhevmClientStatus {
    return this.status;
  }

  /**
   * Check if the client is ready for encryption/decryption
   * 
   * @returns True if the client is ready
   */
  isReady(): boolean {
    return this.status === "ready" && this.instance !== undefined;
  }

  /**
   * Create an encrypted input builder
   * 
   * @param contractAddress - The contract address
   * @param userAddress - The user address
   * @returns An encrypted input builder
   * 
   * @throws {FhevmError} If the client is not initialized
   * 
   * @example
   * ```typescript
   * const input = client.createEncryptedInput(
   *   "0x1234...",
   *   "0x5678..."
   * );
   * input.add32(42);
   * input.add64(1000n);
   * const result = await input.encrypt();
   * ```
   */
  createEncryptedInput(
    contractAddress: string,
    userAddress: string
  ): RelayerEncryptedInput {
    if (!this.instance) {
      throw createError(
        ErrorCodes.NOT_INITIALIZED,
        "FHEVM client is not initialized"
      );
    }

    return this.instance.createEncryptedInput(
      contractAddress,
      userAddress
    ) as RelayerEncryptedInput;
  }

  /**
   * Abort any ongoing initialization
   * 
   * This will cancel the initialization process if it's still running.
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Dispose of the client and clean up resources
   */
  dispose(): void {
    this.abort();
    this.instance = undefined;
    this.initializationPromise = undefined;
    this.status = "idle";
  }
}

