/**
 * Decryption utilities for FHEVM
 * 
 * These are internal utility functions used by React hooks.
 * For actual decryption, use the useFHEDecrypt hook.
 */

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

