/**
 * Core type definitions for FHEVM SDK
 */

// Re-export existing types
export * from "../fhevmTypes";
export * from "../internal/fhevmTypes";

// Add new common types
export type FhevmStatus = "idle" | "loading" | "ready" | "error";

export interface FhevmConfig {
  provider: string | any;  // Will be refined later
  chainId?: number;
  enabled?: boolean;
  mockChains?: Readonly<Record<number, string>>;
}

export interface FhevmError {
  code: string;
  message: string;
  cause?: Error;
}

