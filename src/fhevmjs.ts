import { isAddress } from 'ethers';
import { initFhevm, createInstance, FhevmInstance } from 'fhevmjs/bundle';
import {
  getPublicKey,
  getPublicParams,
  storePublicKey,
  storePublicParams,
} from './fhevmStorage';

const ACL_ADDRESS: string = import.meta.env.VITE_ACL_ADDRESS;

export type Keypair = {
  publicKey: string;
  privateKey: string;
  signature: string;
};

type Keypairs = {
  [key: string]: {
    [key: string]: Keypair;
  };
};

export const init = initFhevm;

let instancePromise: Promise<FhevmInstance>;
let instance: FhevmInstance;

const keypairs: Keypairs = {};

export const createFhevmInstance = async () => {
  if (instancePromise) return instancePromise;
  const storedPublicKey = await getPublicKey(ACL_ADDRESS);
  const publicKey = storedPublicKey?.publicKey;
  const publicKeyId = storedPublicKey?.publicKeyId;
  const storedPublicParams = await getPublicParams(ACL_ADDRESS);
  const publicParams = storedPublicParams
    ? {
        '2048': storedPublicParams,
      }
    : null;
  instancePromise = createInstance({
    network: window.ethereum,
    aclContractAddress: ACL_ADDRESS,
    kmsContractAddress: import.meta.env.VITE_KMS_ADDRESS,
    gatewayUrl: import.meta.env.VITE_GATEWAY_URL,
    publicKey,
    publicKeyId,
    publicParams,
  });
  instance = await instancePromise;
  const pp = instance.getPublicParams(2048);
  if (pp) {
    await storePublicParams(ACL_ADDRESS, pp);
  }
  const pk = instance.getPublicKey();
  if (pk) {
    await storePublicKey(ACL_ADDRESS, pk);
  }
};

export const setKeypair = (
  contractAddress: string,
  userAddress: string,
  keypair: Keypair,
) => {
  if (!isAddress(contractAddress) || !isAddress(userAddress)) return;
  keypairs[userAddress][contractAddress] = keypair;
};

export const getKeypair = (
  contractAddress: string,
  userAddress: string,
): Keypair | null => {
  if (!isAddress(contractAddress) || !isAddress(userAddress)) return null;
  return keypairs[userAddress]
    ? keypairs[userAddress][contractAddress] || null
    : null;
};

export const getInstance = (): FhevmInstance => {
  return instance;
};
