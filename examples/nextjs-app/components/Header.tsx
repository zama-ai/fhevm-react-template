import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Header: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function checkWallet() {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        try {
          const accounts = await provider.send('eth_accounts', []);
          if (accounts.length > 0) {
            setWalletConnected(true);
            setAddress(accounts[0]);
          }
        } catch {}
      }
    }
    checkWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signerObj = await provider.getSigner();
      setWalletConnected(true);
      const addr = await signerObj.getAddress();
      setAddress(addr);
    }
  };

  return (
    <header className="w-full py-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">QuantumPrice Auction</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
        >
          {walletConnected ? (
            <span className="font-mono text-sm">{address?.slice(0,6)}...{address?.slice(-4)}</span>
          ) : (
            'Connect Wallet'
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;