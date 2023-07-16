import { BrowserProvider } from 'ethers';
import { initFhevm, createInstance, FhevmInstance } from 'fhevmjs/web';

export const init = async () => {
  await initFhevm();
};

let instance: FhevmInstance;

export const createFhevmInstance = async () => {
  const chainIdHex = await window.ethereum.request<string>({ method: 'eth_chainId' });
  const provider = new BrowserProvider(window.ethereum);
  const publicKey = await provider.call({ from: null, to: '0x0000000000000000000000000000000000000044' });
  const chainId = parseInt(chainIdHex, 16);
  if (chainId !== 9000) throw new Error('Invalid port');
  instance = await createInstance({ chainId, publicKey });
};

export const getInstance = () => {
  return instance;
};
