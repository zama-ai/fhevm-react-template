import { 
  FhevmInstance, 
  DecryptResult, 
  DecryptionOptions,
  FhevmDecryptionSignatureType,
  ERROR_CODES
} from "./types";
import { CloakSDKError } from "./index";

export class CloakDecryption {
  private instance: FhevmInstance;

  constructor(instance: FhevmInstance) {
    this.instance = instance;
  }

  /**
   * Decrypt data using user's private key (EIP-712 signature)
   */
  async decrypt(options: DecryptionOptions): Promise<DecryptResult> {
    try {
      const { contractAddress: _contractAddress, userAddress: _userAddress, encryptedData, signature } = options;

      if (!signature) {
        throw new CloakSDKError(
          ERROR_CODES.DECRYPTION_FAILED,
          "Signature is required for decryption"
        );
      }

      // Use the FHEVM instance to decrypt with EIP-712 signature
      const result = await (this.instance as any).decrypt(encryptedData, signature);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown decryption error",
      };
    }
  }

  /**
   * Decrypt data using public key (for public decryption)
   */
  async publicDecrypt(encryptedData: Uint8Array): Promise<DecryptResult> {
    try {
      // Use the FHEVM instance for public decryption
      const result = await (this.instance as any).publicDecrypt([encryptedData]);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown public decryption error",
      };
    }
  }

  /**
   * Generate EIP-712 signature for decryption
   */
  async generateDecryptionSignature(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    durationDays: number = 30
  ): Promise<FhevmDecryptionSignatureType> {
    try {
      // Generate EIP-712 signature for decryption authorization
      const signature = await (this.instance as any).generateDecryptionSignature(
        contractAddress,
        userAddress,
        durationDays
      );

      return signature;
    } catch (error) {
      throw new CloakSDKError(
        ERROR_CODES.DECRYPTION_FAILED,
        `Failed to generate decryption signature: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Decrypt multiple values at once
   */
  async decryptMultiple(
    encryptedDataArray: Uint8Array[],
    signature: string,
    contractAddress?: `0x${string}`,
    userAddress?: `0x${string}`
  ): Promise<DecryptResult[]> {
    const results: DecryptResult[] = [];

    for (const encryptedData of encryptedDataArray) {
      const result = await this.decrypt({
        contractAddress: contractAddress || "0x6dd89f22f09B3Ce06c6A743C8088A98b0DF522a2", // Use provided address or fallback to deployed counter
        userAddress: userAddress || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Use provided address or fallback to demo wallet
        encryptedData,
        signature,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Check if decryption signature is valid
   */
  static isSignatureValid(signature: FhevmDecryptionSignatureType): boolean {
    try {
      // Check if signature has all required fields
      if (!signature.publicKey || !signature.privateKey || !signature.signature) {
        return false;
      }

      // Check if signature is not expired
      const now = Math.floor(Date.now() / 1000);
      const expirationTime = signature.startTimestamp + (signature.durationDays * 24 * 60 * 60);
      
      return now < expirationTime;
    } catch {
      return false;
    }
  }

  /**
   * Get remaining time for a decryption signature
   */
  static getSignatureRemainingTime(signature: FhevmDecryptionSignatureType): number {
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = signature.startTimestamp + (signature.durationDays * 24 * 60 * 60);
    return Math.max(0, expirationTime - now);
  }

  /**
   * Format signature expiration time
   */
  static formatSignatureExpiration(signature: FhevmDecryptionSignatureType): string {
    const remainingSeconds = this.getSignatureRemainingTime(signature);
    
    if (remainingSeconds === 0) {
      return "Expired";
    }

    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
