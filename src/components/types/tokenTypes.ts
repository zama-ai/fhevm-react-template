export interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  rawBalance: string;
  value: number;
  change24h: number;
  isEncrypted: boolean;
  isDecrypted?: boolean;
  logo: string;
  address?: string;
  decimals?: number;
  isConfidential?: boolean;
  isAuctionPaymentToken?: boolean;
  isAuctionToken?: boolean;
}

export interface TokenContextType {
  tokens: Token[];
  isLoading: boolean;
}
