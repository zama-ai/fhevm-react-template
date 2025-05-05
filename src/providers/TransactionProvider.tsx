import { ReactNode, useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAccount } from "wagmi";
import TransactionContext from "@/providers/TransactionContext";
import { Transaction } from "@/types/transactionTypes";
import { toast } from "sonner";

// Mock transaction data generator
const generateMockTransactions = (address: string): Transaction[] => {
  const currentTimestamp = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: "1",
      type: "send",
      status: "confirmed",
      timestamp: currentTimestamp - 2 * dayInMs,
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      tokenSymbol: "ETH",
      amount: "0.5",
      to: "0x1234567890123456789012345678901234567890",
      from: address,
      value: 950,
      fee: "0.003",
    },
    {
      id: "2",
      type: "receive",
      status: "confirmed",
      timestamp: currentTimestamp - 1.5 * dayInMs,
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      tokenSymbol: "ETH",
      amount: "0.75",
      to: address,
      from: "0x0987654321098765432109876543210987654321",
      value: 1425,
      fee: "0",
    },
    {
      id: "3",
      type: "swap",
      status: "confirmed",
      timestamp: currentTimestamp - dayInMs,
      hash: "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
      tokenSymbol: "ETH → USDT",
      amount: "0.25",
      value: 475,
      fee: "0.002",
    },
    {
      id: "4",
      type: "approve",
      status: "confirmed",
      timestamp: currentTimestamp - 0.5 * dayInMs,
      hash: "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef",
      tokenSymbol: "USDC",
      amount: "500",
      to: "0x5678901234567890123456789012345678901234",
      from: address,
      value: 500,
      fee: "0.002",
    },
    {
      id: "5",
      type: "send",
      status: "pending",
      timestamp: currentTimestamp - 0.2 * dayInMs,
      hash: "0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef",
      tokenSymbol: "USDT",
      amount: "250",
      to: "0x8901234567890123456789012345678901234567",
      from: address,
      value: 250,
      fee: "0.0015",
    },
    {
      id: "6",
      type: "send",
      status: "failed",
      timestamp: currentTimestamp - 0.1 * dayInMs,
      hash: "0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef",
      tokenSymbol: "LINK",
      amount: "10",
      to: "0x9012345678901234567890123456789012345678",
      from: address,
      value: 100,
      fee: "0",
    },
  ];
};

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected, address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true);

      // Simulate API loading delay
      setTimeout(() => {
        try {
          const mockTransactions = generateMockTransactions(address);
          setTransactions(mockTransactions);
        } catch (error) {
          console.error("Error loading transactions:", error);
          toast.error("Failed to load transaction history");
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [isConnected, address]);

  return (
    <TransactionContext.Provider value={{ transactions, isLoading }}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionProvider;
