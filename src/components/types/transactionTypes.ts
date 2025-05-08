export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'approve' | 'other';
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: number;
  hash: string;
  tokenSymbol: string;
  tokenLogo?: string;
  amount: string;
  to?: string;
  from?: string;
  value?: number;
  fee?: string;
}

export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
}
