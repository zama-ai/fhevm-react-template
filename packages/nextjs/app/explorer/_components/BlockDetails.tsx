"use client";

import { useState, useEffect } from "react";
import { PublicClient, Transaction, TransactionReceipt } from "viem";
import { decodeTransactionData, getFunctionDetails } from "~~/utils/helper/decodeTxData";
import { TransactionWithFunction } from "~~/utils/helper/block";
import { safeJsonStringify } from "~~/utils/helper/serialization";

interface BlockDetailsProps {
  block: any;
  onClose: () => void;
  publicClient: PublicClient | undefined;
}

export const BlockDetails = ({ block, onClose, publicClient }: BlockDetailsProps) => {
  const [transactionReceipts, setTransactionReceipts] = useState<Record<string, TransactionReceipt>>({});
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);

  // Fetch transaction receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      if (!publicClient || !block.transactions) return;
      
      setIsLoadingReceipts(true);
      try {
        const receiptPromises = block.transactions.map(async (tx: Transaction) => {
          try {
            const receipt = await publicClient.getTransactionReceipt({ hash: tx.hash! });
            return { hash: tx.hash!, receipt };
          } catch (error) {
            console.error(`Error fetching receipt for ${tx.hash}:`, error);
            return null;
          }
        });

        const results = await Promise.all(receiptPromises);
        const receipts: Record<string, TransactionReceipt> = {};
        
        results.forEach(result => {
          if (result) {
            receipts[result.hash] = result.receipt;
          }
        });
        
        setTransactionReceipts(receipts);
      } catch (error) {
        console.error("Error fetching transaction receipts:", error);
      } finally {
        setIsLoadingReceipts(false);
      }
    };

    fetchReceipts();
  }, [block, publicClient]);

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatGasUsed = (gasUsed: bigint) => {
    return gasUsed.toString();
  };

  const formatValue = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(6)} ETH`;
  };

  const getTransactionStatus = (tx: Transaction) => {
    const receipt = transactionReceipts[tx.hash!];
    if (!receipt) return "⏳ Pending";
    return receipt.status === "success" ? "✅ Success" : "❌ Failed";
  };

  const getTransactionStatusColor = (tx: Transaction) => {
    const receipt = transactionReceipts[tx.hash!];
    if (!receipt) return "badge-warning";
    return receipt.status === "success" ? "badge-success" : "badge-error";
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Block #{block.number.toString()}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Block Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-lg">Block Details</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Hash</div>
                    <div className="font-mono text-sm break-all">{block.hash}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Parent Hash</div>
                    <div className="font-mono text-sm break-all">{block.parentHash}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Timestamp</div>
                    <div className="text-sm">{formatTimestamp(block.timestamp)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Miner</div>
                    <div className="font-mono text-sm">{block.miner}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-lg">Gas Information</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Gas Used</div>
                    <div className="text-lg font-semibold">{formatGasUsed(block.gasUsed)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Gas Limit</div>
                    <div className="text-lg font-semibold">{formatGasUsed(block.gasLimit)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Gas Usage</div>
                    <div className="text-lg font-semibold">
                      {((Number(block.gasUsed) / Number(block.gasLimit)) * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Base Fee</div>
                    <div className="text-sm">
                      {block.baseFeePerGas ? formatValue(block.baseFeePerGas) : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h4 className="card-title text-lg">Transactions ({block.transactions.length})</h4>
                {isLoadingReceipts && (
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <span className="loading loading-spinner loading-xs"></span>
                    Loading receipts...
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Hash</th>
                      <th>Function</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Value</th>
                      <th>Gas</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.transactions.map((tx: Transaction, index: number) => {
                      const txWithFunction = decodeTransactionData(tx as TransactionWithFunction);
                      return (
                        <tr key={tx.hash || index}>
                          <td>
                            <div className="font-mono text-sm max-w-xs truncate">
                              {tx.hash}
                            </div>
                          </td>
                          <td>
                            <div className="max-w-xs">
                              {txWithFunction.functionName ? (
                                <div className="text-sm">
                                  <div className="font-medium">{txWithFunction.functionName}</div>
                                  {txWithFunction.functionArgs && txWithFunction.functionArgs.length > 0 && (
                                    <div className="text-xs text-base-content/70">
                                      {txWithFunction.functionArgs.slice(0, 2).join(", ")}
                                      {txWithFunction.functionArgs.length > 2 && "..."}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-base-content/50">Transfer</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="font-mono text-sm max-w-xs truncate">
                              {tx.from}
                            </div>
                          </td>
                          <td>
                            <div className="font-mono text-sm max-w-xs truncate">
                              {tx.to || "—"}
                            </div>
                          </td>
                          <td>
                            <div className="text-sm">
                              {formatValue(tx.value)}
                            </div>
                          </td>
                          <td>
                            <div className="text-sm">
                              {tx.gas?.toString() || "—"}
                            </div>
                          </td>
                          <td>
                            <div className={`badge ${getTransactionStatusColor(tx)}`}>
                              {getTransactionStatus(tx)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Raw Block Data */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-lg">Raw Block Data</h4>
              <div className="mockup-code">
                <pre className="text-xs">
                  <code>{safeJsonStringify(block, 2)}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
