/**
 * SDK version and metadata
 */

export const SDK_VERSION = "0.2.0";
export const SDK_NAME = "@fhevm-sdk";
export const SDK_REPOSITORY = "https://github.com/zama-ai/fhevm-react-template";
export const SDK_AUTHOR = "Zama";
export const SDK_LICENSE = "BSD-3-Clause-Clear";

/**
 * SDK information object
 */
export interface SDKInfo {
  name: string;
  version: string;
  repository: string;
  author: string;
  license: string;
  buildDate: string;
}

/**
 * Get SDK version information
 * 
 * @returns SDK metadata object
 * 
 * @example
 * ```typescript
 * import { getSDKInfo } from '@fhevm-sdk';
 * 
 * const info = getSDKInfo();
 * console.log(`Using ${info.name} v${info.version}`);
 * ```
 */
export function getSDKInfo(): SDKInfo {
  return {
    name: SDK_NAME,
    version: SDK_VERSION,
    repository: SDK_REPOSITORY,
    author: SDK_AUTHOR,
    license: SDK_LICENSE,
    buildDate: new Date().toISOString(),
  };
}

/**
 * Log SDK version on import (useful for debugging)
 * Can be disabled by setting FHEVM_SDK_QUIET environment variable
 */
if (typeof console !== "undefined" && typeof process !== "undefined") {
  const isQuiet = process.env?.FHEVM_SDK_QUIET === "true";
  if (!isQuiet) {
    console.log(`[FHEVM SDK] v${SDK_VERSION} loaded`);
  }
}

