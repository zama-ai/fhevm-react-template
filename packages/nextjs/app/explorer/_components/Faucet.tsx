"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseEther } from "viem";

interface FaucetProps {
  publicClient: any;
}

export const Faucet = ({ publicClient }: FaucetProps) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState<string>("");

  const getBalance = async () => {
    if (!publicClient || !address) return;
    
    try {
      const balanceWei = await publicClient.getBalance({ address });
      const balanceEth = Number(balanceWei) / 1e18;
      setBalance(balanceEth.toFixed(4));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const requestFaucet = async () => {
    if (!walletClient || !address) return;
    
    setIsLoading(true);
    setMessage("");
    
    try {
      // For local Hardhat, we can use the hardhat_impersonateAccount and send ETH
      // This is a simplified version - in a real faucet, you'd have a backend endpoint
      
      // Check if we're on localhost (Hardhat)
      const chainId = await walletClient.getChainId();
      if (chainId !== 31337) {
        setMessage("❌ Faucet only works on local Hardhat network (Chain ID: 31337)");
        setIsLoading(false);
        return;
      }

      // For Hardhat local development, we can use the hardhat_setBalance RPC method
      // This is a more reliable way to give ETH to accounts
      try {
        // Use the hardhat_setBalance RPC method to set balance to 1 ETH
        await publicClient.request({
          method: "hardhat_setBalance",
          params: [address, "0xDE0B6B3A7640000"], // 1 ETH in hex
        });

        setMessage("✅ Faucet request successful! You received 1 ETH");
        
        // Refresh balance after a short delay
        setTimeout(() => {
          getBalance();
        }, 1000);
        
      } catch (hardhatError) {
        console.log("Hardhat RPC method failed, trying alternative method...");
        
        // Fallback: Use a well-known account with ETH
        // In Hardhat, account 0x90F79bf6EB2c4f870365E785982E1f101E9b61Fa has 10000 ETH
        const faucetAddress = "0x90F79bf6EB2c4f870365E785982E1f101E9b61Fa";
        
        // First, impersonate the faucet account
        await publicClient.request({
          method: "hardhat_impersonateAccount",
          params: [faucetAddress],
        });

        // Send 1 ETH from the faucet account
        const txHash = await walletClient.sendTransaction({
          to: address,
          value: parseEther("1.0"),
          from: faucetAddress,
        });

        setMessage(`✅ Faucet request successful! Transaction: ${txHash}`);
        
        // Stop impersonating
        await publicClient.request({
          method: "hardhat_stopImpersonatingAccount",
          params: [faucetAddress],
        });
        
        // Refresh balance after a short delay
        setTimeout(() => {
          getBalance();
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("Faucet error:", error);
      setMessage(`❌ Faucet failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get balance on component mount
  useState(() => {
    if (isConnected) {
      getBalance();
    }
  });

  if (!isConnected) {
    return (
      <div className="text-sm text-base-content/60">
        Connect wallet to use faucet
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Balance Display */}
      <div className="text-sm">
        <span className="text-base-content/60">Balance:</span>
        <span className="ml-1 font-medium">{balance ? `${balance} ETH` : "—"}</span>
      </div>

      {/* Faucet Button */}
      <button
        className="btn btn-sm btn-primary"
        onClick={requestFaucet}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            Requesting...
          </>
        ) : (
          <>
            💧 Get ETH
          </>
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div className={`text-xs ${message.includes("✅") ? "text-green-600" : message.includes("❌") ? "text-red-600" : "text-blue-600"}`}>
          {message}
        </div>
      )}
    </div>
  );
};
