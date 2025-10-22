// Vue imports - only import if Vue is available
let ref: any, computed: any, watch: any;
try {
  const vue = require('vue');
  ref = vue.ref;
  computed = vue.computed;
  watch = vue.watch;
} catch (e) {
  // Vue not available, will throw error when used
}
import { ethers } from 'ethers';
import { FHEVMConfig } from '../../types';
import { getFHEVMClient } from '../../core/fhevm-client';
import { createEncryptedInput } from '../../core/encryption';
import { createDecryptionSignature, decryptHandles } from '../../core/decryption';

/**
 * Vue composable for FHEVM operations
 * Provides a wagmi-like API for Vue applications
 */
export function useFHEVM(config?: FHEVMConfig) {
  const isConnected = ref(false);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref(undefined);
  const instance = ref(undefined);

  const client = getFHEVMClient();
  const storage = ref(null);

  // Initialize storage
  const initStorage = () => {
    storage.value = {
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
  };

  // Connect to wallet
  const connect = async () => {
    try {
      isLoading.value = true;
      error.value = undefined;

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.getSigner();

      isConnected.value = true;
      isLoading.value = false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      error.value = errorMessage;
      isLoading.value = false;
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    isConnected.value = false;
    isInitialized.value = false;
    instance.value = undefined;
    error.value = undefined;
  };

  // Initialize FHEVM
  const initialize = async (initConfig: FHEVMConfig) => {
    try {
      isLoading.value = true;
      error.value = undefined;

      if (!isConnected.value) {
        throw new Error('Wallet not connected');
      }

      const fhevmInstance = await client.initialize(initConfig);

      if (fhevmInstance.status === 'error') {
        throw new Error(fhevmInstance.error || 'Failed to initialize FHEVM');
      }

      instance.value = fhevmInstance;
      isInitialized.value = true;
      isLoading.value = false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize FHEVM';
      error.value = errorMessage;
      isLoading.value = false;
    }
  };

  // Encrypt values
  const encrypt = async (contractAddress: string, values: (number | bigint | boolean)[]) => {
    if (!instance.value?.instance || !isConnected.value) {
      throw new Error('FHEVM not initialized or wallet not connected');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const encryptedInput = instance.value.instance.createEncryptedInput(contractAddress, userAddress);
      return await createEncryptedInput(encryptedInput, values);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
      error.value = errorMessage;
      throw err;
    }
  };

  // Decrypt handles
  const decrypt = async (handles: string[], contractAddress: string) => {
    if (!instance.value?.instance || !isConnected.value || !storage.value) {
      throw new Error('FHEVM not initialized, wallet not connected, or storage not available');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      const signature = await createDecryptionSignature(
        instance.value.instance,
        [contractAddress],
        signer,
        storage.value
      );

      if (!signature) {
        throw new Error('Failed to create decryption signature');
      }

      return await decryptHandles(instance.value.instance, handles, contractAddress, signature);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Decryption failed';
      error.value = errorMessage;
      throw err;
    }
  };

  // Auto-initialize storage
  initStorage();

  // Auto-initialize when config is provided
  watch([config, isConnected], async () => {
    if (config && isConnected.value && !isInitialized.value && !isLoading.value) {
      await initialize(config);
    }
  });

  return {
    // State
    isConnected: computed(() => isConnected.value),
    isInitialized: computed(() => isInitialized.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Instance
    instance: computed(() => instance.value),
    
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
 * Composable for FHEVM with automatic initialization
 */
export function useFHEVMWithConfig(config: FHEVMConfig) {
  return useFHEVM(config);
}
