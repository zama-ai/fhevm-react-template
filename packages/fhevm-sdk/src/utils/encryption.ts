/**
 * Encryption utilities for FHEVM with performance optimizations
 */

import { FhevmInstance } from "../fhevmTypes";
import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import { FhevmEncryptionError } from "./errors";

/**
 * Result of encryption operation
 */
export type EncryptResult = {
  handles: Uint8Array[];
  inputProof: Uint8Array;
};

/**
 * Encryption performance metrics
 */
export interface EncryptionMetrics {
  /** Total time spent on encryption (ms) */
  encryptionTime: number;
  /** Number of values encrypted */
  valueCount: number;
  /** Timestamp of the operation */
  timestamp: Date;
}

/**
 * Encryption options
 */
export interface EncryptionOptions {
  /** Enable performance monitoring */
  enableMetrics?: boolean;
  /** Timeout for encryption operation (ms) */
  timeout?: number;
}

/**
 * Map external encrypted integer type to RelayerEncryptedInput builder method
 * 
 * @param internalType - The internal type string (e.g., "externalEuint32")
 * @returns The corresponding encryption method name
 * 
 * @example
 * ```typescript
 * const method = getEncryptionMethod("externalEuint32");
 * // Returns: "add32"
 * ```
 */
export function getEncryptionMethod(internalType: string): 
  | "addBool"
  | "add8"
  | "add16"
  | "add32"
  | "add64"
  | "add128"
  | "add256"
  | "addAddress" {
  switch (internalType) {
    case "externalEbool":
      return "addBool";
    case "externalEuint8":
      return "add8";
    case "externalEuint16":
      return "add16";
    case "externalEuint32":
      return "add32";
    case "externalEuint64":
      return "add64";
    case "externalEuint128":
      return "add128";
    case "externalEuint256":
      return "add256";
    case "externalEaddress":
      return "addAddress";
    default:
      console.warn(`Unknown internalType: ${internalType}, defaulting to add64`);
      return "add64";
  }
}

/**
 * Convert Uint8Array or hex-like string to 0x-prefixed hex string
 * 
 * @param value - Uint8Array or hex string to convert
 * @returns 0x-prefixed hex string
 * 
 * @example
 * ```typescript
 * toHex(new Uint8Array([0, 1, 2])); // "0x000102"
 * toHex("123abc"); // "0x123abc"
 * toHex("0x123abc"); // "0x123abc"
 * ```
 */
export function toHex(value: Uint8Array | string): `0x${string}` {
  if (typeof value === "string") {
    return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
  }
  // value is Uint8Array
  return ("0x" + Buffer.from(value).toString("hex")) as `0x${string}`;
}

/**
 * Build contract parameters from encryption result and ABI
 * 
 * @param enc - The encryption result
 * @param abi - Contract ABI
 * @param functionName - Name of the function to call
 * @returns Array of properly formatted parameters
 * 
 * @throws Error if function ABI not found
 * 
 * @example
 * ```typescript
 * const params = buildParamsFromAbi(encResult, contractAbi, "transfer");
 * // Returns: ["0x...", "0x..."] ready for contract call
 * ```
 */
export function buildParamsFromAbi(
  enc: EncryptResult,
  abi: any[],
  functionName: string
): any[] {
  const fn = abi.find(
    (item: any) => item.type === "function" && item.name === functionName
  );
  
  if (!fn) {
    throw new Error(`Function ABI not found for ${functionName}`);
  }

  return fn.inputs.map((input: any, index: number) => {
    const raw = index === 0 ? enc.handles[0] : enc.inputProof;
    
    switch (input.type) {
      case "bytes32":
      case "bytes":
        return toHex(raw);
      case "uint256":
        return BigInt(raw as unknown as string);
      case "address":
      case "string":
        return raw as unknown as string;
      case "bool":
        return Boolean(raw);
      default:
        console.warn(`Unknown ABI param type ${input.type}; passing as hex`);
        return toHex(raw);
    }
  });
}

/**
 * Create encrypted input for contract with performance monitoring
 * 
 * @param instance - FHEVM instance
 * @param contractAddress - Contract address
 * @param userAddress - User address
 * @param buildFn - Function to build encrypted input
 * @param options - Encryption options
 * @returns Promise resolving to encryption result
 * 
 * @throws {FhevmEncryptionError} If encryption fails or times out
 * 
 * @example
 * ```typescript
 * const result = await encryptInput(
 *   fhevmInstance,
 *   "0x123...",
 *   "0xabc...",
 *   (input) => {
 *     input.add32(42);
 *   },
 *   { enableMetrics: true, timeout: 10000 }
 * );
 * ```
 */
export async function encryptInput(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  buildFn: (builder: RelayerEncryptedInput) => void,
  options: EncryptionOptions = {}
): Promise<EncryptResult> {
  const { enableMetrics = false, timeout = 30000 } = options;
  const startTime = enableMetrics ? performance.now() : 0;

  try {
    const input = instance.createEncryptedInput(
      contractAddress,
      userAddress
    ) as RelayerEncryptedInput;
    
    buildFn(input);
    
    // Add timeout support
    const encryptPromise = input.encrypt();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Encryption timeout")), timeout);
    });
    
    const enc = await Promise.race([encryptPromise, timeoutPromise]);
    
    // Log metrics if enabled
    if (enableMetrics) {
      const endTime = performance.now();
      const metrics: EncryptionMetrics = {
        encryptionTime: endTime - startTime,
        valueCount: enc.handles.length,
        timestamp: new Date(),
      };
      console.log("[Encryption Metrics]", metrics);
    }
    
    return enc;
  } catch (error) {
    throw new FhevmEncryptionError(
      "Encryption failed",
      error as Error
    );
  }
}

/**
 * Batch encryption request
 */
export interface BatchEncryptRequest {
  /** Build function for this encryption */
  buildFn: (builder: RelayerEncryptedInput) => void;
  /** Optional identifier for this request */
  id?: string;
}

/**
 * Batch encryption result
 */
export interface BatchEncryptResult {
  /** Request identifier (if provided) */
  id?: string;
  /** Encryption result */
  result: EncryptResult;
  /** Time taken for this encryption (ms) */
  duration: number;
}

/**
 * Batch encrypt multiple values efficiently
 * 
 * @param instance - FHEVM instance
 * @param contractAddress - Contract address
 * @param userAddress - User address
 * @param requests - Array of encryption requests
 * @param options - Encryption options
 * @returns Promise resolving to array of results
 * 
 * @example
 * ```typescript
 * const results = await batchEncrypt(
 *   instance,
 *   contractAddress,
 *   userAddress,
 *   [
 *     { id: "value1", buildFn: (input) => input.add32(42) },
 *     { id: "value2", buildFn: (input) => input.add32(100) }
 *   ],
 *   { enableMetrics: true }
 * );
 * ```
 */
export async function batchEncrypt(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  requests: BatchEncryptRequest[],
  options: EncryptionOptions = {}
): Promise<BatchEncryptResult[]> {
  const { enableMetrics = false } = options;
  
  if (enableMetrics) {
    console.log(`[Batch Encryption] Starting ${requests.length} encryptions`);
  }
  
  const startTime = enableMetrics ? performance.now() : 0;
  
  try {
    const results = await Promise.all(
      requests.map(async (req, index) => {
        const reqStartTime = performance.now();
        
        const result = await encryptInput(
          instance,
          contractAddress,
          userAddress,
          req.buildFn,
          { ...options, enableMetrics: false } // Disable per-request metrics
        );
        
        const reqEndTime = performance.now();
        
        return {
          id: req.id || `request-${index}`,
          result,
          duration: reqEndTime - reqStartTime,
        };
      })
    );
    
    if (enableMetrics) {
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / requests.length;
      
      console.log(`[Batch Encryption] Completed ${requests.length} encryptions in ${totalTime.toFixed(2)}ms (avg: ${avgTime.toFixed(2)}ms)`);
    }
    
    return results;
  } catch (error) {
    throw new FhevmEncryptionError(
      "Batch encryption failed",
      error as Error
    );
  }
}

/**
 * Check if encryption is available
 * 
 * @param instance - FHEVM instance
 * @param contractAddress - Contract address
 * @param userAddress - User address
 * @returns True if all required parameters are available
 */
export function canEncrypt(
  instance: FhevmInstance | undefined,
  contractAddress: string | undefined,
  userAddress: string | undefined
): boolean {
  return Boolean(instance && contractAddress && userAddress);
}

