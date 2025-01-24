import { useEffect, useState } from 'react';
import { getInstance } from '../../src/fhevmjs.ts';
import { Eip1193Provider, Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/Button"
//import { useContract, useBalances, useEncryption } from '@/hooks/useContract';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { reencryptEuint64 } from '../../../hardhat/test/reencrypt.ts';
import { Lock, Unlock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton.tsx';

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
    <>
                  {/* Balances */}
                  <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">ETH Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{balance.toString()} ETH</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Encrypted Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs font-mono break-all text-muted-foreground">
                  {handleBalance.toString()}
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Decrypt Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Decrypted Private Balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-48" /> : <div className="font-mono">???</div>
                  <Button variant="outline" onClick={() => console.log("TeST")}>
                        <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Decrypt
                      </>
                  </Button>
                </div>
              </CardContent>
            </Card>

      <dl>

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
    </>
  );
};