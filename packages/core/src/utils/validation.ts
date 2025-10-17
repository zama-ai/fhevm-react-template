import { isAddress } from "ethers";
import { 
  FhevmDataType, 
  ERROR_CODES 
} from "../types";
import { CloakSDKError } from "../index";

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string): address is `0x${string}` {
  if (typeof address !== "string") {
    return false;
  }
  
  if (!address.startsWith("0x")) {
    return false;
  }
  
  if (address.length !== 42) {
    return false;
  }
  
  return isAddress(address);
}

/**
 * Validate contract address
 */
export function validateContractAddress(address: string): address is `0x${string}` {
  return validateAddress(address);
}

/**
 * Validate data type and value compatibility
 */
export function validateDataType(data: any, dataType: FhevmDataType): boolean {
  switch (dataType) {
    case "externalEbool":
      return typeof data === "boolean";
    
    case "externalEuint8":
      return typeof data === "number" && 
             Number.isInteger(data) && 
             data >= 0 && 
             data <= 255;
    
    case "externalEuint16":
      return typeof data === "number" && 
             Number.isInteger(data) && 
             data >= 0 && 
             data <= 65535;
    
    case "externalEuint32":
      return typeof data === "number" && 
             Number.isInteger(data) && 
             data >= 0 && 
             data <= 4294967295;
    
    case "externalEuint64":
      return (typeof data === "bigint" && data >= 0n) ||
             (typeof data === "string" && !isNaN(Number(data)) && Number(data) >= 0);
    
    case "externalEuint128":
      return (typeof data === "bigint" && data >= 0n) ||
             (typeof data === "string" && !isNaN(Number(data)) && Number(data) >= 0);
    
    case "externalEuint256":
      return (typeof data === "bigint" && data >= 0n) ||
             (typeof data === "string" && !isNaN(Number(data)) && Number(data) >= 0);
    
    case "externalEaddress":
      return validateAddress(data);
    
    default:
      return false;
  }
}

/**
 * Validate provider (URL or EIP-1193 provider)
 */
export function validateProvider(provider: any): boolean {
  if (typeof provider === "string") {
    try {
      new URL(provider);
      return true;
    } catch {
      return false;
    }
  }
  
  if (typeof provider === "object" && provider !== null) {
    return typeof provider.request === "function";
  }
  
  return false;
}

/**
 * Validate chain ID
 */
export function validateChainId(chainId: any): chainId is number {
  return typeof chainId === "number" && 
         Number.isInteger(chainId) && 
         chainId > 0;
}

/**
 * Validate ABI
 */
export function validateAbi(abi: any): abi is any[] {
  if (!Array.isArray(abi)) {
    return false;
  }
  
  return abi.every(item => 
    typeof item === "object" && 
    item !== null && 
    typeof item.type === "string" &&
    (item.type === "function" || item.type === "event" || item.type === "constructor")
  );
}

/**
 * Validate function name
 */
export function validateFunctionName(functionName: any): functionName is string {
  return typeof functionName === "string" && 
         functionName.length > 0 &&
         /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName);
}

/**
 * Validate encrypted result
 */
export function validateEncryptResult(result: any): result is { handles: Uint8Array[]; inputProof: Uint8Array } {
  if (typeof result !== "object" || result === null) {
    return false;
  }
  
  if (!Array.isArray(result.handles)) {
    return false;
  }
  
  if (!(result.inputProof instanceof Uint8Array)) {
    return false;
  }
  
  return result.handles.every((handle: any) => handle instanceof Uint8Array);
}

/**
 * Validate signature
 */
export function validateSignature(signature: any): signature is string {
  return typeof signature === "string" && 
         signature.length > 0 &&
         signature.startsWith("0x");
}

/**
 * Validate duration in days
 */
export function validateDuration(duration: any): duration is number {
  return typeof duration === "number" && 
         Number.isInteger(duration) && 
         duration > 0 && 
         duration <= 365; // Max 1 year
}

/**
 * Validate mock chains configuration
 */
export function validateMockChains(mockChains: any): mockChains is Record<number, string> {
  if (typeof mockChains !== "object" || mockChains === null) {
    return false;
  }
  
  for (const [chainId, rpcUrl] of Object.entries(mockChains)) {
    if (!validateChainId(Number(chainId))) {
      return false;
    }
    
    if (typeof rpcUrl !== "string" || rpcUrl.length === 0) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate EIP-712 domain
 */
export function validateEIP712Domain(domain: any): boolean {
  if (typeof domain !== "object" || domain === null) {
    return false;
  }
  
  return typeof domain.chainId === "number" &&
         typeof domain.name === "string" &&
         validateAddress(domain.verifyingContract) &&
         typeof domain.version === "string";
}

/**
 * Validate EIP-712 signature
 */
export function validateEIP712Signature(signature: any): boolean {
  if (typeof signature !== "object" || signature === null) {
    return false;
  }
  
  return typeof signature.publicKey === "string" &&
         typeof signature.privateKey === "string" &&
         typeof signature.signature === "string" &&
         typeof signature.startTimestamp === "number" &&
         typeof signature.durationDays === "number" &&
         validateAddress(signature.userAddress) &&
         Array.isArray(signature.contractAddresses) &&
         signature.contractAddresses.every(validateAddress) &&
         validateEIP712Domain(signature.eip712?.domain);
}

/**
 * Safe validation wrapper that throws CloakSDKError on failure
 */
export function validateOrThrow<T>(
  value: any,
  validator: (value: any) => value is T,
  errorCode: string,
  errorMessage: string
): asserts value is T {
  if (!validator(value)) {
    throw new CloakSDKError(errorCode, errorMessage);
  }
}

/**
 * Validate and convert data to appropriate type for FHEVM
 */
export function validateAndConvertData(data: any, dataType: FhevmDataType): any {
  if (!validateDataType(data, dataType)) {
    throw new CloakSDKError(
      ERROR_CODES.INVALID_CONFIG,
      `Invalid data type for ${dataType}: ${typeof data}`
    );
  }
  
  // Convert to appropriate type
  switch (dataType) {
    case "externalEbool":
      return Boolean(data);
    
    case "externalEuint8":
    case "externalEuint16":
    case "externalEuint32":
      return Number(data);
    
    case "externalEuint64":
    case "externalEuint128":
    case "externalEuint256":
      return typeof data === "bigint" ? data : BigInt(data);
    
    case "externalEaddress":
      return data as `0x${string}`;
    
    default:
      return data;
  }
}
