import { useEffect, useState, useCallback } from 'react';
import { getInstance } from '../../src/fhevmjs.ts';
import { Eip1193Provider, Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
//import { useContract, useBalances, useEncryption } from '@/hooks/useContract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { reencryptEuint64 } from '@/lib/reencrypt.ts';
import { Unlock, Loader2 } from 'lucide-react';
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
  const [tokenSymbol, setTokenSymbol] = useState('');

  const [handleBalance, setHandleBalance] = useState('0');
  const [decryptedBalance, setDecryptedBalance] = useState('???');
  const [lastUpdated, setLastUpdated] = useState<string>('Never');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [encryption, setEncryption] = useState<Uint8Array>();

  const [transferAmount, setTransferAmount] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const [inputValueAddress, setInputValueAddress] = useState('');
  const [chosenAddress, setChosenAddress] = useState('0x');
  const [errorMessage, setErrorMessage] = useState('');

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

        // Fetch token symbol
        const contract = new ethers.Contract(
          MyConfidentialERC20.address,
          ['function symbol() view returns (string)'],
          readOnlyProvider,
        );
        const symbol = await contract.symbol();
        setTokenSymbol(symbol);
      } catch (error) {
        console.error(
          'Error loading data - you probably forgot to deploy the token contract before running the front-end server:',
          error,
        );
      }
    };

    loadData();
  }, [readOnlyProvider]);

  useEffect(() => {
    const trimmedValue = inputValueAddress.trim().toLowerCase();
    if (trimmedValue === '') {
      setChosenAddress('0x');
      setErrorMessage('');
    } else if (ethers.isAddress(trimmedValue)) {
      const checksummedAddress = ethers.getAddress(trimmedValue);
      setChosenAddress(checksummedAddress);
      setErrorMessage('');
    } else {
      setChosenAddress('0x');
      setErrorMessage('Invalid Ethereum address.');
    }
  }, [inputValueAddress]);

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

  const decrypt = async () => {
    setIsDecrypting(true);
    const signer = await provider.getSigner();
    try {
      const clearBalance = await reencryptEuint64(
        signer,
        instance,
        BigInt(handleBalance),
        contractAddress,
      );
      setDecryptedBalance(clearBalance.toString());
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      if (error === 'Handle is not initialized') {
        setDecryptedBalance('0');
      } else {
        throw error;
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  const transferToken = async () => {
    if (!transferAmount) return;

    setIsEncrypting(true);
    try {
      // Encrypt the amount first
      const result = await instance
        .createEncryptedInput(contractAddress, account)
        .add64(BigInt(transferAmount))
        .encrypt();

      setHandles(result.handles);
      setEncryption(result.inputProof);

      console.log('Handle:', toHexString(result.handles[0]));
      console.log('Input Proof:', toHexString(result.inputProof));

      // Proceed with transfer
      setIsEncrypting(false);
      setIsTransferring(true);
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
          toHexString(result.handles[0]),
          toHexString(result.inputProof),
        );
      await tx.wait();
      await getBalances();

      // Clear the form
      setTransferAmount('');
      setInputValueAddress('');
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsEncrypting(false);
      setIsTransferring(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-1">
        {/* Encrypted Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Encrypted Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="font-mono text-xl">
                  {decryptedBalance.toString()} {tokenSymbol}
                </div>
                <div className="font-mono text-gray-600 text-sm">
                  Last updated: {lastUpdated}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => decrypt()}
                disabled={isDecrypting}
              >
                {isDecrypting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Decrypt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Transfer Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Recepient Address</label>
              <Input
                type="text"
                value={inputValueAddress}
                onChange={(e) => setInputValueAddress(e.target.value)}
                placeholder="0x...."
              />
              {errorMessage && (
                <div style={{ color: 'red' }}>
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Amount</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={transferAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || parseFloat(value) >= 0) {
                      setTransferAmount(value);
                    }
                  }}
                  placeholder="Enter amount to transfer"
                />
              </div>
            </div>

            <div>
              <Button
                className="w-full"
                size="lg"
                onClick={transferToken}
                disabled={
                  isTransferring ||
                  isEncrypting ||
                  !transferAmount ||
                  chosenAddress === '0x'
                }
              >
                {isEncrypting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Encrypting amount...
                  </>
                ) : isTransferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  'Transfer Tokens'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
