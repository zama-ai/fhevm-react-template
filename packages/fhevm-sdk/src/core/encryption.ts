import { EncryptedInput, EncryptedResult } from '../types';

/**
 * Encryption utilities for FHEVM operations
 */
export class EncryptionUtils {
  /**
   * Create encrypted input with multiple values
   */
  static async createEncryptedInput(
    encryptedInput: EncryptedInput,
    values: (number | bigint | boolean)[]
  ): Promise<EncryptedResult> {
    // Add all values to the encrypted input
    for (const value of values) {
      if (typeof value === 'number') {
        encryptedInput.add32(value);
      } else if (typeof value === 'bigint') {
        encryptedInput.add64(value);
      } else if (typeof value === 'boolean') {
        encryptedInput.addBool(value);
      }
    }

    // Encrypt the input
    return await encryptedInput.encrypt();
  }

  /**
   * Create encrypted input for a single value
   */
  static async encryptSingleValue(
    encryptedInput: EncryptedInput,
    value: number | bigint | boolean
  ): Promise<EncryptedResult> {
    if (typeof value === 'number') {
      encryptedInput.add32(value);
    } else if (typeof value === 'bigint') {
      encryptedInput.add64(value);
    } else if (typeof value === 'boolean') {
      encryptedInput.addBool(value);
    }

    return await encryptedInput.encrypt();
  }

  /**
   * Batch encrypt multiple values
   */
  static async batchEncrypt(
    encryptedInput: EncryptedInput,
    values: (number | bigint | boolean)[][]
  ): Promise<EncryptedResult[]> {
    const results: EncryptedResult[] = [];

    for (const batch of values) {
      const result = await this.createEncryptedInput(encryptedInput, batch);
      results.push(result);
    }

    return results;
  }
}

/**
 * Helper function to create encrypted input
 */
export function createEncryptedInput(
  encryptedInput: EncryptedInput,
  values: (number | bigint | boolean)[]
): Promise<EncryptedResult> {
  return EncryptionUtils.createEncryptedInput(encryptedInput, values);
}

/**
 * Helper function to encrypt single value
 */
export function encryptSingleValue(
  encryptedInput: EncryptedInput,
  value: number | bigint | boolean
): Promise<EncryptedResult> {
  return EncryptionUtils.encryptSingleValue(encryptedInput, value);
}
