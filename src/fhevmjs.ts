import { isAddress } from 'ethers';
import { initFhevm, createInstance, FhevmInstance } from 'fhevmjs';

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
  console.log('wtf');
};

let instancePromise: Promise<FhevmInstance>;
let instance: FhevmInstance;

const keypairs: Keypairs = {};

export const createFhevmInstance = async () => {
  if (instancePromise) return instancePromise;
  instancePromise = createInstance({
    network: window.ethereum,
    aclContractAddress: '0x9479B455904dCccCf8Bc4f7dF8e9A1105cBa2A8e',
    kmsContractAddress: '0x904Af2B61068f686838bD6257E385C2cE7a09195',
    gatewayUrl: 'https://gateway-sepolia.kms-dev-v1.bc.zama.team/',
  });
  instance = await instancePromise;
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
