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
        <h2 className="text-xl font-semibold">Recent Blocks</h2>
        <button 
          className="btn btn-sm btn-outline"
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
      <div className="space-y-2">
        {blocks.map((block) => (
          <div key={block.number.toString()} className="border border-base-300 rounded-lg p-4 hover:bg-base-50 transition-colors">
            {/* Block Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">
                  Block #{block.number.toString()}
                </h3>
                <p className="text-sm text-base-content/60">
                  {formatTimestamp(block.timestamp)}
                </p>
              </div>
              <div className="text-right">
                <div className="badge badge-outline">
                  {block.transactions.length} txns
                </div>
                <div className="text-sm text-base-content/60 mt-1">
                  Gas: {formatGasUsed(block.gasUsed)}
                </div>
              </div>
            </div>

            {/* Block Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="text-base-content/60">Hash:</span>
                <div className="font-mono text-xs break-all mt-1">
                  {block.hash}
                </div>
              </div>
              <div>
                <span className="text-base-content/60">Miner:</span>
                <div className="font-mono text-xs mt-1">
                  {block.miner}
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-base-content/80">Transactions</h4>
              <div className="space-y-1">
                {block.transactions.slice(0, 3).map((tx, index) => {
                  const txWithFunction = decodeTransactionData(tx as TransactionWithFunction);
                  return (
                    <div 
                      key={tx.hash || index}
                      className="flex justify-between items-center p-2 bg-base-100 rounded cursor-pointer hover:bg-base-200 transition-colors"
                      onClick={() => onTransactionSelect(tx)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs break-all">
                          {tx.hash}
                        </div>
                        {txWithFunction.functionName && (
                          <div className="text-xs text-base-content/60">
                            {getFunctionDetails(txWithFunction)}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xs">
                          {getTransactionStatus(tx)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {block.transactions.length > 3 && (
                  <div className="text-center text-xs text-base-content/60 py-1">
                    ... and {block.transactions.length - 3} more transactions
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-3">
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => onBlockSelect(block)}
              >
                View Details
              </button>
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
