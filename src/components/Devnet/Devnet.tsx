import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';

import './Devnet.css';

const toHexString = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const Devnet = () => {
  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [encryption, setEncryption] = useState<Uint8Array>();
  const [eip712, setEip712] = useState<ReturnType<typeof instance.createEIP712>>();
  const instance = getInstance();

  useEffect(() => {
    const { handles, inputProof } = instance
      .createEncryptedInput('0x309cf2aae85ad8a1db70ca88cfd4225bf17a7456', '0x309cf2aae85ad8a1db70ca88cfd4225bf17a7482')
      .add64(32)
      .encrypt();
    setHandles(handles);
    setEncryption(inputProof);
    const { publicKey } = instance.generateKeypair();
    const eip = instance.createEIP712(publicKey, '0x309cf2aae85ad8a1db70ca88cfd4225bf17a7482');
    setEip712(eip);
  }, [instance]);

  return (
    <div>
      <dl>
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
