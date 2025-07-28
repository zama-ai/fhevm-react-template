import type {
  FhevmInitSDKOptions,
  FhevmInitSDKType,
  FhevmInstance,
  FhevmInstanceConfig,
  FhevmLoadSDKType,
} from "../core/fhevmTypes";
import { isFhevmWindowType, RelayerSDKLoader } from "./RelayerSDKLoader";
import { isAddress } from "ethers";
import { publicKeyStorageGet, publicKeyStorageSet } from "./PublicKeyStorage";
import { SEPOLIA_CHAIN_ID } from "../core/constants";

export const fhevmTrace = (message: string): string => {
  return `[FHEVM-RELEASE] ${message}`;
}

export const isFhevmSupported = (chainId: number): boolean => {
  return chainId === SEPOLIA_CHAIN_ID;
}

export const fhevmLoadSDK: FhevmLoadSDKType = () => {
  const loader = new RelayerSDKLoader({ trace: console.log });
  return loader.load();
};

export const fhevmInitSDK: FhevmInitSDKType = (
  options?: FhevmInitSDKOptions
) => {
  if (!isFhevmWindowType(window, console.log)) {
    throw new Error("window.relayerSDK is not available");
  }
  return window.relayerSDK.initSDK(options);
};

function checkIsAddress(a: unknown): a is `0x${string}` {
  if (typeof a !== "string") {
    return false;
  }
  if (!isAddress(a)) {
    return false;
  }
  return true;
}

export async function fhevmGetConfig(): Promise<FhevmInstanceConfig> {
  if (!isFhevmWindowType(window, console.log)) {
    throw new Error("window.relayerSDK is not available");
  }

  const aclAddress = window.relayerSDK.SepoliaConfig.aclContractAddress;
  if (!checkIsAddress(aclAddress)) {
    throw new Error(`Invalid address: ${aclAddress}`);
  }

  const pub = await publicKeyStorageGet(aclAddress);

  return {
    ...window.relayerSDK.SepoliaConfig,
    ...(pub.publicKey !== undefined && { publicKey: pub.publicKey }),
    publicParams: pub.publicParams,
    network: window.ethereum,
  };
}

export const fhevmCreateInstance = async (): Promise<FhevmInstance> => {
  if (!isFhevmWindowType(window, console.log)) {
    throw new Error("window.relayerSDK is not available");
  }

  const aclAddress = window.relayerSDK.SepoliaConfig.aclContractAddress;
  if (!checkIsAddress(aclAddress)) {
    throw new Error(`Invalid address: ${aclAddress}`);
  }

  const pub = await publicKeyStorageGet(aclAddress);

  const config: FhevmInstanceConfig = {
    ...window.relayerSDK.SepoliaConfig,
    network: window.ethereum,
    publicKey: pub.publicKey,
    publicParams: pub.publicParams,
  };

  const instance = await window.relayerSDK.createInstance(config);

  await publicKeyStorageSet(
    aclAddress,
    instance.getPublicKey(),
    instance.getPublicParams(2048)
  );

  return instance;
}
