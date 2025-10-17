/**
 * Error handling utilities for FHEVM SDK
 */

/**
 * Base error class for FHEVM SDK
 */
export class FhevmError extends Error {
  constructor(
    public code: string,
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "FhevmError";
  }
}

/**
 * Error thrown during FHEVM instance initialization
 */
export class FhevmInitializationError extends FhevmError {
  constructor(message: string, cause?: Error) {
    super("FHEVM_INIT_ERROR", message, cause);
    this.name = "FhevmInitializationError";
  }
}

/**
 * Error thrown during encryption operations
 */
export class FhevmEncryptionError extends FhevmError {
  constructor(message: string, cause?: Error) {
    super("FHEVM_ENCRYPTION_ERROR", message, cause);
    this.name = "FhevmEncryptionError";
  }
}

/**
 * Error thrown during decryption operations
 */
export class FhevmDecryptionError extends FhevmError {
  constructor(message: string, cause?: Error) {
    super("FHEVM_DECRYPTION_ERROR", message, cause);
    this.name = "FhevmDecryptionError";
  }
}

/**
 * Error thrown during signature operations
 */
export class FhevmSignatureError extends FhevmError {
  constructor(message: string, cause?: Error) {
    super("FHEVM_SIGNATURE_ERROR", message, cause);
    this.name = "FhevmSignatureError";
  }
}

/**
 * Error thrown for invalid configuration
 */
export class FhevmConfigurationError extends FhevmError {
  constructor(message: string, cause?: Error) {
    super("FHEVM_CONFIG_ERROR", message, cause);
    this.name = "FhevmConfigurationError";
  }
}

/**
 * Format error for user display
 * 
 * @param error - The error to format
 * @returns Formatted error message
 * 
 * @example
 * ```typescript
 * try {
 *   await client.initialize();
 * } catch (error) {
 *   console.error(formatFhevmError(error));
 * }
 * ```
 */
export function formatFhevmError(error: unknown): string {
  if (error instanceof FhevmError) {
    return `[${error.code}] ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Check if an error is a FHEVM error
 */
export function isFhevmError(error: unknown): error is FhevmError {
  return error instanceof FhevmError;
}

/**
 * Wrap an unknown error in a FhevmError
 */
export function wrapError(error: unknown, defaultMessage: string): FhevmError {
  if (error instanceof FhevmError) {
    return error;
  }
  
  const cause = error instanceof Error ? error : undefined;
  const message = error instanceof Error ? error.message : defaultMessage;
  
  return new FhevmError("UNKNOWN_ERROR", message, cause);
}

