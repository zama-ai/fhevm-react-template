import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserProvider, Provider } from 'ethers';

import './Connect.css';
import { Eip1193Provider } from 'ethers';
import { createFhevmInstance } from '../../fhevmjs';
import { JsonRpcProvider } from 'ethers';

const AUTHORIZED_CHAIN_ID = ['0xaa36a7', '0x2328', '0x7a69'];

export const Connect: React.FC<{
  children: (
    account: string,
    provider: any,
    readOnlyProvider: any,
  ) => React.ReactNode;
}> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [validNetwork, setValidNetwork] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [readOnlyProvider, setReadOnlyProvider] = useState<Provider | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const refreshAccounts = (accounts: string[]) => {
    setAccount(accounts[0] || '');
    setConnected(accounts.length > 0);
  };

  const hasValidNetwork = async (): Promise<boolean> => {
    const currentChainId: string = (
      await window.ethereum.request({
        method: 'eth_chainId',
      })
    ).toLowerCase();

    return import.meta.env.MOCKED
      ? currentChainId === AUTHORIZED_CHAIN_ID[2]
      : currentChainId === AUTHORIZED_CHAIN_ID[0];
  };

  const refreshNetwork = useCallback(async () => {
    if (await hasValidNetwork()) {
      setValidNetwork(true);
      setLoading(true);
      const load = async () => {
        await createFhevmInstance();
        setLoading(false);
      };
      window.requestAnimationFrame(load);
    } else {
      setValidNetwork(false);
    }
  }, []);

  const refreshProvider = (eth: Eip1193Provider) => {
    const p = new BrowserProvider(eth);
    setProvider(p);
    if (!import.meta.env.MOCKED) {
      setReadOnlyProvider(p);
    } else {
      const pRO = new JsonRpcProvider('http://127.0.0.1:8545');
      setReadOnlyProvider(pRO); // on Hardhat Node, for reading view functions, the JsonRpcProvider is more reliable than the BrowserProvider
    }

    return p;
  };

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) {
      setError('No wallet has been found');
      return;
    }

    const p = refreshProvider(eth);

    p.send('eth_accounts', [])
      .then(async (accounts: string[]) => {
        refreshAccounts(accounts);
        await refreshNetwork();
      })
      .catch(() => {
        // Do nothing
      });
    eth.on('accountsChanged', refreshAccounts);
    eth.on('chainChanged', refreshNetwork);
  }, []);

  const connect = async () => {
    if (!provider) {
      return;
    }
    const accounts: string[] = await provider.send('eth_requestAccounts', []);

    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setConnected(true);
      if (!(await hasValidNetwork())) {
        await switchNetwork();
      }
    }
  };

  const switchNetwork = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          { chainId: AUTHORIZED_CHAIN_ID[import.meta.env.MOCKED ? 2 : 0] },
        ],
      });
    } catch (e) {
      console.error(
        `No ${import.meta.env.MOCKED ? 'Hardhat' : 'Sepolia'} chain configured`,
      );
    }
  }, []);

  const child = useMemo<React.ReactNode>(() => {
    if (!account || !provider) {
      return null;
    }

    if (!validNetwork) {
      return (
        <div>
          <p>You're not on the correct network</p>
          <p>
            <button onClick={switchNetwork}>
              Switch to {import.meta.env.MOCKED ? 'Hardhat' : 'Sepolia'}
            </button>
          </p>
        </div>
      );
    }

    if (loading) {
      return <p>Loading...</p>;
    }

    return children(account, provider, readOnlyProvider);
  }, [account, provider, children, validNetwork, loading]);

  if (error) {
    return <p>No wallet has been found.</p>;
  }

  const connectInfos = (
    <div className="Connect__info">
      {!connected && <button onClick={connect}>Connect your wallet</button>}
      {connected && (
        <div className="Connect__account">Connected with {account}</div>
      )}
    </div>
  );

  return (
    <>
      {connectInfos}
      <div className="Connect__child">{child}</div>
    </>
  );
};
