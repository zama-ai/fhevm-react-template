"use client";

import { useState, useEffect } from "react";
import { PublicClient, Transaction, TransactionReceipt } from "viem";
import { decodeTransactionData, getFunctionDetails } from "~~/utils/helper/decodeTxData";
import { TransactionWithFunction } from "~~/utils/helper/block";

interface TransactionViewerProps {
  blocks: any[];
  selectedTransaction: Transaction | null;
  onTransactionSelect: (transaction: Transaction) => void;
  publicClient: PublicClient | undefined;
}

export const TransactionViewer = ({ 
  blocks, 
  selectedTransaction, 
  onTransactionSelect, 
  publicClient 
}: TransactionViewerProps) => {
  const [allTransactions, setAllTransactions] = useState<TransactionWithFunction[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<Record<string, TransactionReceipt>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByStatus, setFilterByStatus] = useState<"all" | "success" | "failed">("all");

  // Extract all transactions from blocks
  useEffect(() => {
    const transactions: TransactionWithFunction[] = [];
    blocks.forEach(block => {
      block.transactions.forEach((tx: Transaction) => {
        const txWithFunction = decodeTransactionData(tx as TransactionWithFunction);
        transactions.push(txWithFunction);
      });
    });
    setAllTransactions(transactions);
  }, [blocks]);

  // Fetch transaction receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      if (!publicClient) return;
      
      const receiptPromises = allTransactions.map(async (tx) => {
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
    };

    if (allTransactions.length > 0) {
      fetchReceipts();
    }
  }, [allTransactions, publicClient]);

  const filteredTransactions = allTransactions.filter(tx => {
    const matchesSearch = tx.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.functionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.to?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const receipt = transactionReceipts[tx.hash!];
    const isSuccess = receipt ? receipt.status === "success" : true; // Assume success if no receipt
    
    const matchesStatus = filterByStatus === "all" || 
                         (filterByStatus === "success" && isSuccess) ||
                         (filterByStatus === "failed" && !isSuccess);
    
    return matchesSearch && matchesStatus;
  });

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatValue = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(4)} ETH`;
  };

  const getTransactionStatus = (tx: TransactionWithFunction) => {
    const receipt = transactionReceipts[tx.hash!];
    if (!receipt) return "⏳ Pending";
    return receipt.status === "success" ? "✅ Success" : "❌ Failed";
  };

  const getTransactionStatusColor = (tx: TransactionWithFunction) => {
    const receipt = transactionReceipts[tx.hash!];
    if (!receipt) return "badge-warning";
    return receipt.status === "success" ? "badge-success" : "badge-error";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">💸 Transactions</h2>
        <div className="text-sm text-base-content/70">
          {filteredTransactions.length} of {allTransactions.length} transactions
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by hash, function, or address..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="select select-bordered"
            value={filterByStatus}
            onChange={(e) => setFilterByStatus(e.target.value as "all" | "success" | "failed")}
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, index) => (
              <tr key={tx.hash || index} className="hover">
                <td>
                  <div className="font-mono text-sm max-w-xs truncate">
                    {tx.hash}
                  </div>
                </td>
                <td>
                  <div className="max-w-xs">
                    {tx.functionName ? (
                      <div className="text-sm">
                        <div className="font-medium">{tx.functionName}</div>
                        {tx.functionArgs && tx.functionArgs.length > 0 && (
                          <div className="text-xs text-base-content/70">
                            {tx.functionArgs.slice(0, 2).join(", ")}
                            {tx.functionArgs.length > 2 && "..."}
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
                <td>
                  <button
                    className="btn btn-outline btn-xs"
                    onClick={() => onTransactionSelect(tx)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-base-content/50">
            {allTransactions.length === 0 
              ? "No transactions found. Make sure your local node is running and has some activity."
              : "No transactions match your search criteria."
            }
          </div>
        </div>
      )}
    </div>
  );
};
