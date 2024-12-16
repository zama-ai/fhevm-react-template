import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';
import './Devnet.css';
import { Eip1193Provider } from 'ethers';

const toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export type DevnetProps = {
  account: string;
  provider: Eip1193Provider;
};

const CONTRACT_ADDRESS = '0x309cf2aae85ad8a1db70ca88cfd4225bf17a7482';

export const Devnet = ({ account }: DevnetProps) => {
  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [encryption, setEncryption] = useState<Uint8Array>();
  const [eip712, setEip712] =
    useState<ReturnType<typeof instance.createEIP712>>();
  const instance = getInstance();

  // Handle EIP712 setup
  useEffect(() => {
    const { publicKey } = instance.generateKeypair();
    const eip = instance.createEIP712(publicKey, CONTRACT_ADDRESS);
    setEip712(eip);
  }, [instance]);

  const encrypt = async (val: number) => {
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

  return (
    <div>
      <dl>
        <button onClick={() => encrypt(1337)}>Encrypt 1337</button>
        <dt className="Devnet__title">This is an encryption of 1337:</dt>
        <dd className="Devnet__dd">
          <pre className="Devnet__pre">
            Handle: {handles.length ? toHexString(handles[0]) : ''}
          </pre>
          <pre className="Devnet__pre">
            Input Proof: {encryption ? toHexString(encryption) : ''}
          </pre>
        </dd>
        <dt className="Devnet__title">And this is a EIP-712 token</dt>
        <dd className="Devnet__dd">
          <pre className="Devnet__pre">
            {eip712 ? JSON.stringify(eip712) : ''}
          </pre>
        </dd>
      </dl>
    </div>
  );
};
