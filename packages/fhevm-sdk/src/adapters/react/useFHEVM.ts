import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { FHEVMConfig, FHEVMInstance, FHEVMHookReturn, StorageInterface } from '../../types';
import { getFHEVMClient } from '../../core/fhevm-client';
import { createEncryptedInput } from '../../core/encryption';
import { createDecryptionSignature, decryptHandles } from '../../core/decryption';

/**
 * React hook for FHEVM operations
 * Provides a wagmi-like API for React applications
 */
export function useFHEVM(_config?: FHEVMConfig): FHEVMHookReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [instance, setInstance] = useState<FHEVMInstance | undefined>();

  const clientRef = useRef(getFHEVMClient());
  const storageRef = useRef<StorageInterface | null>(null);

  // Initialize storage
  useEffect(() => {
    // Create in-memory storage by default
    storageRef.current = {
      get: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      set: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Failed to store data:', error);
        }
      },
      remove: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to remove data:', error);
        }
      },
    };
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.getSigner();
      await provider.getNetwork();

      setIsConnected(true);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setIsInitialized(false);
    setInstance(undefined);
    setError(undefined);
  }, []);

  // Initialize FHEVM
  const initialize = useCallback(async (initConfig: FHEVMConfig) => {
    try {
      setIsLoading(true);
      setError(undefined);

      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      const client = clientRef.current;
      const fhevmInstance = await client.initialize(initConfig);

      if (fhevmInstance.status === 'error') {
        throw new Error(fhevmInstance.error || 'Failed to initialize FHEVM');
      }

      setInstance(fhevmInstance);
      setIsInitialized(true);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize FHEVM';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [isConnected]);

  // Encrypt values
  const encrypt = useCallback(async (
    contractAddress: string,
    values: (number | bigint | boolean)[]
  ) => {
    if (!instance?.instance || !isConnected) {
      throw new Error('FHEVM not initialized or wallet not connected');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const encryptedInput = instance.instance.createEncryptedInput(contractAddress, userAddress);
      return await createEncryptedInput(encryptedInput, values);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
      setError(errorMessage);
      throw err;
    }
  }, [instance, isConnected]);

  // Decrypt handles
  const decrypt = useCallback(async (
    handles: string[],
    contractAddress: string
  ) => {
    if (!instance?.instance || !isConnected || !storageRef.current) {
      throw new Error('FHEVM not initialized, wallet not connected, or storage not available');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      const signature = await createDecryptionSignature(
        instance.instance,
        [contractAddress],
        signer,
        storageRef.current
      );

      if (!signature) {
        throw new Error('Failed to create decryption signature');
      }

      return await decryptHandles(instance.instance, handles, contractAddress, signature);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Decryption failed';
      setError(errorMessage);
      throw err;
    }
  }, [instance, isConnected]);

  return {
    // State
    isConnected,
    isInitialized,
    isLoading,
    error,
    
    // Instance
    instance,
    
    // Methods
    connect,
    disconnect,
    initialize,
    
    // FHE Operations
    encrypt,
    decrypt,
  };
}

/**
 * Hook for FHEVM with automatic initialization
 */
export function useFHEVMWithConfig(config: FHEVMConfig) {
  const fhevm = useFHEVM(config);

  // Auto-initialize when config is provided
  useEffect(() => {
    if (config && fhevm.isConnected && !fhevm.isInitialized && !fhevm.isLoading) {
      fhevm.initialize(config);
    }
  }, [config, fhevm.isConnected, fhevm.isInitialized, fhevm.isLoading]);

  return fhevm;
}
