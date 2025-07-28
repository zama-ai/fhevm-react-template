import {
  FhevmInitSDKOptions,
  FhevmInitSDKType,
  FhevmInstance,
  FhevmLoadSDKType,
} from "../core/fhevmTypes";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import { JsonRpcProvider } from "ethers";
import { HARDHAT_NODE_CHAIN_ID } from "./constants";

export const fhevmMockTrace = (message: string): string => {
  return `[FHEVM-DEBUG] ${message}`;
}

export const isFhevmMockSupported = (chainId: number): boolean => {
  return chainId === HARDHAT_NODE_CHAIN_ID;
}

export const fhevmMockLoadSDK: FhevmLoadSDKType = () => {
  return Promise.resolve();
};

export const fhevmMockInitSDK: FhevmInitSDKType = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: FhevmInitSDKOptions
) => {
  return Promise.resolve(true);
};

export const fhevmMockCreateInstance = async (): Promise<FhevmInstance> => {
  const provider = new JsonRpcProvider("http://localhost:8545");
  const instance = await MockFhevmInstance.create(provider, provider, {
    aclContractAddress: "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
    chainId: HARDHAT_NODE_CHAIN_ID,
    gatewayChainId: 55815,
    inputVerifierContractAddress: "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
    kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    verifyingContractAddressDecryption:
      "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
    verifyingContractAddressInputVerification:
      "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
  });
  return instance;
};
