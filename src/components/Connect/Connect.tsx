import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserProvider } from 'ethers';

import './Connect.css';
import { Eip1193Provider } from 'ethers';
import { createFhevmInstance } from '../../fhevmjs';

const AUTHORIZED_CHAIN_ID = ['0x1f49', '0x1f4a', '0x1f4b', '0x2328'];

export const Connect: React.FC<{
  children: (account: string, provider: any) => React.ReactNode;
}> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [validNetwork, setValidNetwork] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const refreshAccounts = (accounts: string[]) => {
    setAccount(accounts[0] || '');
    setConnected(accounts.length > 0);
  };

  const hasValidNetwork = async (): Promise<boolean> => {
    const currentChainId: string = await window.ethereum.request({ method: 'eth_chainId' });
    return AUTHORIZED_CHAIN_ID.includes(currentChainId.toLowerCase());
  };

  const refreshNetwork = useCallback(async () => {
    if (await hasValidNetwork()) {
      await createFhevmInstance();
      setValidNetwork(true);
    } else {
      setValidNetwork(false);
    }
  }, []);

  const refreshProvider = (eth: Eip1193Provider) => {
    const p = new BrowserProvider(eth);
    setProvider(p);
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
  }, [refreshNetwork]);

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
        params: [{ chainId: AUTHORIZED_CHAIN_ID[0] }],
      });
    } catch (e) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: AUTHORIZED_CHAIN_ID[0],
            rpcUrls: ['https://devnet.zama.ai/'],
            chainName: 'Zama Devnet',
            nativeCurrency: {
              name: 'ZAMA',
              symbol: 'ZAMA',
              decimals: 18,
            },
            blockExplorerUrls: ['https://main.explorer.zama.ai'],
          },
        ],
      });
    }
    await refreshNetwork();
  }, [refreshNetwork]);

  const child = useMemo<React.ReactNode>(() => {
    if (!account || !provider) {
      return null;
    }

    if (!validNetwork) {
      return (
        <div>
          <p>You're not on the correct network</p>
          <p>
            <button className="Connect__button" onClick={switchNetwork}>
              Switch to Zama Devnet
            </button>
          </p>
        </div>
      );
    }

    return children(account, provider);
  }, [account, provider, validNetwork, children, switchNetwork]);

  if (error) {
    return <p>No wallet has been found.</p>;
  }

  const connectInfos = (
    <div className="Connect__info">
      {!connected && (
        <button className="Connect__button" onClick={connect}>
          Connect your wallet
        </button>
      )}
      {connected && <div className="Connect__account">Connected with {account}</div>}
    </div>
  );

  return (
    <>
      {connectInfos}
      <div className="Connect__child">{child}</div>
    </>
  );
};
