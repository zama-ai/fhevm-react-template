import { useEffect, useState, useCallback } from 'react';
import { getInstance } from '../../src/fhevmjs.ts';
import { Eip1193Provider, Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/Button"
//import { useContract, useBalances, useEncryption } from '@/hooks/useContract';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { reencryptEuint64 } from '@/lib/reencrypt.ts';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton.tsx';
import { Input } from '../ui/input.tsx';

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

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

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

  const getBalances = useCallback(async () => {
    if (contractAddress != ZeroAddress) {
      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address) view returns (uint256)'],
        readOnlyProvider,
      );
      const handleBalance = await contract.balanceOf(account);
      setHandleBalance(handleBalance.toString());
      setDecryptedBalance('???');
    }
  }, [account, contractAddress, readOnlyProvider]);

  useEffect(() => {
    void getBalances();
  }, [getBalances]);

  const encrypt = async (val: bigint) => {
    setChosenValue(inputValue);
    setIsEncrypting(true);

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
    } finally {
      setIsEncrypting(false);
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
    setIsTransferring(true);
    try {
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
      await getBalances();
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <>
          <div className="grid gap-4 md:grid-cols-1">

            {/* Encrypted Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Encrypted Balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="font-mono text-sm break-all">
                {handleBalance.toString()}
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Decrypted Private Balance</div>
                    <div className="font-mono text-xl">{decryptedBalance.toString()}</div>
                  </div>
                  <Button variant="outline" onClick={() => decrypt()}>
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Decrypt
                    </>
                </Button>
                </div>
              </CardContent>
            </Card>




      {/* Transfer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Transfer Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Amount</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a number"
              />{' '}
              <Button 
                onClick={() => encrypt(BigInt(inputValue))}
                disabled={isEncrypting}
              >
                {isEncrypting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Encrypting...
                  </>
                ) : (
                  <>Encrypt {inputValue}</>
                )}
              </Button>
            </div>
          </div>



          <div className="space-y-2">
            <label className="text-sm text-gray-600">Receiver Address</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={inputValueAddress}
                onChange={(e) => setInputValueAddress(e.target.value)}
                placeholder="0x...."
              />
              <Button className="px-6" onClick={handleConfirmAddress}>OK</Button>{' '}
              </div>
                {errorMessage && (
                  <div style={{ color: 'red' }}>
                    <p>{errorMessage}</p>
                  </div>
                )}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              This is an encryption of {chosenValue}:
            </div>
            <div className="space-y-1">
              <div className="font-mono text-sm break-all">
              Handle: {handles.length ? toHexString(handles[0]) : ''}
              </div>
              <div className="font-mono text-sm break-all">
              Input Proof: {encryption ? toHexString(encryption) : ''}
              </div>
            </div>
          </div>

          {chosenAddress && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Chosen Address For Receiver:
            </div>
            <div className="space-y-1">
              <div className="font-mono text-sm break-all">
               {chosenAddress}
              </div>
            </div>
          </div>
          )}

          <div>
            {chosenAddress !== '0x' && encryption && encryption.length > 0 && (
              <Button 
                className="w-full" 
                size="lg" 
                onClick={transferToken}
                disabled={isTransferring}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  'Transfer Encrypted Amount To Receiver'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};