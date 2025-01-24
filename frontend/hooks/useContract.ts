import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getInstance } from '../src/fhevmjs.ts';
import { reencryptEuint64 } from '../../hardhat/test/reencrypt.ts';

const toHexString = (bytes: Uint8Array) =>
  '0x' +
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

// Hook for contract initialization
export const useContract = (provider: ethers.Provider, account: string) => {
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadContractAddress = async () => {
      try {
        const deployment =
          !import.meta.env.MOCKED
            ? await import('@deployments/sepolia/MyConfidentialERC20.json')
            : await import('@deployments/localhost/MyConfidentialERC20.json');
        setContractAddress(deployment.address);
      } catch (err) {
        console.error('Error loading contract:', err);
      }
    };
    loadContractAddress();
  }, []);

  return contractAddress;
};

// Hook for managing balances
export const useBalances = (
  provider: ethers.Provider,
  readOnlyProvider: ethers.Provider,
  account: string,
  contractAddress: string | null
) => {
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [encryptedBalance, setEncryptedBalance] = useState<string>('???');

  useEffect(() => {
    const fetchBalances = async () => {
      if (!contractAddress) return;

      const ethBalance = await readOnlyProvider.getBalance(account);
      setEthBalance(ethers.formatEther(ethBalance));

      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address) view returns (uint256)'],
        readOnlyProvider
      );
      const balance = await contract.balanceOf(account);
      setEncryptedBalance(balance.toString());
    };

    fetchBalances();
  }, [account, readOnlyProvider, contractAddress]);

  return { ethBalance, encryptedBalance };
};

// Hook for encryption/decryption
export const useEncryption = (provider: ethers.Provider, account: string, contractAddress: string | null) => {
  const instance = getInstance();
  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [inputProof, setInputProof] = useState<Uint8Array | null>(null);

  const encrypt = async (value: bigint) => {
    try {
      const result = await instance.createEncryptedInput(contractAddress!, account).add64(value).encrypt();
      setHandles(result.handles);
      setInputProof(result.inputProof);
    } catch (err) {
      console.error('Encryption error:', err);
    }
  };

  const decrypt = async (encryptedValue: string) => {
    const signer = provider.getSigner();
    try {
      return await reencryptEuint64(signer, instance, BigInt(encryptedValue), contractAddress!);
    } catch (err) {
      console.error('Decryption error:', err);
      return null;
    }
  };

  return { handles, inputProof, encrypt, decrypt };
};
