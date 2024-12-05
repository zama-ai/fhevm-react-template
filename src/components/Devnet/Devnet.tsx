import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';

import './Devnet.css';
import { Eip1193Provider, getAddress } from 'ethers';

const toHexString = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export type DevnetProps = { account: string; provider: Eip1193Provider };

export const Devnet = ({ account, provider }: DevnetProps) => {
  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [encryption, setEncryption] = useState<Uint8Array>();
  const [eip712, setEip712] = useState<ReturnType<typeof instance.createEIP712>>();
  const instance = getInstance();

  useEffect(() => {
    const { publicKey } = instance.generateKeypair();
    const eip = instance.createEIP712(publicKey, '0x309cf2aae85ad8a1db70ca88cfd4225bf17a7482');
    setEip712(eip);
  }, [instance]);

  const encrypt = (val: number) => {
    const now = Date.now();
    instance
      .createEncryptedInput(
        getAddress('0x309cf2aae85ad8a1db70ca88cfd4225bf17a7456'),
        getAddress('0x309cf2aae85ad8a1db70ca88cfd4225bf17a7482')
      )
      .add64(val)
      .encrypt()
      .then(({ handles, inputProof }) => {
        console.log(`Took ${(Date.now() - now) / 1000}s`);
        setHandles(handles);
        setEncryption(inputProof);
      })
      .catch((e) => {
        console.log(e);
        console.log(Date.now() - now);
      });
  };

  return (
    <div>
      <dl>
        <button onClick={() => encrypt(1337)}>Encrypt 1337</button>
        <dt className="Devnet__title">This is an encryption of 1337:</dt>
        <dd className="Devnet__dd">
          <pre className="Devnet__pre">Handle: {handles.length && toHexString(handles[0])}</pre>
          <pre className="Devnet__pre">Input Proof: {encryption && toHexString(encryption)}</pre>
        </dd>
        <dt className="Devnet__title">And this is a EIP-712 token</dt>
        <dd className="Devnet__dd">
          <pre className="Devnet__pre">{eip712 && JSON.stringify(eip712)}</pre>
        </dd>
      </dl>
    </div>
  );
};
