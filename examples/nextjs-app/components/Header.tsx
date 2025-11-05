import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Header = () => {
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
    <header className="w-full space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {walletConnected ? (
            <span className="font-mono text-sm">
              ✅ {address?.slice(0,6)}...{address?.slice(-4)}
            </span>
          ) : (
            '🔗 Connect Wallet'
          )}
        </button>
      </div>
      
      <div className="bg-gradient-to-r from-yellow-300 via-orange-200 to-blue-100 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 py-6">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-6xl font-black text-gray-900 mb-2 tracking-wider">
              WinnerPrice
            </h1>
            <p className="text-gray-700 text-sm font-medium max-w-lg">
              The closest bid to the secret price wins the prize. Pay an entry fee to place your bid.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;