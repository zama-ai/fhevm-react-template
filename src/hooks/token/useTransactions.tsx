import { useContext } from 'react';
import TransactionContext from '@/providers/TransactionContext';
import { Transaction } from '@/types/transactionTypes';
import { formatDistanceToNow } from 'date-fns';

export const useTransactions = () => {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      'useTransactions must be used within a TransactionProvider'
    );
  }

  // Helper function to format transaction date
  const formatTransactionDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Helper function to get status color
  const getStatusColor = (status: Transaction['status']): string => {
    switch (status) {
      case 'confirmed':
        return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'pending':
        return 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'failed':
        return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Helper function to get transaction type icon name
  const getTransactionTypeIcon = (type: Transaction['type']): string => {
    switch (type) {
      case 'send':
        return 'arrow-up-right';
      case 'receive':
        return 'arrow-down-left';
      case 'swap':
        return 'repeat';
      case 'approve':
        return 'check-circle';
      default:
        return 'circle';
    }
  };

  return {
    ...context,
    formatTransactionDate,
    getStatusColor,
    getTransactionTypeIcon,
  };
};
