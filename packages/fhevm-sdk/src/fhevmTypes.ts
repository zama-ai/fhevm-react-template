import type { FhevmClient, WithAll } from "@fhevm/sdk/ethers";
import type { ethers } from "ethers";
import type { sepolia } from "@fhevm/sdk/chains";

// The main FHEVM instance type - a client that can encrypt and decrypt
export type FhevmInstance = FhevmClient<
  typeof sepolia,
  WithAll,
  ethers.JsonRpcProvider
>;

// Handle-contract pair for decryption requests
export type HandleContractPair = {
  readonly handle: string;
  readonly contractAddress: string;
};

// User decryption results
export type UserDecryptResults = {
  readonly [handle: string]: bigint;
};

export type FhevmDecryptionSignatureType = {
  readonly publicKey: string;
  readonly privateKey: string;
  readonly signature: string;
  readonly startTimestamp: number; // Unix timestamp in seconds
  readonly durationDays: number;
  readonly userAddress: `0x${string}`;
  readonly contractAddresses: readonly `0x${string}`[];
  readonly eip712: EIP712Type;
};

export type EIP712Type = {
  readonly domain: {
    readonly chainId: number | bigint;
    readonly name: string;
    readonly verifyingContract: `0x${string}`;
    readonly version: string;
  };

  readonly message: any;
  readonly primaryType: string;
  readonly types: any;
};
