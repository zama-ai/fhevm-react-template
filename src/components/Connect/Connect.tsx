import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserProvider } from 'ethers';

import './Connect.css';
import { Eip1193Provider } from 'ethers';
import { createFhevmInstance } from '../../fhevmjs';

const AUTHORIZED_CHAIN_ID = ['0xaa36a7', '0x2328'];

export const Connect: React.FC<{
  children: (account: string, provider: any) => React.ReactNode;
}> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [validNetwork, setValidNetwork] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccounts = (accounts: string[]) => {
    setAccount(accounts[0] || '');
    setConnected(accounts.length > 0);
  };

  const hasValidNetwork = async (): Promise<boolean> => {
    const currentChainId: string = await window.ethereum.request({
      method: 'eth_chainId',
    });
    return AUTHORIZED_CHAIN_ID.includes(currentChainId.toLowerCase());
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

  const initializeProvider = useCallback(() => {
    const eth = window.ethereum;
    if (eth) {
      const p = new BrowserProvider(eth);
      setProvider(p);
      return p;
    }
    setError('No wallet has been found');
    return null;
  }, []);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) {
      setError('No wallet has been found');
      return;
    }

    const p = initializeProvider();

    p
      ?.send('eth_accounts', [])
      .then(async (accounts: string[]) => {
        refreshAccounts(accounts);
        await refreshNetwork();
      })
      .catch(() => {
        // Do nothing
      });

    eth.on('accountsChanged', refreshAccounts);
    eth.on('chainChanged', refreshNetwork);

    return () => {
      eth.removeListener('accountsChanged', refreshAccounts);
      eth.removeListener('chainChanged', refreshNetwork);
    };
  }, [initializeProvider, refreshNetwork]);

  const connect = async () => {
    const p = provider || initializeProvider(); // Reinitialize provider if null
    if (!p) {
      return;
    }
    const accounts: string[] = await p.send('eth_requestAccounts', []);

    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setConnected(true);
      if (!(await hasValidNetwork())) {
        await switchNetwork();
      }
    }
  };

  const disconnect = () => {
    setAccount('');
    setConnected(false);
    setValidNetwork(false);
    setProvider(null); // Reset provider
  };

  const switchNetwork = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AUTHORIZED_CHAIN_ID[0] }],
      });
    } catch (e) {
      console.error('No Sepolia chain configured');
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
            <button onClick={switchNetwork}>Switch to Sepolia</button>
          </p>
        </div>
      );
    }

    if (loading) {
      return <p>Loading...</p>;
    }

    return children(account, provider);
  }, [account, provider, children, validNetwork, loading]);

  if (error) {
    return <p>No wallet has been found.</p>;
  }

  const connectInfos = (
    <div className="Connect__info">
      {!connected ? (
        <button onClick={connect}>Connect your wallet</button>
      ) : (
        <div className="Connect__account">
          <span>Connected with {account}</span>
          <button onClick={disconnect}>Disconnect</button>
        </div>
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
