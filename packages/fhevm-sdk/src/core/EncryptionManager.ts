import { FhevmInstance } from "../fhevmTypes.js";
import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";

/**
 * Result of an encryption operation.
 * @public
 */
export interface EncryptResult {
  /** Array of encrypted value handles */
  handles: Uint8Array[];
  /** Zero-knowledge proof of correct encryption */
  inputProof: Uint8Array;
}

/**
 * Encryption manager for FHEVM operations.
 * 
 * This class provides a framework-agnostic interface for encrypting data
 * using Fully Homomorphic Encryption (FHE) before sending it to smart contracts.
 * 
 * @example
 * Basic usage:
 * ```typescript
 * const manager = new EncryptionManager(
 *   fhevmInstance,
 *   '0x1234...', // contract address
 *   '0x5678...'  // user address
 * );
 * 
 * const result = await manager.encrypt((builder) => {
 *   builder.add32(42);
 *   builder.add64(BigInt(1000));
 * });
 * ```
 * 
 * @example
 * With contract interaction:
 * ```typescript
 * const encrypted = await manager.encrypt((builder) => {
 *   builder.add32(secretValue);
 * });
 * 
 * const params = EncryptionManager.buildParamsFromAbi(
 *   encrypted,
 *   contractAbi,
 *   'setEncryptedValue'
 * );
 * 
 * await contract.setEncryptedValue(...params);
 * ```
 * 
 * @public
 */
export class EncryptionManager {
  /**
   * Creates a new EncryptionManager instance.
   * 
   * @param instance - The initialized FHEVM instance
   * @param contractAddress - The target smart contract address
   * @param userAddress - The user's wallet address
   * 
   * @throws {TypeError} If any required parameter is missing
   */
  constructor(
    private readonly instance: FhevmInstance,
    private readonly contractAddress: string,
    private readonly userAddress: string
  ) {
    if (!instance) {
      throw new TypeError('EncryptionManager: instance is required');
    }
    if (!contractAddress) {
      throw new TypeError('EncryptionManager: contractAddress is required');
    }
    if (!userAddress) {
      throw new TypeError('EncryptionManager: userAddress is required');
    }
  }

  /**
   * Encrypts data using the provided builder function.
   * 
   * @param buildFn - Function that receives a builder and adds encrypted values
   * @returns Promise resolving to encryption result with handles and proof
   * 
   * @throws {Error} If encryption fails
   * 
   * @example
   * Encrypt a single value:
   * ```typescript
   * const result = await manager.encrypt((builder) => {
   *   builder.add32(42);
   * });
   * ```
   * 
   * @example
   * Encrypt multiple values:
   * ```typescript
   * const result = await manager.encrypt((builder) => {
   *   builder.add32(42);
   *   builder.addBool(true);
   *   builder.add64(BigInt(1000));
   * });
   * ```
   */
  async encrypt(
    buildFn: (builder: RelayerEncryptedInput) => void
  ): Promise<EncryptResult> {
    try {
      // Create encrypted input builder
      const input = this.instance.createEncryptedInput(
        this.contractAddress,
        this.userAddress
      ) as RelayerEncryptedInput;

      // Allow caller to add values to encrypt
      buildFn(input);

      // Execute encryption
      const encrypted = await input.encrypt();

      return encrypted;
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Checks if encryption is possible with current configuration.
   * 
   * @returns True if all required parameters are available
   * 
   * @example
   * ```typescript
   * if (manager.canEncrypt()) {
   *   await manager.encrypt((builder) => builder.add32(42));
   * } else {
   *   console.log('Cannot encrypt: missing parameters');
   * }
   * ```
   */
  canEncrypt(): boolean {
    return Boolean(
      this.instance &&
      this.contractAddress &&
      this.userAddress
    );
  }

  /**
   * Gets the contract address this manager is configured for.
   * 
   * @returns The contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Gets the user address this manager is configured for.
   * 
   * @returns The user address
   */
  getUserAddress(): string {
    return this.userAddress;
  }

  /**
   * Maps Solidity internal type names to RelayerEncryptedInput builder method names.
   * 
   * @param internalType - The Solidity internal type (e.g., 'externalEuint32')
   * @returns The corresponding builder method name (e.g., 'add32')
   * 
   * @remarks
   * This is useful for dynamically building encrypted inputs based on ABI definitions.
   * Falls back to 'add64' for unknown types.
   * 
   * @example
   * ```typescript
   * const method = EncryptionManager.getEncryptionMethod('externalEuint32');
   * // Returns 'add32'
   * 
   * const result = await manager.encrypt((builder) => {
   *   (builder as any)[method](value);
   * });
   * ```
   */
  static getEncryptionMethod(internalType: string): string {
    const methodMap: Record<string, string> = {
      'externalEbool': 'addBool',
      'externalEuint8': 'add8',
      'externalEuint16': 'add16',
      'externalEuint32': 'add32',
      'externalEuint64': 'add64',
      'externalEuint128': 'add128',
      'externalEuint256': 'add256',
      'externalEaddress': 'addAddress',
    };

    const method = methodMap[internalType];
    
    if (!method) {
      console.warn(
        `EncryptionManager: Unknown internal type '${internalType}', defaulting to 'add64'`
      );
      return 'add64';
    }

    return method;
  }

  /**
   * Converts a Uint8Array or hex string to a 0x-prefixed hex string.
   * 
   * @param value - The value to convert (Uint8Array or string)
   * @returns A 0x-prefixed hex string
   * 
   * @example
   * From Uint8Array:
   * ```typescript
   * const hex = EncryptionManager.toHex(new Uint8Array([1, 2, 3]));
   * // Returns '0x010203'
   * ```
   * 
   * @example
   * From string:
   * ```typescript
   * const hex = EncryptionManager.toHex('010203');
   * // Returns '0x010203'
   * ```
   * 
   * @example
   * Already prefixed:
   * ```typescript
   * const hex = EncryptionManager.toHex('0x010203');
   * // Returns '0x010203'
   * ```
   */
  static toHex(value: Uint8Array | string): `0x${string}` {
    if (typeof value === 'string') {
      return (value.startsWith('0x') ? value : `0x${value}`) as `0x${string}`;
    }
    
    // Convert Uint8Array to hex
    return ('0x' + Buffer.from(value).toString('hex')) as `0x${string}`;
  }

  /**
   * Builds contract function parameters from encryption result and ABI.
   * 
   * @param enc - The encryption result containing handles and proof
   * @param abi - The contract ABI array
   * @param functionName - The name of the function to call
   * @returns Array of parameters ready to pass to the contract function
   * 
   * @throws {Error} If function is not found in ABI
   * 
   * @remarks
   * This helper automatically maps encryption outputs to the correct parameter types
   * based on the function's ABI definition. Typically, the first parameter is the
   * encrypted handle(s) and the second is the input proof.
   * 
   * @example
   * ```typescript
   * const encrypted = await manager.encrypt((builder) => builder.add32(42));
   * 
   * const params = EncryptionManager.buildParamsFromAbi(
   *   encrypted,
   *   contractAbi,
   *   'setEncryptedValue'
   * );
   * 
   * // Use with ethers.js
   * await contract.setEncryptedValue(...params);
   * ```
   */
  static buildParamsFromAbi(
    enc: EncryptResult,
    abi: any[],
    functionName: string
  ): any[] {
    // Find the function in ABI
    const fn = abi.find(
      (item: any) => item.type === 'function' && item.name === functionName
    );

    if (!fn) {
      throw new Error(`Function '${functionName}' not found in contract ABI`);
    }

    // Map each input parameter
    return fn.inputs.map((input: any, index: number) => {
      // First param is typically the handle, rest is proof
      const raw = index === 0 ? enc.handles[0] : enc.inputProof;

      // Convert based on Solidity type
      switch (input.type) {
        case 'bytes32':
        case 'bytes':
          return EncryptionManager.toHex(raw);
        
        case 'uint256':
          return BigInt(raw as unknown as string);
        
        case 'address':
        case 'string':
          return raw as unknown as string;
        
        case 'bool':
          return Boolean(raw);
        
        default:
          console.warn(
            `EncryptionManager: Unknown ABI parameter type '${input.type}' for function '${functionName}', converting to hex`
          );
          return EncryptionManager.toHex(raw);
      }
    });
  }
}

