import { useEffect, useState } from 'react';
import { getInstance } from '../../src/fhevmjs.ts';
import { Eip1193Provider, Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
//import { useContract, useBalances, useEncryption } from '@/hooks/useContract';

import { reencryptEuint64 } from '../../../hardhat/test/reencrypt.ts';

const toHexString = (bytes: Uint8Array) =>
  '0x' +
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export type DevnetProps = {
  account: string;
  provider: Eip1193Provider;
  readOnlyProvider: Provider;
};

export const Devnet = ({
  account,
  provider,
  readOnlyProvider,
}: DevnetProps) => {
  const [contractAddress, setContractAddress] = useState(ZeroAddress);

  const [handleBalance, setHandleBalance] = useState('0');
  const [decryptedBalance, setDecryptedBalance] = useState('???');

  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [encryption, setEncryption] = useState<Uint8Array>();

  const [inputValue, setInputValue] = useState(''); // Track the input
  const [chosenValue, setChosenValue] = useState('0'); // Track the confirmed value

  const [inputValueAddress, setInputValueAddress] = useState('');
  const [chosenAddress, setChosenAddress] = useState('0x');
  const [errorMessage, setErrorMessage] = useState('');

  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Conditional import based on MOCKED environment variable
        let MyConfidentialERC20;
        if (!import.meta.env.MOCKED) {
          MyConfidentialERC20 = await import(
            '@deployments/sepolia/MyConfidentialERC20.json'
          );
          console.log(
            `Using ${MyConfidentialERC20.address} for the token address on Sepolia`,
          );
        } else {
          MyConfidentialERC20 = await import(
            '@deployments/localhost/MyConfidentialERC20.json'
          );
          console.log(
            `Using ${MyConfidentialERC20.address} for the token address on Hardhat Local Node`,
          );
        }

        setContractAddress(MyConfidentialERC20.address);
      } catch (error) {
        console.error(
          'Error loading data - you probably forgot to deploy the token contract before running the front-end server:',
          error,
        );
      }
    };

    loadData();
  }, []);

  const handleConfirmAmount = () => {
    setChosenValue(inputValue);
  };

  const handleConfirmAddress = () => {
    const trimmedValue = inputValueAddress.trim().toLowerCase();
    if (ethers.isAddress(trimmedValue)) {
      // getAddress returns the checksummed address
      const checksummedAddress = ethers.getAddress(trimmedValue);
      setChosenAddress(checksummedAddress);
      setErrorMessage('');
    } else {
      setChosenAddress('0x');
      setErrorMessage('Invalid Ethereum address.');
    }
  };

  const instance = getInstance();

  const getBalances = async () => {
    if (contractAddress != ZeroAddress) {
      // Get encrypted token balance
      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address) view returns (uint256)'],
        readOnlyProvider,
      );
      const handleBalance = await contract.balanceOf(account);
      setHandleBalance(handleBalance.toString());
      setDecryptedBalance('???');

      // Get native ETH balance
      const ethBalance = await readOnlyProvider.getBalance(account);
      setBalance(ethers.formatEther(ethBalance)); // Convert from wei to ETH
    }
  };

  useEffect(() => {
    getBalances();
  }, [account, provider, contractAddress]);

  const encrypt = async (val: bigint) => {
    const now = Date.now();
    try {
      const result = await instance
        .createEncryptedInput(contractAddress, account)
        .add64(val)
        .encrypt();
      console.log(`Took ${(Date.now() - now) / 1000}s`);
      setHandles(result.handles);
      setEncryption(result.inputProof);
    } catch (e) {
      console.error('Encryption error:', e);
      console.log(Date.now() - now);
    }
  };

  const decrypt = async () => {
    const signer = await provider.getSigner();
    try {
      const clearBalance = await reencryptEuint64(
        signer,
        instance,
        BigInt(handleBalance),
        contractAddress,
      );
      setDecryptedBalance(clearBalance.toString());
    } catch (error) {
      if (error === 'Handle is not initialized') {
        // if handle is uninitialized - i.e equal to 0 - we know for sure that the balance is null
        setDecryptedBalance('0');
      } else {
        throw error;
      }
    }
  };

  const transferToken = async () => {
    const contract = new ethers.Contract(
      contractAddress,
      ['function transfer(address,bytes32,bytes) external returns (bool)'],
      provider,
    );
    const signer = await provider.getSigner();
    const tx = await contract
      .connect(signer)
      .transfer(
        chosenAddress,
        toHexString(handles[0]),
        toHexString(encryption),
      );
    await tx.wait();
    await getBalances(); // Updated this line
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
    <div className="max-w-3xl mx-auto space-y-6">
    <Card className="border-none shadow-lg">

    <div>
      <dl>
        <dt className="Devnet__title">My plain balance is:</dt>
        <dd className="Devnet__dd">{balance.toString()} ETH</dd>
        
        <dt className="Devnet__title">My encrypted balance is:</dt>
        <dd className="Devnet__dd">{handleBalance.toString()}</dd>

        <Button onClick={() => decrypt()}>
          Reencrypt and decrypt my balance
        </Button>
        <dd className="Devnet__dd">
          My decrypted private balance is: {decryptedBalance.toString()}
        </dd>

        <dd className="Devnet__dd">Chose an amount to transfer:</dd>

        <div>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a number"
          />{' '}
          <Button onClick={handleConfirmAmount}>OK</Button>
          {chosenValue !== null && (
            <div>
              <p>You chose: {chosenValue}</p>
            </div>
          )}
        </div>

        <Button onClick={() => encrypt(BigInt(chosenValue))}>
          Encrypt {chosenValue}
        </Button>
        <dt className="Devnet__title">
          This is an encryption of {chosenValue}:
        </dt>
        <dd className="Devnet__dd">
          <pre className="Devnet__pre">
            Handle: {handles.length ? toHexString(handles[0]) : ''}
          </pre>
          <pre className="Devnet__pre">
            Input Proof: {encryption ? toHexString(encryption) : ''}
          </pre>
        </dd>

        <div>
          <input
            type="text"
            value={inputValueAddress}
            onChange={(e) => setInputValueAddress(e.target.value)}
            placeholder="Receiver address"
          />
          <Button onClick={handleConfirmAddress}>OK</Button>{' '}
          {chosenAddress && (
            <div>
              <p>Chosen Address For Receiver: {chosenAddress}</p>
            </div>
          )}
          {errorMessage && (
            <div style={{ color: 'red' }}>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        <div>
          {chosenAddress !== '0x' && encryption && encryption.length > 0 && (
            <Button onClick={transferToken}>
              Transfer Encrypted Amount To Receiver
            </Button>
          )}
        </div>
      </dl>
    </div>
          </Card>
          </div>
          </div>
  );
};