/**
 * Framework-agnostic FHEVM client
 */

import { FhevmInstance } from "../fhevmTypes";
import { createFhevmInstance } from "../internal/fhevm";
import { FhevmStatus } from "../types/index";
import { validateFhevmConfig } from "./config";
import { FhevmInitializationError } from "../utils/errors";

export interface FhevmClientOptions {
  provider: any;
  chainId?: number;
  mockChains?: Record<number, string>;
  onStatusChange?: (status: FhevmStatus) => void;
}

/**
 * Core FHEVM client (framework-agnostic)
 * 
 * This class provides the core FHEVM functionality without any framework dependencies.
 * It can be used directly in Node.js, browser, or wrapped by framework-specific adapters.
 * 
 * @example
 * ```typescript
 * // Create client
 * const client = new FhevmClient({
 *   provider: window.ethereum,
 *   chainId: 31337,
 *   mockChains: { 31337: "http://localhost:8545" }
 * });
 * 
 * // Initialize
 * const instance = await client.initialize();
 * 
 * // Use instance for encryption/decryption
 * console.log('Status:', client.getStatus());
 * 
 * // Cleanup
 * client.dispose();
 * ```
 */
export class FhevmClient {
  private instance?: FhevmInstance;
  private status: FhevmStatus = "idle";
  private error?: Error;
  private abortController?: AbortController;
  private options: FhevmClientOptions;

  /**
   * Create a new FHEVM client
   * 
   * @param options - Client configuration options
   * @throws {FhevmConfigurationError} If configuration is invalid
   */
  constructor(options: FhevmClientOptions) {
    // Validate configuration on construction
    validateFhevmConfig({
      provider: options.provider,
      chainId: options.chainId,
      mockChains: options.mockChains,
    });

    this.options = options;
  }

  /**
   * Initialize FHEVM instance
   * 
   * This method creates and initializes the FHEVM instance. It should be called
   * once before using any encryption or decryption features.
   * 
   * @returns Promise resolving to the initialized FHEVM instance
   * @throws {FhevmInitializationError} If initialization fails
   * 
   * @example
   * ```typescript
   * try {
   *   const instance = await client.initialize();
   *   console.log('Initialized successfully');
   * } catch (error) {
   *   console.error('Initialization failed:', error);
   * }
   * ```
   */
  async initialize(): Promise<FhevmInstance> {
    // Return existing instance if already initialized
    if (this.instance && this.status === "ready") {
      return this.instance;
    }

    // Cleanup any previous initialization attempt
    if (this.abortController) {
      this.abortController.abort();
    }

    this.setStatus("loading");
    this.abortController = new AbortController();
    this.error = undefined;

    try {
      const instance = await createFhevmInstance({
        signal: this.abortController.signal,
        provider: this.options.provider,
        mockChains: this.options.mockChains,
        onStatusChange: (s) => {
          console.log(`[FhevmClient] Status: ${s}`);
        },
      });

      // Check if aborted during initialization
      if (this.abortController.signal.aborted) {
        throw new FhevmInitializationError("Initialization was aborted");
      }

      this.instance = instance;
      this.setStatus("ready");
      return instance;
    } catch (error) {
      const wrappedError = new FhevmInitializationError(
        "Failed to initialize FHEVM instance",
        error as Error
      );
      this.error = wrappedError;
      this.setStatus("error");
      throw wrappedError;
    }
  }

  /**
   * Get current FHEVM instance
   * 
   * Returns the instance if initialized, undefined otherwise.
   * Use `initialize()` first to create the instance.
   * 
   * @returns The FHEVM instance or undefined
   */
  getInstance(): FhevmInstance | undefined {
    return this.instance;
  }

  /**
   * Get current client status
   * 
   * @returns Current status: "idle" | "loading" | "ready" | "error"
   */
  getStatus(): FhevmStatus {
    return this.status;
  }

  /**
   * Get error if any
   * 
   * @returns Error instance or undefined
   */
  getError(): Error | undefined {
    return this.error;
  }

  /**
   * Check if client is ready to use
   * 
   * @returns True if instance is initialized and ready
   */
  isReady(): boolean {
    return this.status === "ready" && this.instance !== undefined;
  }

  /**
   * Dispose and cleanup resources
   * 
   * Call this method when you're done using the client to clean up resources.
   * After disposal, you need to call `initialize()` again to use the client.
   * 
   * @example
   * ```typescript
   * // When component unmounts or app closes
   * client.dispose();
   * ```
   */
  dispose(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
    this.instance = undefined;
    this.error = undefined;
    this.setStatus("idle");
  }

  /**
   * Update status and notify listeners
   */
  private setStatus(status: FhevmStatus): void {
    this.status = status;
    this.options.onStatusChange?.(status);
  }

  /**
   * Re-initialize the client
   * 
   * This is a convenience method that disposes the current instance
   * and initializes a new one.
   * 
   * @returns Promise resolving to the new FHEVM instance
   */
  async reinitialize(): Promise<FhevmInstance> {
    this.dispose();
    return this.initialize();
  }

  /**
   * Get client configuration
   * 
   * @returns Current client options
   */
  getOptions(): Readonly<FhevmClientOptions> {
    return { ...this.options };
  }
}

