import { createContext } from 'react';
import { TransactionContextType } from '@/types/transactionTypes';

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  isLoading: false,
});

export default TransactionContext;
