import type { FhevmInstance as _FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { HandleContractPair as _HandleContractPair } from "@zama-fhe/relayer-sdk/bundle";
import type { DecryptedResults as _DecryptedResults } from "@zama-fhe/relayer-sdk/bundle";
import type { FhevmInstanceConfig as _FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/web";
import type { Eip1193Provider } from "ethers";

// Re-export Zama types for convenience
export type FhevmInstance = _FhevmInstance;
export type FhevmInstanceConfig = _FhevmInstanceConfig;
export type HandleContractPair = _HandleContractPair;
export type DecryptedResults = _DecryptedResults;

// Core SDK Types
export type Provider = Eip1193Provider | string;

export type ChainConfig = {
  chainId: number;
  rpcUrl?: string;
  name?: string;
};

export type MockChainConfig = {
  chainId: number;
  rpcUrl: string;
  name?: string;
};

export type FhevmSDKConfig = {
  provider: Provider;
  mockChains?: Record<number, string>;
  onStatusChange?: (status: FhevmStatus) => void;
  signal?: AbortSignal;
};

export type FhevmStatus = 
  | "idle"
  | "sdk-loading"
  | "sdk-loaded"
  | "sdk-initializing"
  | "sdk-initialized"
  | "creating"
  | "ready"
  | "error";

export type EncryptResult = {
  handles: Uint8Array[];
  inputProof: Uint8Array;
};

export type DecryptResult = {
  success: boolean;
  data?: any;
  error?: string;
};

export type EncryptionOptions = {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  data: any;
  dataType: FhevmDataType;
};

export type DecryptionOptions = {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  encryptedData: Uint8Array;
  signature?: string;
};

export type FhevmDataType = 
  | "externalEbool"
  | "externalEuint8"
  | "externalEuint16"
  | "externalEuint32"
  | "externalEuint64"
  | "externalEuint128"
  | "externalEuint256"
  | "externalEaddress";

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number; // Unix timestamp in seconds
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

export type EIP712Type = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: `0x${string}`;
    version: string;
  };
  message: any;
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
};

export type ContractCallOptions = {
  contractAddress: `0x${string}`;
  functionName: string;
  abi: any[];
  encryptedParams?: EncryptResult;
  regularParams?: any[];
  signer?: any; // ethers signer
};

export type StorageAdapter = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

export type CloakSDKError = {
  code: string;
  message: string;
  cause?: unknown;
};

// Error codes
export const ERROR_CODES = {
  SDK_NOT_INITIALIZED: "SDK_NOT_INITIALIZED",
  INVALID_PROVIDER: "INVALID_PROVIDER",
  INVALID_ADDRESS: "INVALID_ADDRESS",
  ENCRYPTION_FAILED: "ENCRYPTION_FAILED",
  DECRYPTION_FAILED: "DECRYPTION_FAILED",
  CONTRACT_CALL_FAILED: "CONTRACT_CALL_FAILED",
  NETWORK_ERROR: "NETWORK_ERROR",
  ABORTED: "ABORTED",
  INVALID_CONFIG: "INVALID_CONFIG",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
