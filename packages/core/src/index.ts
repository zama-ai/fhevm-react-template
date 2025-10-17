import { ethers } from "ethers";
import { createFhevmInstance } from "./utils/fhevm-instance";
import { CloakEncryption } from "./encryption";
import { CloakDecryption } from "./decryption";
import { CloakContract } from "./utils/contract";
import { CloakStorage } from "./utils/storage";
import { 
  FhevmSDKConfig, 
  FhevmInstance, 
  ChainConfig,
  ERROR_CODES,
  StorageAdapter
} from "./types";

export class CloakSDKError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message?: string, cause?: unknown) {
    super(message);
    this.code = code;
    this.name = "CloakSDKError";
    this.cause = cause;
  }
}

export class CloakSDK {
  private instance: FhevmInstance | undefined;
  private config: FhevmSDKConfig | undefined;
  private status: "idle" | "loading" | "ready" | "error" = "idle";
  private error: CloakSDKError | undefined;
  private encryption: CloakEncryption | undefined;
  private decryption: CloakDecryption | undefined;
  private contract: CloakContract | undefined;
  private storage: CloakStorage;

  constructor(storageAdapter?: StorageAdapter) {
    this.storage = new CloakStorage(storageAdapter);
  }

  /**
   * Initialize the Cloak SDK with provider and configuration
   */
  async initialize(config: FhevmSDKConfig): Promise<void> {
    try {
      this.config = config;
      this.status = "loading";
      this.error = undefined;

      // Validate provider
      if (!config.provider) {
        throw new CloakSDKError(ERROR_CODES.INVALID_PROVIDER, "Provider is required");
      }

      // Create FHEVM instance
      this.instance = await createFhevmInstance({
        provider: config.provider,
        mockChains: config.mockChains,
        signal: config.signal,
        onStatusChange: config.onStatusChange,
      });

      // Initialize encryption and decryption modules
      this.encryption = new CloakEncryption(this.instance);
      this.decryption = new CloakDecryption(this.instance);
      this.contract = new CloakContract(this.instance);

      this.status = "ready";
    } catch (error) {
      this.status = "error";
      this.error = error instanceof CloakSDKError 
        ? error 
        : new CloakSDKError(ERROR_CODES.SDK_NOT_INITIALIZED, "Failed to initialize SDK", error);
      throw this.error;
    }
  }

  /**
   * Get the current status of the SDK
   */
  getStatus(): "idle" | "loading" | "ready" | "error" {
    return this.status;
  }

  /**
   * Get the current error if any
   */
  getError(): CloakSDKError | undefined {
    return this.error;
  }

  /**
   * Check if the SDK is ready to use
   */
  isReady(): boolean {
    return this.status === "ready" && this.instance !== undefined;
  }

  /**
   * Get the FHEVM instance (for advanced usage)
   */
  getInstance(): FhevmInstance | undefined {
    return this.instance;
  }

  /**
   * Get the encryption module
   */
  getEncryption(): CloakEncryption {
    if (!this.encryption) {
      throw new CloakSDKError(ERROR_CODES.SDK_NOT_INITIALIZED, "SDK not initialized");
    }
    return this.encryption;
  }

  /**
   * Get the decryption module
   */
  getDecryption(): CloakDecryption {
    if (!this.decryption) {
      throw new CloakSDKError(ERROR_CODES.SDK_NOT_INITIALIZED, "SDK not initialized");
    }
    return this.decryption;
  }

  /**
   * Get the contract interaction module
   */
  getContract(): CloakContract {
    if (!this.contract) {
      throw new CloakSDKError(ERROR_CODES.SDK_NOT_INITIALIZED, "SDK not initialized");
    }
    return this.contract;
  }

  /**
   * Get the storage module
   */
  getStorage(): CloakStorage {
    return this.storage;
  }

  /**
   * Refresh/reinitialize the SDK
   */
  async refresh(): Promise<void> {
    if (this.config) {
      await this.initialize(this.config);
    }
  }

  /**
   * Get chain information from provider
   */
  async getChainInfo(): Promise<ChainConfig> {
    if (!this.config?.provider) {
      throw new CloakSDKError(ERROR_CODES.INVALID_PROVIDER, "No provider configured");
    }

    try {
      let provider: ethers.JsonRpcProvider;
      
      if (typeof this.config.provider === "string") {
        provider = new ethers.JsonRpcProvider(this.config.provider);
      } else {
        // For EIP-1193 providers, we need to get the RPC URL differently
        // This is a simplified approach - in practice you might need to handle this differently
        throw new CloakSDKError(ERROR_CODES.INVALID_PROVIDER, "EIP-1193 providers not supported for chain info retrieval");
      }

      const network = await provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        rpcUrl: typeof this.config.provider === "string" ? this.config.provider : undefined,
        name: network.name,
      };
    } catch (error) {
      throw new CloakSDKError(ERROR_CODES.NETWORK_ERROR, "Failed to get chain info", error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.instance = undefined;
    this.encryption = undefined;
    this.decryption = undefined;
    this.contract = undefined;
    this.status = "idle";
    this.error = undefined;
  }
}

// Export all types and utilities
export * from "./types";
export * from "./encryption";
export * from "./decryption";
export * from "./utils/contract";
export * from "./utils/storage";
export * from "./utils/fhevm-instance";
export * from "./utils/validation";
export * from "./utils/abi-helpers";
