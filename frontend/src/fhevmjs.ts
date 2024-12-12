import { isAddress } from 'ethers';
import {
  initFhevm,
  createInstance,
  FhevmInstance,
  createEIP712,
  generateKeypair,
} from 'fhevmjs';
import {
  getPublicKey,
  getPublicParams,
  storePublicKey,
  storePublicParams,
} from './fhevmStorage';

import {
  reencryptRequestMocked,
  createEncryptedInputMocked,
} from './fhevmjsMocked';

const ACL_ADDRESS: string = import.meta.env.VITE_ACL_ADDRESS;
const MOCKED: string = import.meta.env.MOCKED;

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

export const getInstance = () => {
  if (MOCKED) {
    const instanceMocked = {
      reencrypt: reencryptRequestMocked,
      createEncryptedInput: createEncryptedInputMocked,
      getPublicKey: () => '0xFFAA44433',
      generateKeypair: generateKeypair,
      createEIP712: createEIP712(31337),
    };
    return instanceMocked;
  } else {
    return instance;
  }
};
