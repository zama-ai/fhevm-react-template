import { ethers } from "ethers";
import { 
  FhevmInstance, 
  ContractCallOptions, 
  EncryptResult,
  ERROR_CODES
} from "../types";
import { CloakSDKError } from "../index";

export class CloakContract {
  private _instance: FhevmInstance;

  constructor(instance: FhevmInstance) {
    this._instance = instance;
  }

  /**
   * Get the FHEVM instance (for advanced usage)
   */
  getInstance(): FhevmInstance {
    return this._instance;
  }

  /**
   * Call a contract function with encrypted parameters
   */
  async callWithEncryptedParams(options: ContractCallOptions): Promise<any> {
    try {
      const { contractAddress, functionName, abi, encryptedParams, signer } = options;

      if (!signer) {
        throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, "Signer is required for contract calls");
      }

      if (!encryptedParams) {
        throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, "Encrypted parameters are required");
      }

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Build parameters from encrypted data and ABI
      const params = this.buildParamsFromAbi(encryptedParams, abi, functionName);

      // Call the contract function
      const result = await contract[functionName](...params);
      return result;
    } catch (error) {
      throw new CloakSDKError(
        ERROR_CODES.CONTRACT_CALL_FAILED,
        `Failed to call contract function ${options.functionName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Call a contract function with regular (non-encrypted) parameters
   */
  async callWithRegularParams(options: ContractCallOptions): Promise<any> {
    try {
      const { contractAddress, functionName, abi, regularParams, signer } = options;

      if (!signer) {
        throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, "Signer is required for contract calls");
      }

      if (!regularParams) {
        throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, "Regular parameters are required");
      }

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Call the contract function
      const result = await contract[functionName](...regularParams);
      return result;
    } catch (error) {
      throw new CloakSDKError(
        ERROR_CODES.CONTRACT_CALL_FAILED,
        `Failed to call contract function ${options.functionName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Build contract parameters from encrypted data and ABI
   */
  buildParamsFromAbi(enc: EncryptResult, abi: any[], functionName: string): any[] {
    const fn = abi.find((item: any) => item.type === "function" && item.name === functionName);
    if (!fn) {
      throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, `Function ABI not found for ${functionName}`);
    }

    return fn.inputs.map((input: any, index: number) => {
      const raw = index === 0 ? enc.handles[0] : enc.inputProof;
      return this.convertParamByType(raw, input.type);
    });
  }

  /**
   * Convert parameter by ABI type
   */
  private convertParamByType(raw: Uint8Array, type: string): any {
    switch (type) {
      case "bytes32":
      case "bytes":
        return this.toHex(raw);
      case "uint256":
        return BigInt(raw as unknown as string);
      case "address":
      case "string":
        return raw as unknown as string;
      case "bool":
        return Boolean(raw);
      default:
        console.warn(`Unknown ABI param type ${type}; passing as hex`);
        return this.toHex(raw);
    }
  }

  /**
   * Convert Uint8Array to hex string
   */
  private toHex(value: Uint8Array): `0x${string}` {
    return ("0x" + Buffer.from(value).toString("hex")) as `0x${string}`;
  }

  /**
   * Get contract instance for direct interaction
   */
  getContractInstance(contractAddress: string, abi: any[], signer: ethers.JsonRpcSigner): ethers.Contract {
    return new ethers.Contract(contractAddress, abi, signer);
  }

  /**
   * Estimate gas for a contract call
   */
  async estimateGas(options: ContractCallOptions): Promise<bigint> {
    try {
      const { contractAddress, functionName, abi, encryptedParams, regularParams, signer } = options;

      if (!signer) {
        throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, "Signer is required for gas estimation");
      }

      const contract = new ethers.Contract(contractAddress, abi, signer);
      let params: any[];

      if (encryptedParams) {
        params = this.buildParamsFromAbi(encryptedParams, abi, functionName);
      } else if (regularParams) {
        params = regularParams;
      } else {
        throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, "Parameters are required for gas estimation");
      }

      const gasEstimate = await contract[functionName].estimateGas(...params);
      return gasEstimate;
    } catch (error) {
      throw new CloakSDKError(
        ERROR_CODES.CONTRACT_CALL_FAILED,
        `Failed to estimate gas for ${options.functionName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Get contract function ABI
   */
  static getFunctionAbi(abi: any[], functionName: string): any {
    const fn = abi.find((item: any) => item.type === "function" && item.name === functionName);
    if (!fn) {
      throw new CloakSDKError(ERROR_CODES.CONTRACT_CALL_FAILED, `Function ABI not found for ${functionName}`);
    }
    return fn;
  }

  /**
   * Validate contract ABI
   */
  static validateAbi(abi: any[]): boolean {
    if (!Array.isArray(abi)) return false;
    
    return abi.every(item => 
      typeof item === "object" && 
      item !== null && 
      typeof item.type === "string" &&
      (item.type === "function" || item.type === "event" || item.type === "constructor")
    );
  }
}
