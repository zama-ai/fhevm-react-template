import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';

import './Devnet.css';

const toHexString = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const Devnet = () => {
  const [encryption, setEncryption] = useState<Uint8Array>();
  const [token, setToken] = useState<ReturnType<typeof instance.generateToken>>();
  const instance = getInstance();

  useEffect(() => {
    setEncryption(instance.encrypt32(1337));
    setToken(
      instance.generateToken({
        verifyingContract: '0x309cf2aae85ad8a1db70ca88cfd4225bf17a7482',
      })
    );
  }, [instance]);

  return (
    <div>
      <dl>
        <dt className="Devnet__title">This is an encryption of 1337:</dt>
        <dd>
          <pre className="Devnet__pre">{encryption && toHexString(encryption)}</pre>
        </dd>
        <dt className="Devnet__title">And this is a EIP-712 token</dt>
        <dd>
          <pre className="Devnet__pre">{token && JSON.stringify(token.token)}</pre>
        </dd>
      </dl>
    </div>
  );
};
