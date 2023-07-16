import { BrowserProvider } from 'ethers';
import { initFhevm, createInstance, FhevmInstance } from 'fhevmjs';

export const init = async () => {
  await initFhevm();
};

let instance: FhevmInstance;

export const createFhevmInstance = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = +network.chainId.toString();
  const publicKey = await provider.call({
    from: null,
    to: '0x0000000000000000000000000000000000000044',
  });
  instance = await createInstance({ chainId, publicKey });
};

export const getInstance = () => {
  return instance;
};
