"use client";

import { useState, useEffect } from "react";
import { PublicClient, Transaction, TransactionReceipt } from "viem";
import { decodeTransactionData, getFunctionDetails } from "~~/utils/helper/decodeTxData";
import { TransactionWithFunction } from "~~/utils/helper/block";
import { safeJsonStringify } from "~~/utils/helper/serialization";

interface TransactionDetailsProps {
  transaction: Transaction | null;
  onClose: () => void;
  publicClient: PublicClient | undefined;
}

export const TransactionDetails = ({ transaction, onClose, publicClient }: TransactionDetailsProps) => {
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!publicClient || !transaction?.hash) return;
      
      setIsLoadingReceipt(true);
      try {
        const txReceipt = await publicClient.getTransactionReceipt({ hash: transaction.hash });
        setReceipt(txReceipt);
      } catch (error) {
        console.error("Error fetching transaction receipt:", error);
        setReceipt(null);
      } finally {
        setIsLoadingReceipt(false);
      }
    };

    fetchReceipt();
  }, [transaction, publicClient]);

  if (!transaction) return null;

  const txWithFunction = decodeTransactionData(transaction as TransactionWithFunction);
  
  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatValue = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(6)} ETH`;
  };

  const formatGasUsed = (gasUsed: bigint) => {
    return gasUsed.toString();
  };

  const getTransactionStatus = () => {
    if (!receipt) return "⏳ Pending";
    return receipt.status === "success" ? "✅ Success" : "❌ Failed";
  };

  const getTransactionStatusColor = () => {
    if (!receipt) return "badge-warning";
    return receipt.status === "success" ? "badge-success" : "badge-error";
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Transaction Details</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Transaction Hash */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h4 className="card-title">Transaction Hash</h4>
              <div className="font-mono text-sm break-all">
                {transaction.hash}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-lg">Transaction Info</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-base-content/70">From</div>
                    <div className="font-mono text-sm break-all">{transaction.from}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">To</div>
                    <div className="font-mono text-sm break-all">{transaction.to || "Contract Creation"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Value</div>
                    <div className="text-lg font-semibold">{formatValue(transaction.value)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Status</div>
                    <div className={`badge ${getTransactionStatusColor()}`}>
                      {getTransactionStatus()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-lg">Gas Information</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Gas Limit</div>
                    <div className="text-lg font-semibold">{transaction.gas?.toString() || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Gas Price</div>
                    <div className="text-sm">{transaction.gasPrice ? formatValue(transaction.gasPrice) : "—"}</div>
                  </div>
                  {receipt && (
                    <>
                      <div>
                        <div className="text-sm font-medium text-base-content/70">Gas Used</div>
                        <div className="text-lg font-semibold">{formatGasUsed(receipt.gasUsed)}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-base-content/70">Gas Efficiency</div>
                        <div className="text-sm">
                          {transaction.gas ? 
                            `${((Number(receipt.gasUsed) / Number(transaction.gas)) * 100).toFixed(2)}%` : 
                            "—"
                          }
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Function Call Details */}
          {txWithFunction.functionName && (
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-lg">Function Call</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Function</div>
                    <div className="font-mono text-sm">{txWithFunction.functionName}</div>
                  </div>
                  {txWithFunction.functionArgs && txWithFunction.functionArgs.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-base-content/70">Arguments</div>
                      <div className="space-y-1">
                        {txWithFunction.functionArgs.map((arg, index) => (
                          <div key={index} className="font-mono text-sm bg-base-100 p-2 rounded">
                            {txWithFunction.functionArgNames?.[index]}: {String(arg)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Full Function Call</div>
                    <div className="font-mono text-sm bg-base-100 p-2 rounded">
                      {getFunctionDetails(txWithFunction)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Details */}
          {receipt && (
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-lg">Transaction Receipt</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Block Number</div>
                    <div className="text-sm">{receipt.blockNumber.toString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Block Hash</div>
                    <div className="font-mono text-sm break-all">{receipt.blockHash}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-base-content/70">Transaction Index</div>
                    <div className="text-sm">{receipt.transactionIndex}</div>
                  </div>
                  {receipt.logs && receipt.logs.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-base-content/70">Events ({receipt.logs.length})</div>
                      <div className="space-y-1">
                        {receipt.logs.map((log, index) => (
                          <div key={index} className="font-mono text-xs bg-base-100 p-2 rounded">
                            {log.address}: {log.topics[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Raw Transaction Data */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h4 className="card-title text-lg">Raw Transaction Data</h4>
              <div className="mockup-code">
                <pre className="text-xs">
                  <code>{safeJsonStringify(transaction, 2)}</code>
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
