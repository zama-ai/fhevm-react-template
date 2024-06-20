import { TransactionRequest, isAddress } from 'ethers';
import { BrowserProvider, AbiCoder } from 'ethers';
import { initFhevm, createInstance, FhevmInstance, getPublicKeyCallParams } from 'fhevmjs';

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

let instance: FhevmInstance;

const keypairs: Keypairs = {};

export const createFhevmInstance = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = +network.chainId.toString();
  const params: TransactionRequest = getPublicKeyCallParams();
  const ret = await provider.call(params);
  const decoded = AbiCoder.defaultAbiCoder().decode(['bytes'], ret);
  const publicKey = decoded[0];
  instance = await createInstance({ chainId, publicKey });
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
