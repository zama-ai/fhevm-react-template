"use client";

import { useState, useEffect, useMemo } from "react";
import { PublicClient, Block, Transaction, TransactionReceipt } from "viem";
import { TransactionViewer } from "./TransactionViewer";
import { AddressAnalyzer } from "./AddressAnalyzer";
import { ContractInspector } from "./ContractInspector";
import { LiveBlocks } from "./LiveBlocks";
import { BlockDetails } from "./BlockDetails";
import { TransactionDetails } from "./TransactionDetails";

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
    { id: "blocks" as TabType, label: "📦 Live Blocks", icon: "📦" },
    { id: "transactions" as TabType, label: "💸 Transactions", icon: "💸" },
    { id: "addresses" as TabType, label: "👤 Addresses", icon: "👤" },
    { id: "contracts" as TabType, label: "📋 Contracts", icon: "📋" },
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
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="tabs tabs-boxed bg-base-200 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab tab-lg ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Network Status */}
      <div className="stats shadow bg-base-200">
        <div className="stat">
          <div className="stat-title">Current Block</div>
          <div className="stat-value text-primary">
            {currentBlockNumber ? currentBlockNumber.toString() : "—"}
          </div>
          <div className="stat-desc">Latest block number</div>
        </div>
        <div className="stat">
          <div className="stat-title">Network</div>
          <div className="stat-value text-secondary">
            {publicClient?.chain?.name || "Unknown"}
          </div>
          <div className="stat-desc">Chain ID: {publicClient?.chain?.id || "—"}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Blocks Loaded</div>
          <div className="stat-value text-accent">
            {blocks.length}
          </div>
          <div className="stat-desc">Recent blocks</div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
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
