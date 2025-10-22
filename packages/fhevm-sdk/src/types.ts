import { ethers } from 'ethers';

export interface FHEVMConfig {
  chainId: number;
  rpcUrl?: string;
  relayerUrl?: string;
  mockChains?: number[];
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface FHEVMInstance {
  status: 'loading' | 'ready' | 'error';
  error?: string;
  instance?: any; // FhevmInstance from @zama-fhe/relayer-sdk
}

export interface EncryptedInput {
  add32: (value: number) => void;
  add64: (value: bigint) => void;
  addBool: (value: boolean) => void;
  encrypt: () => Promise<EncryptedResult>;
}

export interface EncryptedResult {
  handles: string[];
  inputProof: string;
}

export interface DecryptionSignature {
  privateKey: string;
  publicKey: string;
  signature: string;
  contractAddresses: string[];
  userAddress: string;
  startTimestamp: number;
  durationDays: number;
}

export interface FHEVMClient {
  // Core methods
  initialize: (config: FHEVMConfig) => Promise<FHEVMInstance>;
  createEncryptedInput: (contractAddress: string, userAddress: string) => EncryptedInput;
  decrypt: (handles: string[], contractAddress: string, signature: DecryptionSignature) => Promise<Record<string, any>>;
  
  // Utility methods
  isSupported: (chainId: number) => boolean;
  getSupportedChains: () => number[];
}

export interface StorageInterface {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

export interface WalletProvider {
  provider: ethers.Eip1193Provider;
  signer: ethers.JsonRpcSigner;
  address: string;
  chainId: number;
}

export interface FHEVMHookReturn {
  // State
  isConnected: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error?: string;
  
  // Instance
  instance?: FHEVMInstance;
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => void;
  initialize: (config: FHEVMConfig) => Promise<void>;
  
  // FHE Operations
  encrypt: (contractAddress: string, values: (number | bigint | boolean)[]) => Promise<EncryptedResult>;
  decrypt: (handles: string[], contractAddress: string) => Promise<Record<string, any>>;
}

export interface FHEVMComponentProps {
  children?: any; // React.ReactNode
  config: FHEVMConfig;
  onError?: (error: string) => void;
  onReady?: () => void;
}
