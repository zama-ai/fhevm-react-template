import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';
import './Devnet.css';
import { Eip1193Provider } from 'ethers';
import { ethers } from 'ethers';

import MyConfidentialERC20 from '../../../../deployments/sepolia/MyConfidentialERC20.json';
import { reencryptEuint64 } from '../../../../test/reencrypt.ts';

const toHexString = (bytes: Uint8Array) =>
  '0x' +
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export type DevnetProps = {
  account: string;
  provider: Eip1193Provider;
};

const CONTRACT_ADDRESS = MyConfidentialERC20.address;

export const Devnet = ({ account, provider }: DevnetProps) => {
  const [handleBalance, setHandleBalance] = useState('0');
  const [decryptedBalance, setDecryptedBalance] = useState('???');

  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [encryption, setEncryption] = useState<Uint8Array>();

  const [inputValue, setInputValue] = useState(''); // Track the input
  const [chosenValue, setChosenValue] = useState('0'); // Track the confirmed value

  const handleConfirmAmount = () => {
    setChosenValue(inputValue);
  };

  const [inputValueAddress, setInputValueAddress] = useState('');
  const [chosenAddress, setChosenAddress] = useState('0x');
  const [errorMessage, setErrorMessage] = useState('');

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

  const getHandleBalance = async () => {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      // Minimal ABI for balanceOf
      ['function balanceOf(address) view returns (uint256)'],
      provider,
    );
    const handleBalance = await contract.balanceOf(account);
    setHandleBalance(handleBalance);
    setDecryptedBalance('???');
  };

  useEffect(() => {
    getHandleBalance();
  }, [account, provider]);

  const encrypt = async (val: bigint) => {
    const now = Date.now();
    try {
      const result = await instance
        .createEncryptedInput(CONTRACT_ADDRESS, account)
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
        CONTRACT_ADDRESS,
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
      CONTRACT_ADDRESS,
      // Minimal ABI for balanceOf
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
    await getHandleBalance();
  };

  return (
    <div>
      <dl>
        <dt className="Devnet__title">My encrypted balance is:</dt>
        <dd className="Devnet__dd">{handleBalance.toString()}</dd>

        <button onClick={() => decrypt()}>
          Reencrypt and decrypt my balance
        </button>
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
          />
          <button onClick={handleConfirmAmount}>OK</button>
          {chosenValue !== null && (
            <div>
              <p>You chose: {chosenValue}</p>
            </div>
          )}
        </div>

        <button onClick={() => encrypt(BigInt(chosenValue))}>
          Encrypt {chosenValue}
        </button>
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
          <button onClick={handleConfirmAddress}>OK</button>
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

        {chosenAddress !== '0x' && encryption && encryption.length > 0 && (
          <button onClick={transferToken}>
            Transfer Encrypted Amount To Receiver
          </button>
        )}
      </dl>
    </div>
  );
};
