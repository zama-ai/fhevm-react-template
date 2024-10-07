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
  await initFhevm();
};

let instancePromise: Promise<FhevmInstance>;
let instance: FhevmInstance;

const keypairs: Keypairs = {};

export const createFhevmInstance = async () => {
  if (instancePromise) return instancePromise;
  instancePromise = createInstance({
    network: window.ethereum,
    aclContractAddress: '0x7DC28FBFbF129d4E27f214bE9900efE806Def6d2',
    kmsContractAddress: '0x973AfA7Aa85a1B3cB273226Dd4Acb29c546BDD7a',
    gatewayUrl: 'https://gateway.devnet.zama.ai/',
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
