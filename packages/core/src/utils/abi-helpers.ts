import { ethers } from "ethers";
import { 
  FhevmDataType, 
  EncryptResult, 
  ERROR_CODES 
} from "../types";
import { CloakSDKError } from "../index";
import { validateAbi } from "./validation";

/**
 * Get the encryption method name for a given FHEVM data type
 */
export function getEncryptionMethod(dataType: FhevmDataType): string {
  switch (dataType) {
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
      return "add64"; // Default fallback
  }
}

/**
 * Convert Uint8Array or hex-like string to 0x-prefixed hex string
 */
export function toHex(value: Uint8Array | string): `0x${string}` {
  if (typeof value === "string") {
    return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
  }
  // value is Uint8Array
  return ("0x" + Buffer.from(value).toString("hex")) as `0x${string}`;
}

/**
 * Build contract parameters from encrypted result and ABI for a given function
 */
export function buildParamsFromAbi(
  enc: EncryptResult, 
  abi: any[], 
  functionName: string
): any[] {
  const fn = abi.find((item: any) => item.type === "function" && item.name === functionName);
  if (!fn) {
    throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, `Function ABI not found for ${functionName}`);
  }

  return fn.inputs.map((input: any, index: number) => {
    const raw = index === 0 ? enc.handles[0] : enc.inputProof;
    return convertParamByType(raw, input.type);
  });
}

/**
 * Convert parameter by ABI type
 */
export function convertParamByType(raw: Uint8Array, type: string): any {
  switch (type) {
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
      console.warn(`Unknown ABI param type ${type}; passing as hex`);
      return toHex(raw);
  }
}

/**
 * Get function ABI from contract ABI
 */
export function getFunctionAbi(abi: any[], functionName: string): any {
  const fn = abi.find((item: any) => item.type === "function" && item.name === functionName);
  if (!fn) {
    throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, `Function ABI not found for ${functionName}`);
  }
  return fn;
}

/**
 * Get all function names from ABI
 */
export function getFunctionNames(abi: any[]): string[] {
  return abi
    .filter((item: any) => item.type === "function")
    .map((item: any) => item.name);
}

/**
 * Get function inputs from ABI
 */
export function getFunctionInputs(abi: any[], functionName: string): any[] {
  const fn = getFunctionAbi(abi, functionName);
  return fn.inputs || [];
}

/**
 * Get function outputs from ABI
 */
export function getFunctionOutputs(abi: any[], functionName: string): any[] {
  const fn = getFunctionAbi(abi, functionName);
  return fn.outputs || [];
}

/**
 * Check if function is payable
 */
export function isFunctionPayable(abi: any[], functionName: string): boolean {
  const fn = getFunctionAbi(abi, functionName);
  return fn.payable || fn.stateMutability === "payable";
}

/**
 * Check if function is view/pure
 */
export function isFunctionView(abi: any[], functionName: string): boolean {
  const fn = getFunctionAbi(abi, functionName);
  return fn.stateMutability === "view" || fn.stateMutability === "pure";
}

/**
 * Get function state mutability
 */
export function getFunctionStateMutability(abi: any[], functionName: string): string {
  const fn = getFunctionAbi(abi, functionName);
  return fn.stateMutability || "nonpayable";
}

/**
 * Parse function signature
 */
export function parseFunctionSignature(abi: any[], functionName: string): string {
  const fn = getFunctionAbi(abi, functionName);
  const inputs = fn.inputs.map((input: any) => `${input.type} ${input.name || ''}`).join(', ');
  return `${functionName}(${inputs})`;
}

/**
 * Get function selector (first 4 bytes of keccak256 hash)
 */
export function getFunctionSelector(abi: any[], functionName: string): string {
  const signature = parseFunctionSignature(abi, functionName);
  const hash = ethers.keccak256(ethers.toUtf8Bytes(signature));
  return hash.slice(0, 10); // 0x + 4 bytes
}

/**
 * Check if ABI contains a specific function
 */
export function hasFunction(abi: any[], functionName: string): boolean {
  return abi.some((item: any) => item.type === "function" && item.name === functionName);
}

/**
 * Get all events from ABI
 */
export function getEvents(abi: any[]): any[] {
  return abi.filter((item: any) => item.type === "event");
}

/**
 * Get event ABI by name
 */
export function getEventAbi(abi: any[], eventName: string): any {
  const event = abi.find((item: any) => item.type === "event" && item.name === eventName);
  if (!event) {
    throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, `Event ABI not found for ${eventName}`);
  }
  return event;
}

/**
 * Get event topic (keccak256 hash of event signature)
 */
export function getEventTopic(abi: any[], eventName: string): string {
  const event = getEventAbi(abi, eventName);
  const signature = `${eventName}(${event.inputs.map((input: any) => input.type).join(',')})`;
  return ethers.keccak256(ethers.toUtf8Bytes(signature));
}

/**
 * Validate ABI structure (imported from validation.ts)
 */

/**
 * Create contract interface from ABI
 */
export function createContractInterface(abi: any[]): ethers.Interface {
  if (!validateAbi(abi)) {
    throw new CloakSDKError(ERROR_CODES.INVALID_CONFIG, "Invalid ABI provided");
  }
  
  return new ethers.Interface(abi);
}

/**
 * Encode function call data
 */
export function encodeFunctionCall(abi: any[], functionName: string, params: any[]): string {
  const iface = createContractInterface(abi);
  return iface.encodeFunctionData(functionName, params);
}

/**
 * Decode function call data
 */
export function decodeFunctionCall(abi: any[], functionName: string, data: string): any[] {
  const iface = createContractInterface(abi);
  return iface.decodeFunctionData(functionName, data);
}

/**
 * Decode function result
 */
export function decodeFunctionResult(abi: any[], functionName: string, data: string): any[] {
  const iface = createContractInterface(abi);
  return iface.decodeFunctionResult(functionName, data);
}
