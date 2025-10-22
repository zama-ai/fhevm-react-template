import React, { useState } from 'react';
import { useFHEVM } from '../useFHEVM';

interface EncryptButtonProps {
  contractAddress: string;
  values: (number | bigint | boolean)[];
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable encrypt button component
 */
export function EncryptButton({
  contractAddress,
  values,
  onSuccess,
  onError,
  children,
  className = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50",
  disabled = false,
}: EncryptButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fhevm = useFHEVM();

  const handleEncrypt = async () => {
    if (!fhevm.isConnected || !fhevm.isInitialized) {
      onError?.('FHEVM not initialized or wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      const result = await fhevm.encrypt(contractAddress, values);
      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Encryption failed';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEncrypt}
      disabled={disabled || isLoading || !fhevm.isConnected || !fhevm.isInitialized}
      className={className}
    >
      {isLoading ? 'Encrypting...' : children || 'Encrypt'}
    </button>
  );
}

interface DecryptButtonProps {
  handles: string[];
  contractAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable decrypt button component
 */
export function DecryptButton({
  handles,
  contractAddress,
  onSuccess,
  onError,
  children,
  className = "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50",
  disabled = false,
}: DecryptButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fhevm = useFHEVM();

  const handleDecrypt = async () => {
    if (!fhevm.isConnected || !fhevm.isInitialized) {
      onError?.('FHEVM not initialized or wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      const result = await fhevm.decrypt(handles, contractAddress);
      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Decryption failed';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDecrypt}
      disabled={disabled || isLoading || !fhevm.isConnected || !fhevm.isInitialized}
      className={className}
    >
      {isLoading ? 'Decrypting...' : children || 'Decrypt'}
    </button>
  );
}
