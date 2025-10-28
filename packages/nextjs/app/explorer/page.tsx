"use client";

import { useState, useEffect } from "react";
import { useAccount, useBlockNumber, usePublicClient } from "wagmi";
import { BlockExplorer } from "./_components/BlockExplorer";

export default function ExplorerPage() {
  const { isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const publicClient = usePublicClient();

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">🔍 Block Explorer</h1>
          <p className="text-center text-base-content/70 max-w-2xl mx-auto">
            Real-time blockchain explorer for your Hardhat development network. Monitor transactions, 
            analyze addresses, inspect contracts, and watch live blocks.
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-12">
            <div className="alert alert-warning max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Please connect your wallet to use the block explorer</span>
            </div>
          </div>
        ) : (
          <BlockExplorer 
            currentBlockNumber={blockNumber} 
            publicClient={publicClient}
          />
        )}
    </div>
  );
}
