/**
 * FHEVM SDK Configuration Constants
 */

/**
 * Relayer SDK CDN URL
 */
export const SDK_CDN_URL =
  "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs";

/**
 * Default decryption signature duration (365 days / 1 year)
 */
export const DEFAULT_SIGNATURE_DURATION_DAYS = 365;

/**
 * FHEVM instance initialization timeout (30 seconds)
 */
export const FHEVM_INIT_TIMEOUT_MS = 30000;

/**
 * IndexedDB database name for FHEVM storage
 */
export const FHEVM_STORAGE_DB_NAME = "fhevm-sdk-storage";

/**
 * Storage key prefix for decryption signatures
 */
export const DECRYPTION_SIGNATURE_STORE_KEY = "fhevm-decryption-signatures";

/**
 * Default polling interval for status checks (ms)
 */
export const DEFAULT_POLLING_INTERVAL_MS = 1000;

/**
 * Default local chain ID (Hardhat)
 */
export const DEFAULT_LOCAL_CHAIN_ID = 31337;

/**
 * Default local RPC URL
 */
export const DEFAULT_LOCAL_RPC_URL = "http://localhost:8545";

/**
 * Gateway chain ID for mock FHEVM
 */
export const MOCK_GATEWAY_CHAIN_ID = 55815;
