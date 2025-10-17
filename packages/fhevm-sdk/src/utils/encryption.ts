/**
 * Encryption utilities for FHEVM
 */

import { FhevmInstance } from "../fhevmTypes";
import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";

/**
 * Result of encryption operation
 */
export type EncryptResult = {
  handles: Uint8Array[];
  inputProof: Uint8Array;
};

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
 * Create encrypted input for contract
 * 
 * @param instance - FHEVM instance
 * @param contractAddress - Contract address
 * @param userAddress - User address
 * @param buildFn - Function to build encrypted input
 * @returns Promise resolving to encryption result
 * 
 * @example
 * ```typescript
 * const result = await encryptInput(
 *   fhevmInstance,
 *   "0x123...",
 *   "0xabc...",
 *   (input) => {
 *     input.add32(42);
 *   }
 * );
 * ```
 */
export async function encryptInput(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  buildFn: (builder: RelayerEncryptedInput) => void
): Promise<EncryptResult> {
  const input = instance.createEncryptedInput(
    contractAddress,
    userAddress
  ) as RelayerEncryptedInput;
  
  buildFn(input);
  
  const enc = await input.encrypt();
  return enc;
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

