/**
 * Decryption utilities for FHEVM with performance optimizations
 * 
 * These are internal utility functions used by React hooks.
 * For actual decryption, use the useFHEDecrypt hook.
 */

import { FhevmDecryptionError } from "./errors";

/**
 * Decryption request
 */
export interface FHEDecryptRequest {
  handle: string;
  contractAddress: `0x${string}`;
}

/**
 * Decryption result type
 */
export type DecryptedValue = string | bigint | boolean;

/**
 * Decryption performance metrics
 */
export interface DecryptionMetrics {
  /** Total time spent on decryption (ms) */
  decryptionTime: number;
  /** Number of values decrypted */
  valueCount: number;
  /** Time spent on signature creation (ms) */
  signatureTime?: number;
  /** Timestamp of the operation */
  timestamp: Date;
}

/**
 * Decryption options
 */
export interface DecryptionOptions {
  /** Enable performance monitoring */
  enableMetrics?: boolean;
  /** Timeout for decryption operation (ms) */
  timeout?: number;
}

/**
 * Sort and create unique key for decryption requests
 * 
 * This is used to detect when requests have changed.
 * 
 * @param requests - Array of decryption requests
 * @returns Unique string key for the requests
 * 
 * @example
 * ```typescript
 * const key1 = createRequestsKey([{ handle: "0x1", contractAddress: "0xa" }]);
 * const key2 = createRequestsKey([{ handle: "0x1", contractAddress: "0xa" }]);
 * console.log(key1 === key2); // true
 * ```
 */
export function createRequestsKey(requests: readonly FHEDecryptRequest[]): string {
  if (!requests || requests.length === 0) return "";
  
  const sorted = [...requests].sort((a, b) =>
    (a.handle + a.contractAddress).localeCompare(b.handle + b.contractAddress)
  );
  
  return JSON.stringify(sorted);
}

/**
 * Group decryption requests by contract address for efficient processing
 * 
 * @param requests - Array of decryption requests
 * @returns Map of contract address to requests
 * 
 * @example
 * ```typescript
 * const grouped = groupRequestsByContract([
 *   { handle: "0x1", contractAddress: "0xa" },
 *   { handle: "0x2", contractAddress: "0xa" },
 *   { handle: "0x3", contractAddress: "0xb" }
 * ]);
 * // Returns: Map { "0xa" => [req1, req2], "0xb" => [req3] }
 * ```
 */
export function groupRequestsByContract(
  requests: readonly FHEDecryptRequest[]
): Map<`0x${string}`, FHEDecryptRequest[]> {
  const grouped = new Map<`0x${string}`, FHEDecryptRequest[]>();
  
  for (const req of requests) {
    const existing = grouped.get(req.contractAddress) || [];
    existing.push(req);
    grouped.set(req.contractAddress, existing);
  }
  
  return grouped;
}

/**
 * Get unique contract addresses from requests
 * 
 * @param requests - Array of decryption requests
 * @returns Array of unique contract addresses
 * 
 * @example
 * ```typescript
 * const addresses = getUniqueContractAddresses([
 *   { handle: "0x1", contractAddress: "0xa" },
 *   { handle: "0x2", contractAddress: "0xa" },
 *   { handle: "0x3", contractAddress: "0xb" }
 * ]);
 * // Returns: ["0xa", "0xb"]
 * ```
 */
export function getUniqueContractAddresses(
  requests: readonly FHEDecryptRequest[]
): `0x${string}`[] {
  const addresses = new Set<`0x${string}`>();
  
  for (const req of requests) {
    addresses.add(req.contractAddress);
  }
  
  return Array.from(addresses);
}

/**
 * Validate decryption requests
 * 
 * @param requests - Array of decryption requests
 * @throws {FhevmDecryptionError} If requests are invalid
 * 
 * @example
 * ```typescript
 * validateDecryptRequests([
 *   { handle: "0x1", contractAddress: "0xa" }
 * ]); // OK
 * 
 * validateDecryptRequests([
 *   { handle: "", contractAddress: "0xa" }
 * ]); // Throws error
 * ```
 */
export function validateDecryptRequests(
  requests: readonly FHEDecryptRequest[]
): void {
  if (!requests || requests.length === 0) {
    throw new FhevmDecryptionError("No decryption requests provided");
  }
  
  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    
    if (!req.handle || typeof req.handle !== "string") {
      throw new FhevmDecryptionError(
        `Invalid handle at index ${i}: ${req.handle}`
      );
    }
    
    if (!req.contractAddress || typeof req.contractAddress !== "string") {
      throw new FhevmDecryptionError(
        `Invalid contract address at index ${i}: ${req.contractAddress}`
      );
    }
    
    if (!req.contractAddress.startsWith("0x")) {
      throw new FhevmDecryptionError(
        `Contract address must start with 0x at index ${i}: ${req.contractAddress}`
      );
    }
  }
}

/**
 * Check if decryption is available
 * 
 * @param instance - FHEVM instance
 * @param signer - Ethers signer
 * @param requests - Decryption requests
 * @returns True if decryption is available
 * 
 * @example
 * ```typescript
 * if (canDecrypt(instance, signer, requests)) {
 *   // Ready to decrypt
 * }
 * ```
 */
export function canDecrypt(
  instance: any | undefined,
  signer: any | undefined,
  requests: readonly FHEDecryptRequest[] | undefined
): boolean {
  return Boolean(
    instance &&
    signer &&
    requests &&
    requests.length > 0
  );
}

