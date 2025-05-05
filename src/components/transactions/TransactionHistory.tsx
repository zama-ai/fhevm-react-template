import { useState, useEffect } from 'react';
import {
  Alchemy,
  AssetTransfersCategory,
  AssetTransfersParams,
  Network,
  SortingOrder,
} from 'alchemy-sdk';
import { useTransactions } from '@/hooks/token/useTransactions';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transactionTypes';
import {
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  CheckCircle,
  Circle,
  ExternalLink,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWallet } from '@/hooks/useWallet';
import { VITE_PUBLIC_ALCHEMY_API_KEY } from '@/config/env';

const MAX_DISPLAY_TRANSACTIONS = 5;

const TransactionHistory = () => {
  const {
    transactions: originalTransactions,
    isLoading: originalIsLoading,
    formatTransactionDate,
    getStatusColor,
    getTransactionTypeIcon,
  } = useTransactions();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const { address } = useWallet();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address) {
        console.error('Missing address or API key');
        setIsLoading(false);
        return;
      }

      try {
        const config = {
          apiKey: VITE_PUBLIC_ALCHEMY_API_KEY,
          network: Network.ETH_SEPOLIA,
        };
        const alchemy = new Alchemy(config);

        const txHistory = await alchemy.core.getAssetTransfers({
          fromBlock: '0x0',
          order: SortingOrder.DESCENDING,
          fromAddress: address,
          maxCount: MAX_DISPLAY_TRANSACTIONS,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.INTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
          ],
          withMetadata: true,
        });

        if (!txHistory?.transfers) {
          throw new Error('No transaction data received');
        }

        console.log('transfers', txHistory);

        const formattedTxs: Transaction[] = txHistory.transfers.map(
          (tx: any) => ({
            id: tx.hash,
            hash: tx.hash,
            type:
              tx.from?.toLowerCase() === address.toLowerCase()
                ? 'send'
                : 'receive',
            tokenSymbol: tx.asset || 'ETH',
            tokenLogo: '',
            amount: tx.value,
            status: 'confirmed',
            timestamp: tx.metadata?.blockTimestamp
              ? new Date(tx.metadata.blockTimestamp).getTime()
              : Date.now(),
          }),
        );

        setTransactions(formattedTxs);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        // Optionally set an error state here to show to the user
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      fetchTransactions();
    }
  }, [address]); // Add address as dependency

  // Display either the first MAX_DISPLAY_TRANSACTIONS or all if showAllTransactions is true
  const displayedTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, MAX_DISPLAY_TRANSACTIONS);

  // Function to render the appropriate icon for a transaction type
  const renderTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4" />;
      case 'swap':
        return <Repeat className="h-4 w-4" />;
      case 'approve':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  // Function to render transaction type as text
  const renderTransactionType = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return 'Sent';
      case 'receive':
        return 'Received';
      case 'swap':
        return 'Swapped';
      case 'approve':
        return 'Approved';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[60px]">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-xl font-medium">No transactions found</h3>
        <p className="text-muted-foreground mt-2">
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="w-[50px]">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center">
                      {renderTransactionIcon(transaction.type)}
                    </div>
                    <span>{renderTransactionType(transaction.type)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.tokenLogo ? (
                      <img
                        src={transaction.tokenLogo}
                        alt={transaction.tokenSymbol}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs">
                          {transaction.tokenSymbol.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span>{transaction.tokenSymbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.type === 'receive' ? '+' : ''}
                  {transaction.amount} {transaction.tokenSymbol.split(' → ')[0]}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-md ${getStatusColor(
                      transaction.status,
                    )}`}
                  >
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground cursor-help">
                          {formatTransactionDate(transaction.timestamp)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {new Date(transaction.timestamp).toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View on Etherscan</span>
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {transactions.length > MAX_DISPLAY_TRANSACTIONS && (
          <div className="flex justify-center p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTransactions(!showAllTransactions)}
            >
              {showAllTransactions
                ? 'Show Less'
                : `Show All (${transactions.length})`}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionHistory;
