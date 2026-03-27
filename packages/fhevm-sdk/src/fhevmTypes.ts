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
