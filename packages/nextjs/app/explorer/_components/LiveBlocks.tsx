"use client";

import { useState, useEffect } from "react";
import { PublicClient, Block, Transaction, TransactionReceipt } from "viem";
import { decodeTransactionData, getFunctionDetails } from "~~/utils/helper/decodeTxData";
import { TransactionWithFunction } from "~~/utils/helper/block";

interface LiveBlocksProps {
  blocks: Block[];
  isLoading: boolean;
  onBlockSelect: (block: Block) => void;
  onTransactionSelect: (transaction: Transaction) => void;
  onRefresh: () => void;
}

export const LiveBlocks = ({ 
  blocks, 
  isLoading, 
  onBlockSelect, 
  onTransactionSelect, 
  onRefresh 
}: LiveBlocksProps) => {
  const [transactionReceipts, setTransactionReceipts] = useState<Record<string, TransactionReceipt>>({});

  // Fetch transaction receipts for all transactions
  useEffect(() => {
    const fetchReceipts = async () => {
      // This would need to be implemented with a public client
      // For now, we'll leave it as a placeholder
    };
    
    if (blocks.length > 0) {
      fetchReceipts();
    }
  }, [blocks]);

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatGasUsed = (gasUsed: bigint) => {
    return gasUsed.toString();
  };

  const getTransactionStatus = (tx: Transaction) => {
    // This would need to be determined from the transaction receipt
    return "✅ Success"; // Placeholder
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📦 Live Blocks</h2>
        <button 
          className="btn btn-primary btn-sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Loading...
            </>
          ) : (
            <>
              🔄 Refresh
            </>
          )}
        </button>
      </div>

      {/* Blocks List */}
      <div className="space-y-3">
        {blocks.map((block) => (
          <div key={block.number.toString()} className="card bg-base-200 shadow-sm">
            <div className="card-body p-4">
              {/* Block Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    Block #{block.number.toString()}
                  </h3>
                  <p className="text-sm text-base-content/70">
                    {formatTimestamp(block.timestamp)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="badge badge-primary">
                    {block.transactions.length} txns
                  </div>
                  <div className="text-sm text-base-content/70 mt-1">
                    Gas Used: {formatGasUsed(block.gasUsed)}
                  </div>
                </div>
              </div>

              {/* Block Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-base-content/70">Hash</div>
                  <div className="font-mono text-sm break-all">
                    {block.hash}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-base-content/70">Parent Hash</div>
                  <div className="font-mono text-sm break-all">
                    {block.parentHash}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-base-content/70">Miner</div>
                  <div className="font-mono text-sm">
                    {block.miner}
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div>
                <h4 className="text-md font-medium mb-2">Transactions</h4>
                <div className="space-y-2">
                  {block.transactions.slice(0, 5).map((tx, index) => {
                    const txWithFunction = decodeTransactionData(tx as TransactionWithFunction);
                    return (
                      <div 
                        key={tx.hash || index}
                        className="flex justify-between items-center p-2 bg-base-100 rounded cursor-pointer hover:bg-base-300 transition-colors"
                        onClick={() => onTransactionSelect(tx)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm break-all">
                            {tx.hash}
                          </div>
                          {txWithFunction.functionName && (
                            <div className="text-sm text-base-content/70">
                              {getFunctionDetails(txWithFunction)}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm">
                            {getTransactionStatus(tx)}
                          </div>
                          <div className="text-xs text-base-content/70">
                            Gas: {tx.gas?.toString() || "—"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {block.transactions.length > 5 && (
                    <div className="text-center text-sm text-base-content/70">
                      ... and {block.transactions.length - 5} more transactions
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end mt-4">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => onBlockSelect(block)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blocks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-base-content/50">
            No blocks available. Make sure your local node is running.
          </div>
        </div>
      )}
    </div>
  );
};
