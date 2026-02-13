/**
 * Error codes and helper utilities for FHEVM SDK
 */

/**
 * Error thrown by FHEVM operations
 */
export class FhevmError extends Error {
  constructor(
    public code: string,
    message: string,
    public suggestion?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "FhevmError";
  }

  toString(): string {
    let msg = `${this.name} [${this.code}]: ${this.message}`;
    if (this.suggestion) {
      msg += `\n💡 Suggestion: ${this.suggestion}`;
    }
    return msg;
  }
}

/**
 * Common error codes used throughout the SDK
 */
export const ErrorCodes = {
  // Initialization errors
  NOT_INITIALIZED: "NOT_INITIALIZED",
  INITIALIZATION_FAILED: "INITIALIZATION_FAILED",
  SDK_LOAD_FAILED: "SDK_LOAD_FAILED",
  SDK_INIT_FAILED: "SDK_INIT_FAILED",
  
  // Provider errors
  INVALID_PROVIDER: "INVALID_PROVIDER",
  PROVIDER_NOT_CONNECTED: "PROVIDER_NOT_CONNECTED",
  NETWORK_ERROR: "NETWORK_ERROR",
  
  // Encryption/Decryption errors
  ENCRYPTION_FAILED: "ENCRYPTION_FAILED",
  DECRYPTION_FAILED: "DECRYPTION_FAILED",
  INVALID_HANDLE: "INVALID_HANDLE",
  
  // Address errors
  INVALID_ADDRESS: "INVALID_ADDRESS",
  INVALID_CONTRACT_ADDRESS: "INVALID_CONTRACT_ADDRESS",
  
  // Configuration errors
  INVALID_CONFIG: "INVALID_CONFIG",
  MISSING_MOCK_CHAIN: "MISSING_MOCK_CHAIN",
  
  // Operation errors
  OPERATION_CANCELLED: "OPERATION_CANCELLED",
  OPERATION_TIMEOUT: "OPERATION_TIMEOUT",
} as const;

/**
 * Error suggestions for common error codes
 */
export const ErrorSuggestions: Record<string, string> = {
  [ErrorCodes.NOT_INITIALIZED]:
    "Call client.initialize() before using the client, or use createFhevmClient() which initializes automatically.",
  
  [ErrorCodes.INITIALIZATION_FAILED]:
    "Check your provider connection and network configuration. Make sure the FHEVM network is accessible.",
  
  [ErrorCodes.SDK_LOAD_FAILED]:
    "The FHEVM SDK failed to load. Check your internet connection and try again.",
  
  [ErrorCodes.SDK_INIT_FAILED]:
    "The FHEVM SDK failed to initialize. Verify that your network supports FHEVM operations.",
  
  [ErrorCodes.INVALID_PROVIDER]:
    "Provide a valid EIP-1193 provider (like window.ethereum) or an RPC URL string.",
  
  [ErrorCodes.PROVIDER_NOT_CONNECTED]:
    "Make sure your wallet is connected and the provider is accessible.",
  
  [ErrorCodes.NETWORK_ERROR]:
    "Check your network connection and RPC endpoint. The network may be down or unreachable.",
  
  [ErrorCodes.ENCRYPTION_FAILED]:
    "Encryption failed. Verify that the FHEVM instance is ready and the input data is valid.",
  
  [ErrorCodes.DECRYPTION_FAILED]:
    "Decryption failed. Make sure you have permission to decrypt this value and the handle is valid.",
  
  [ErrorCodes.INVALID_HANDLE]:
    "The provided handle is not a valid encrypted value handle. Handles should be hex strings.",
  
  [ErrorCodes.INVALID_ADDRESS]:
    "Provide a valid Ethereum address in the format 0x...",
  
  [ErrorCodes.INVALID_CONTRACT_ADDRESS]:
    "The contract address is invalid. Make sure it's a valid Ethereum address.",
  
  [ErrorCodes.INVALID_CONFIG]:
    "Check your configuration object. Required fields may be missing or invalid.",
  
  [ErrorCodes.MISSING_MOCK_CHAIN]:
    "For local development, add the chain to mockChains config. Example: { 31337: 'http://localhost:8545' }",
  
  [ErrorCodes.OPERATION_CANCELLED]:
    "The operation was cancelled. This is normal if you aborted the operation intentionally.",
  
  [ErrorCodes.OPERATION_TIMEOUT]:
    "The operation timed out. Try again or check your network connection.",
};

/**
 * Create an FhevmError with automatic suggestion lookup
 * 
 * @param code - Error code from ErrorCodes
 * @param message - Error message
 * @param customSuggestion - Optional custom suggestion (overrides default)
 * @param cause - Optional error cause
 * @returns FhevmError instance
 * 
 * @example
 * ```typescript
 * throw createError(
 *   ErrorCodes.NOT_INITIALIZED,
 *   "Client is not initialized"
 * );
 * ```
 */
export function createError(
  code: string,
  message: string,
  customSuggestion?: string,
  cause?: unknown
): FhevmError {
  const suggestion = customSuggestion || ErrorSuggestions[code];
  return new FhevmError(code, message, suggestion, cause ? { cause } : undefined);
}

/**
 * Check if an error is an FhevmError
 * 
 * @param error - Error to check
 * @returns True if error is an FhevmError
 */
export function isFhevmError(error: unknown): error is FhevmError {
  return error instanceof FhevmError;
}

/**
 * Check if an error has a specific error code
 * 
 * @param error - Error to check
 * @param code - Error code to match
 * @returns True if error has the specified code
 * 
 * @example
 * ```typescript
 * try {
 *   await client.initialize();
 * } catch (error) {
 *   if (isErrorCode(error, ErrorCodes.NETWORK_ERROR)) {
 *     console.log("Network issue detected");
 *   }
 * }
 * ```
 */
export function isErrorCode(error: unknown, code: string): boolean {
  return isFhevmError(error) && error.code === code;
}

/**
 * Format an error for display
 * 
 * @param error - Error to format
 * @returns Formatted error string
 */
export function formatError(error: unknown): string {
  if (isFhevmError(error)) {
    return error.toString();
  }
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

