import { Eip1193Provider } from "ethers";
import type { FhevmInstance } from "../fhevmTypes.js";
import { createFhevmInstance } from "../internal/fhevm.js";

/**
 * Status of the FHEVM client initialization process.
 * @public
 */
export type FhevmClientStatus = "idle" | "loading" | "ready" | "error";

/**
 * Configuration options for FhevmClient.
 * @public
 */
export interface FhevmClientConfig {
  /** Web3 provider (EIP-1193 or RPC URL) */
  provider: string | Eip1193Provider;
  /** Blockchain chain ID */
  chainId?: number;
  /** Mock chain RPC URLs for local development */
  mockChains?: Record<number, string>;
  /** Enable/disable client (default: true) */
  enabled?: boolean;
}

/**
 * Event handler for status changes.
 * @public
 */
export type FhevmClientStatusHandler = (status: FhevmClientStatus) => void;

/**
 * Event handler for error events.
 * @public
 */
export type FhevmClientErrorHandler = (error: Error) => void;

/**
 * FHEVM Client for managing FHEVM instance lifecycle.
 * 
 * This class provides a framework-agnostic way to create and manage FHEVM instances.
 * It handles initialization, cleanup, and status tracking without any React dependencies.
 * 
 * @remarks
 * The FhevmClient manages a single FHEVM instance at a time. When you change the provider
 * or chain ID, the old instance is automatically cleaned up and a new one is created.
 * 
 * @example
 * Basic usage:
 * ```typescript
 * const client = new FhevmClient({
 *   provider: window.ethereum,
 *   chainId: 11155111
 * });
 * 
 * client.on('statusChange', (status) => {
 *   console.log('Status:', status);
 * });
 * 
 * try {
 *   const instance = await client.initialize();
 *   console.log('FHEVM instance ready:', instance);
 * } catch (error) {
 *   console.error('Failed to initialize:', error);
 * }
 * ```
 * 
 * @example
 * With local development:
 * ```typescript
 * const client = new FhevmClient({
 *   provider: 'http://localhost:8545',
 *   chainId: 31337,
 *   mockChains: { 31337: 'http://localhost:8545' }
 * });
 * 
 * await client.initialize();
 * ```
 * 
 * @example
 * Cleanup when done:
 * ```typescript
 * // When you're done with the client
 * client.destroy();
 * ```
 * 
 * @public
 */
export class FhevmClient {
  private instance: FhevmInstance | null = null;
  private status: FhevmClientStatus = "idle";
  private error: Error | null = null;
  private abortController: AbortController | null = null;
  private config: FhevmClientConfig;
  private statusHandlers: Set<FhevmClientStatusHandler> = new Set();
  private errorHandlers: Set<FhevmClientErrorHandler> = new Set();

  /**
   * Creates a new FhevmClient instance.
   * 
   * @param config - Configuration options
   * 
   * @example
   * ```typescript
   * const client = new FhevmClient({
   *   provider: window.ethereum,
   *   chainId: 11155111,
   *   enabled: true
   * });
   * ```
   */
  constructor(config: FhevmClientConfig) {
    this.config = { ...config, enabled: config.enabled ?? true };
  }

  /**
   * Initializes the FHEVM instance.
   * 
   * @returns Promise resolving to the initialized FHEVM instance
   * @throws {Error} If initialization fails or client is disabled
   * 
   * @remarks
   * This method is idempotent - calling it multiple times will cancel previous
   * initialization attempts and start a new one.
   * 
   * @example
   * ```typescript
   * try {
   *   const instance = await client.initialize();
   *   // Use instance for encryption/decryption
   * } catch (error) {
   *   console.error('Initialization failed:', error);
   * }
   * ```
   */
  async initialize(): Promise<FhevmInstance> {
    // Check if enabled
    if (this.config.enabled === false) {
      throw new Error("FhevmClient is disabled");
    }

    // Cancel any previous initialization
    this.cancelCurrentOperation();

    // Create new abort controller
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // Update status
    this.setStatus("loading");
    this.error = null;

    try {
      // Create FHEVM instance
      const instance = await createFhevmInstance({
        provider: this.config.provider as any,
        mockChains: this.config.mockChains,
        signal,
        onStatusChange: (s) => {
          console.log(`[FhevmClient] createFhevmInstance status: ${s}`);
        },
      });

      // Check if aborted during creation
      if (signal.aborted) {
        throw new Error("Initialization was cancelled");
      }

      // Store instance
      this.instance = instance;
      this.setStatus("ready");

      return instance;
    } catch (error) {
      // Don't set error state if we were cancelled
      if (!signal.aborted) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.error = err;
        this.setStatus("error");
        this.emitError(err);
      }
      throw error;
    }
  }

  /**
   * Gets the current FHEVM instance.
   * 
   * @returns The FHEVM instance, or null if not initialized
   * 
   * @example
   * ```typescript
   * const instance = client.getInstance();
   * if (instance) {
   *   // Use instance
   * } else {
   *   console.log('Not initialized yet');
   * }
   * ```
   */
  getInstance(): FhevmInstance | null {
    return this.instance;
  }

  /**
   * Gets the current initialization status.
   * 
   * @returns The current status
   * 
   * @example
   * ```typescript
   * const status = client.getStatus();
   * if (status === 'ready') {
   *   // Client is ready to use
   * }
   * ```
   */
  getStatus(): FhevmClientStatus {
    return this.status;
  }

  /**
   * Gets the last error that occurred.
   * 
   * @returns The error, or null if no error
   * 
   * @example
   * ```typescript
   * const error = client.getError();
   * if (error) {
   *   console.error('Last error:', error.message);
   * }
   * ```
   */
  getError(): Error | null {
    return this.error;
  }

  /**
   * Checks if the client is currently initializing.
   * 
   * @returns True if loading, false otherwise
   */
  isLoading(): boolean {
    return this.status === "loading";
  }

  /**
   * Checks if the client is ready to use.
   * 
   * @returns True if ready, false otherwise
   */
  isReady(): boolean {
    return this.status === "ready" && this.instance !== null;
  }

  /**
   * Updates the client configuration and re-initializes if needed.
   * 
   * @param config - New configuration (partial update)
   * @returns Promise resolving to the new instance
   * 
   * @remarks
   * This will cancel any ongoing initialization and start a new one with
   * the updated configuration.
   * 
   * @example
   * Switch to a different network:
   * ```typescript
   * await client.updateConfig({
   *   chainId: 1, // Switch to mainnet
   *   provider: newProvider
   * });
   * ```
   */
  async updateConfig(config: Partial<FhevmClientConfig>): Promise<FhevmInstance> {
    this.config = { ...this.config, ...config };
    return this.initialize();
  }

  /**
   * Refreshes the FHEVM instance by re-initializing.
   * 
   * @returns Promise resolving to the new instance
   * 
   * @remarks
   * This is useful when you need to force a re-initialization without
   * changing the configuration.
   * 
   * @example
   * ```typescript
   * // Force refresh the instance
   * await client.refresh();
   * ```
   */
  async refresh(): Promise<FhevmInstance> {
    return this.initialize();
  }

  /**
   * Destroys the client and cleans up all resources.
   * 
   * @remarks
   * After calling this method, the client cannot be used anymore.
   * You must create a new FhevmClient instance if you need one again.
   * 
   * @example
   * ```typescript
   * // Clean up when done
   * client.destroy();
   * ```
   */
  destroy(): void {
    this.cancelCurrentOperation();
    this.instance = null;
    this.error = null;
    this.setStatus("idle");
    this.statusHandlers.clear();
    this.errorHandlers.clear();
  }

  /**
   * Registers a status change event handler.
   * 
   * @param event - The event type (currently only 'statusChange')
   * @param handler - The handler function
   * 
   * @example
   * ```typescript
   * client.on('statusChange', (status) => {
   *   console.log('Status changed:', status);
   * });
   * ```
   */
  on(event: "statusChange", handler: FhevmClientStatusHandler): void;
  on(event: "error", handler: FhevmClientErrorHandler): void;
  on(event: string, handler: any): void {
    if (event === "statusChange") {
      this.statusHandlers.add(handler);
    } else if (event === "error") {
      this.errorHandlers.add(handler);
    }
  }

  /**
   * Unregisters a status change event handler.
   * 
   * @param event - The event type (currently only 'statusChange')
   * @param handler - The handler function to remove
   * 
   * @example
   * ```typescript
   * const handler = (status) => console.log(status);
   * client.on('statusChange', handler);
   * // Later...
   * client.off('statusChange', handler);
   * ```
   */
  off(event: "statusChange", handler: FhevmClientStatusHandler): void;
  off(event: "error", handler: FhevmClientErrorHandler): void;
  off(event: string, handler: any): void {
    if (event === "statusChange") {
      this.statusHandlers.delete(handler);
    } else if (event === "error") {
      this.errorHandlers.delete(handler);
    }
  }

  /**
   * Cancels any current initialization operation.
   * @private
   */
  private cancelCurrentOperation(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Updates the status and notifies listeners.
   * @private
   */
  private setStatus(status: FhevmClientStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusHandlers.forEach((handler) => {
        try {
          handler(status);
        } catch (error) {
          console.error("Error in status change handler:", error);
        }
      });
    }
  }

  /**
   * Emits an error event to listeners.
   * @private
   */
  private emitError(error: Error): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (err) {
        console.error("Error in error handler:", err);
      }
    });
  }
}

