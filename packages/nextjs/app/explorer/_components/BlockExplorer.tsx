"use client";

import { useState, useEffect, useMemo } from "react";
import { PublicClient, Block, Transaction, TransactionReceipt } from "viem";
import { TransactionViewer } from "./TransactionViewer";
import { AddressAnalyzer } from "./AddressAnalyzer";
import { ContractInspector } from "./ContractInspector";
import { LiveBlocks } from "./LiveBlocks";
import { BlockDetails } from "./BlockDetails";
import { TransactionDetails } from "./TransactionDetails";
import { Faucet } from "./Faucet";

type TabType = "blocks" | "transactions" | "addresses" | "contracts";

interface BlockExplorerProps {
  currentBlockNumber: bigint | undefined;
  publicClient: PublicClient | undefined;
}

export const BlockExplorer = ({ currentBlockNumber, publicClient }: BlockExplorerProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("blocks");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  // Fetch recent blocks
  const fetchRecentBlocks = async (count: number = 10) => {
    if (!publicClient || !currentBlockNumber) return;
    
    setIsLoading(true);
    try {
      const blockPromises = [];
      const currentBlockNum = Number(currentBlockNumber);
      const startBlock = Math.max(0, currentBlockNum - count + 1);
      
      for (let i = startBlock; i <= currentBlockNum; i++) {
        blockPromises.push(publicClient.getBlock({ blockNumber: BigInt(i), includeTransactions: true }));
      }
      
      const fetchedBlocks = await Promise.all(blockPromises);
      setBlocks(fetchedBlocks.reverse()); // Most recent first
    } catch (error) {
      console.error("Error fetching blocks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh blocks when new block arrives
  useEffect(() => {
    if (currentBlockNumber && publicClient && Number(currentBlockNumber) >= 0) {
      fetchRecentBlocks();
    }
  }, [currentBlockNumber, publicClient]);

  const tabs = [
    { id: "blocks" as TabType, label: "Blocks", icon: "📦" },
    { id: "transactions" as TabType, label: "Transactions", icon: "💸" },
    { id: "addresses" as TabType, label: "Addresses", icon: "👤" },
    { id: "contracts" as TabType, label: "Contracts", icon: "📋" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "blocks":
        return (
          <LiveBlocks 
            blocks={blocks}
            isLoading={isLoading}
            onBlockSelect={setSelectedBlock}
            onTransactionSelect={setSelectedTransaction}
            onRefresh={fetchRecentBlocks}
          />
        );
      case "transactions":
        return (
          <TransactionViewer 
            blocks={blocks}
            selectedTransaction={selectedTransaction}
            onTransactionSelect={setSelectedTransaction}
            publicClient={publicClient}
          />
        );
      case "addresses":
        return (
          <AddressAnalyzer 
            selectedAddress={selectedAddress}
            onAddressSelect={setSelectedAddress}
            publicClient={publicClient}
          />
        );
      case "contracts":
        return (
          <ContractInspector 
            publicClient={publicClient}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Network Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">{publicClient?.chain?.name || "Unknown"}</span>
              <span className="text-xs text-base-content/60">#{publicClient?.chain?.id || "—"}</span>
            </div>
            <div className="text-sm text-base-content/60">
              Block {currentBlockNumber ? currentBlockNumber.toString() : "—"}
            </div>
          </div>

          {/* Faucet */}
          <Faucet publicClient={publicClient} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-base-300 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>

      {/* Block Details Modal */}
      {selectedBlock && (
        <BlockDetails 
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          publicClient={publicClient}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetails 
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          publicClient={publicClient}
        />
      )}
    </div>
  );
};
