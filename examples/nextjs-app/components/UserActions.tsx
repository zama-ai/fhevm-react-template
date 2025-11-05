import React, { useEffect, useState, ReactNode } from 'react';
import { useEncryptBid } from '../../../packages/fhevm-sdk/react/useEncryptBid';
import { useSubmitEncryptedBid } from '../../../packages/fhevm-sdk/react/useSubmitEncryptedBid';
import { ethers } from 'ethers';
import { UserState, Product } from '../types';
import { MIN_BID, MAX_BID } from '../constants';
import deployedContracts from '../../../packages/nextjs/contracts/deployedContracts';

interface UserActionsProps {
  userState: UserState;
  auctionEnded: boolean;
  bid: string;
  isLoading: boolean;
  setBid: (value: string) => void;
  setUserState: (state: UserState) => void;
  onJoin: () => void;
  onSubmitBid: () => void;
  onReveal: () => void;
  onSimulate: () => void;
  product: Product;
}

const Button = ({ onClick, children, disabled = false, className = '' }: { onClick: () => void; children: ReactNode; disabled?: boolean; className?: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-lg font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${className}`}
  >
    {children}
  </button>
);

const UserActions = ({ userState, auctionEnded, bid, setBid, setUserState, onJoin, onSubmitBid, onReveal, onSimulate, isLoading, product }: UserActionsProps) => {
  console.log("UserActions props:", { userState, auctionEnded, bid, isLoading, product });
  const { encrypt, loading: encryptLoading, error: encryptError } = useEncryptBid();
  const chainId = 31337; // veya aktif ağ
  const contractAddress = deployedContracts[chainId]?.MockAuction?.address || '';
  const abi = deployedContracts[chainId]?.MockAuction?.abi || [];
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    async function getSignerAndBalance() {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        try {
          await provider.send('eth_requestAccounts', []);
          const signerObj = await provider.getSigner();
          setSigner(signerObj);
          setWalletConnected(true);
          const addr = await signerObj.getAddress();
          setAddress(addr);
          const bal = await provider.getBalance(addr);
          setBalance(Number(ethers.utils.formatEther(bal)));
        } catch (err) {
          setWalletConnected(false);
        }
      }
    }
    getSignerAndBalance();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSdkReady(!!window.relayerSDK);
      console.log("[DEBUG] window.relayerSDK:", window.relayerSDK);
      console.log("[DEBUG] sdkReady:", !!window.relayerSDK);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const { submit } = useSubmitEncryptedBid({ contractAddress, abi, entryFee: product.entryFee, signer: signer as ethers.providers.JsonRpcSigner });
  if (!walletConnected) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">Wallet Connection Required</h3>
        <p className="text-gray-600 mt-2 mb-6">Please connect your wallet to continue.</p>
        <Button onClick={async () => {
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            await provider.send('eth_requestAccounts', []);
            const signerObj = await provider.getSigner();
            setSigner(signerObj);
            setWalletConnected(true);
            const addr = await signerObj.getAddress();
            setAddress(addr);
            const bal = await provider.getBalance(addr);
            setBalance(Number(ethers.utils.formatEther(bal)));
          }
        }} className="bg-blue-600 hover:bg-blue-700 text-white">
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (auctionEnded) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">Auction Has Ended!</h3>
        <p className="text-gray-600 mt-2 mb-6">The bidding period is over. Click below to see the winner.</p>
        <Button onClick={onReveal} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
          {isLoading ? 'Revealing...' : 'Reveal Winner'}
        </Button>
      </div>
    );
  }

  const joinOnchain = async () => {
    if (!signer || !contractAddress || !abi.length) return;
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.join({ value: ethers.utils.parseEther(product.entryFee.toString()) });
      await tx.wait();
      setUserState(UserState.CAN_BID);
    } catch (e: any) {
      alert('Onchain join failed: ' + (e.message || e));
    }
  };

  switch (userState) {
    case UserState.CAN_JOIN:
      if (!walletConnected) {
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">Cüzdan Bağlantısı Gerekli</h3>
            <p className="text-gray-600 mt-2 mb-6">Lütfen cüzdanınızı bağlayın.</p>
            <Button onClick={async () => {
              if (typeof window !== 'undefined' && (window as any).ethereum) {
                const provider = new ethers.providers.Web3Provider((window as any).ethereum);
                await provider.send('eth_requestAccounts', []);
                const signerObj = provider.getSigner();
                setSigner(signerObj);
                setWalletConnected(true);
                const addr = await signerObj.getAddress();
                setAddress(addr);
                const bal = await provider.getBalance(addr);
                setBalance(Number(ethers.utils.formatEther(bal)));
              }
            }} className="bg-blue-600 hover:bg-blue-700 text-white">
              Cüzdanı Bağla
            </Button>
          </div>
        );
      }
      return (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pay the entry fee to join and place your secret bid.</p>
          <Button onClick={joinOnchain} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? 'Processing...' : `Pay ${product.entryFee} ETH to Join`}
          </Button>
        </div>
      );
    case UserState.CAN_BID:
      if (!walletConnected) {
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">Cüzdan Bağlantısı Gerekli</h3>
            <p className="text-gray-600 mt-2 mb-6">Lütfen cüzdanınızı bağlayın.</p>
            <Button onClick={async () => {
              if (typeof window !== 'undefined' && (window as any).ethereum) {
                const provider = new ethers.providers.Web3Provider((window as any).ethereum);
                await provider.send('eth_requestAccounts', []);
                const signerObj = provider.getSigner();
                setSigner(signerObj);
                setWalletConnected(true);
                const addr = await signerObj.getAddress();
                setAddress(addr);
                const bal = await provider.getBalance(addr);
                setBalance(Number(ethers.utils.formatEther(bal)));
              }
            }} className="bg-blue-600 hover:bg-blue-700 text-white">
              Cüzdanı Bağla
            </Button>
          </div>
        );
      }
      return (
        <div>
          <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md mb-4">
             <p className="font-semibold">Bidding Rules:</p>
             <ul className="list-disc list-inside mt-1">
                <li>Your bid must be between ${MIN_BID.toLocaleString()} and ${MAX_BID.toLocaleString()}.</li>
                <li>The closest bid to the secret price wins.</li>
                <li>Wallet balance: <span className="font-bold">{balance.toFixed(4)} ETH</span></li>
                <li>Required entry fee: <span className="font-bold">{product.entryFee} ETH</span></li>
                {balance < product.entryFee && (
                  <li className="text-red-600 font-bold">Insufficient balance! Transaction cannot proceed.</li>
                )}
             </ul>
          </div>
          <div className="relative flex items-center gap-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input
              type="number"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              placeholder="e.g., 12500"
              className="w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-lg py-3 pl-8 pr-4 text-gray-900 text-lg outline-none transition-colors"
            />
            <span className="ml-2 text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">Balance: {balance.toFixed(4)} ETH</span>
          </div>
          {(!sdkReady || encryptLoading) && (
  <div className="text-blue-600 mt-2">FHEVM SDK yükleniyor, lütfen bekleyin...</div>
)}
{encryptError && <div className="text-red-600 mt-2">Encryption error: {encryptError}</div>}
<Button
  onClick={async () => {
    console.log("[DEBUG] Bid butonuna basıldı");
    try {
      if (!sdkReady) throw new Error('FHEVM SDK not initialized!');
      console.log("[DEBUG] Bid işlemi başlıyor, SDK hazır");
      const encryptedBid = await encrypt(Number(bid));
      console.log("[DEBUG] Bid şifrelendi:", encryptedBid);
      await submit(encryptedBid);
      console.log("[DEBUG] Bid onchain gönderildi");
      onSubmitBid();
    } catch (e: any) {
      console.error("[DEBUG] Bid işlem hatası:", e);
      alert('Encryption/onchain failed: ' + e.message);
    }
  }}
  disabled={isLoading || !bid || encryptLoading || !sdkReady}
  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
>
  {isLoading || encryptLoading ? 'Encrypting & Submitting...' : 'Submit My Encrypted Bid'}
</Button>
        </div>
      );
    case UserState.BID_SUBMITTED:
      return (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-green-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-green-600 mt-4">Bid Submitted Successfully!</h3>
          <p className="text-gray-600 mt-2 mb-6">Your encrypted bid is secure. Wait for the auction to end or click below to simulate remaining bids.</p>
          <Button 
            onClick={onSimulate} 
            disabled={isLoading} 
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? 'Simulating...' : 'Simulate Remaining Bids'}
          </Button>
        </div>
      );
    default:
      return null;
  }
};

export default UserActions;
