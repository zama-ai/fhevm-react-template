import { isAddress } from 'ethers';
import { initFhevm, createInstance, FhevmInstance } from 'fhevmjs';
import { getPublicKey, getPublicParams, storePublicKey, storePublicParams } from './fhevmStorage';

const ACL_ADDRESS = '0x9479B455904dCccCf8Bc4f7dF8e9A1105cBa2A8e';

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

export const init = async () => {
  await initFhevm({ thread: navigator.hardwareConcurrency });
};

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
    kmsContractAddress: '0x904Af2B61068f686838bD6257E385C2cE7a09195',
    gatewayUrl: 'https://gateway-sepolia.kms-dev-v1.bc.zama.team/',
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

export const setKeypair = (contractAddress: string, userAddress: string, keypair: Keypair) => {
  if (!isAddress(contractAddress) || !isAddress(userAddress)) return;
  keypairs[userAddress][contractAddress] = keypair;
};

export const getKeypair = (contractAddress: string, userAddress: string): Keypair | null => {
  if (!isAddress(contractAddress) || !isAddress(userAddress)) return null;
  return keypairs[userAddress] ? keypairs[userAddress][contractAddress] || null : null;
};

export const getInstance = (): FhevmInstance => {
  return instance;
};
