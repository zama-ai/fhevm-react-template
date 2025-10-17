import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import { 
  FhevmInstance, 
  EncryptResult, 
  EncryptionOptions, 
  FhevmDataType,
  ERROR_CODES
} from "./types";
import { CloakSDKError } from "./index";

export class CloakEncryption {
  private instance: FhevmInstance;

  constructor(instance: FhevmInstance) {
    this.instance = instance;
  }

  /**
   * Encrypt data for a specific contract and user
   */
  async encrypt(options: EncryptionOptions): Promise<EncryptResult> {
    try {
      const { contractAddress, userAddress, data, dataType } = options;
      
      // Create encrypted input builder
      const input = this.instance.createEncryptedInput(contractAddress, userAddress) as RelayerEncryptedInput;
      
      // Add data based on type
      this.addDataToInput(input, data, dataType);
      
      // Encrypt the input
      const result = await input.encrypt();
      
      return {
        handles: result.handles,
        inputProof: result.inputProof,
      };
    } catch (error) {
      throw new CloakSDKError(
        ERROR_CODES.ENCRYPTION_FAILED,
        `Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Encrypt multiple values at once
   */
  async encryptMultiple(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    dataArray: Array<{ data: any; dataType: FhevmDataType }>
  ): Promise<EncryptResult> {
    try {
      const input = this.instance.createEncryptedInput(contractAddress, userAddress) as RelayerEncryptedInput;
      
      // Add all data to the input
      for (const { data, dataType } of dataArray) {
        this.addDataToInput(input, data, dataType);
      }
      
      const result = await input.encrypt();
      
      return {
        handles: result.handles,
        inputProof: result.inputProof,
      };
    } catch (error) {
      throw new CloakSDKError(
        ERROR_CODES.ENCRYPTION_FAILED,
        `Failed to encrypt multiple values: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Create encrypted input for contract function call
   */
  createEncryptedInput(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`
  ): RelayerEncryptedInput {
    return this.instance.createEncryptedInput(contractAddress, userAddress) as RelayerEncryptedInput;
  }

  /**
   * Add data to encrypted input based on type
   */
  private addDataToInput(input: RelayerEncryptedInput, data: any, dataType: FhevmDataType): void {
    switch (dataType) {
      case "externalEbool":
        input.addBool(Boolean(data));
        break;
      case "externalEuint8":
        input.add8(Number(data));
        break;
      case "externalEuint16":
        input.add16(Number(data));
        break;
      case "externalEuint32":
        input.add32(Number(data));
        break;
      case "externalEuint64":
        input.add64(BigInt(data));
        break;
      case "externalEuint128":
        input.add128(BigInt(data));
        break;
      case "externalEuint256":
        input.add256(BigInt(data));
        break;
      case "externalEaddress":
        input.addAddress(data as `0x${string}`);
        break;
      default:
        throw new CloakSDKError(
          ERROR_CODES.ENCRYPTION_FAILED,
          `Unsupported data type: ${dataType}`
        );
    }
  }

  /**
   * Get the encryption method name for a given data type
   */
  static getEncryptionMethod(dataType: FhevmDataType): string {
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
   * Validate data type and value compatibility
   */
  static validateDataType(data: any, dataType: FhevmDataType): boolean {
    switch (dataType) {
      case "externalEbool":
        return typeof data === "boolean";
      case "externalEuint8":
      case "externalEuint16":
      case "externalEuint32":
        return typeof data === "number" && Number.isInteger(data) && data >= 0;
      case "externalEuint64":
      case "externalEuint128":
      case "externalEuint256":
        return typeof data === "bigint" || (typeof data === "string" && !isNaN(Number(data)));
      case "externalEaddress":
        return typeof data === "string" && data.startsWith("0x") && data.length === 42;
      default:
        return false;
    }
  }
}
