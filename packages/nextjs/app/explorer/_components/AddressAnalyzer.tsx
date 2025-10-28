"use client";

import { useState, useEffect } from "react";
import { PublicClient, formatEther, formatUnits } from "viem";

interface AddressAnalyzerProps {
  selectedAddress: string;
  onAddressSelect: (address: string) => void;
  publicClient: PublicClient | undefined;
}

interface AddressInfo {
  balance: string;
  transactionCount: number;
  code: string;
  isContract: boolean;
}

export const AddressAnalyzer = ({ 
  selectedAddress, 
  onAddressSelect, 
  publicClient 
}: AddressAnalyzerProps) => {
  const [addressInput, setAddressInput] = useState("");
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeAddress = async (address: string) => {
    if (!publicClient || !address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate address format
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format");
      }

      const [balance, transactionCount, code] = await Promise.all([
        publicClient.getBalance({ address: address as `0x${string}` }),
        publicClient.getTransactionCount({ address: address as `0x${string}` }),
        publicClient.getCode({ address: address as `0x${string}` })
      ]);

      const info: AddressInfo = {
        balance: formatEther(balance),
        transactionCount,
        code,
        isContract: code !== "0x"
      };

      setAddressInfo(info);
      onAddressSelect(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze address");
      setAddressInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeAddress(addressInput);
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return "0 ETH";
    if (num < 0.0001) return `${num.toExponential(4)} ETH`;
    return `${num.toFixed(6)} ETH`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold">👤 Address Analyzer</h2>

      {/* Address Input */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Ethereum Address</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered flex-1 font-mono"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading || !addressInput}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Address Information */}
      {addressInfo && (
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-base-content/70">Address</div>
                  <div className="font-mono text-sm break-all">
                    {selectedAddress}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-base-content/70">Type</div>
                  <div className="badge badge-primary">
                    {addressInfo.isContract ? "Contract" : "EOA"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-base-content/70">Balance</div>
                  <div className="text-lg font-semibold">
                    {formatBalance(addressInfo.balance)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-base-content/70">Transaction Count</div>
                  <div className="text-lg font-semibold">
                    {addressInfo.transactionCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Code */}
          {addressInfo.isContract && (
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Contract Code</h3>
                <div className="mockup-code">
                  <pre className="text-xs">
                    <code>{addressInfo.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-outline btn-sm">
                  📋 Copy Address
                </button>
                <button className="btn btn-outline btn-sm">
                  🔍 View on Etherscan
                </button>
                <button className="btn btn-outline btn-sm">
                  📊 Transaction History
                </button>
                {addressInfo.isContract && (
                  <button className="btn btn-outline btn-sm">
                    📋 Contract ABI
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Addresses */}
      {!addressInfo && (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="card-title">Sample Addresses</h3>
            <p className="text-sm text-base-content/70 mb-4">
              Try analyzing these sample addresses:
            </p>
            <div className="space-y-2">
              <button
                className="btn btn-outline btn-sm w-full justify-start"
                onClick={() => {
                  setAddressInput("0x0000000000000000000000000000000000000000");
                  analyzeAddress("0x0000000000000000000000000000000000000000");
                }}
              >
                🏦 Zero Address (0x000...000)
              </button>
              <button
                className="btn btn-outline btn-sm w-full justify-start"
                onClick={() => {
                  setAddressInput("0x000000000000000000000000000000000000dEaD");
                  analyzeAddress("0x000000000000000000000000000000000000dEaD");
                }}
              >
                💀 Dead Address (0x000...dEaD)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
