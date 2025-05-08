export interface Token {
  balance: string;
  rawBalance: bigint;
  lastUpdated: string;
  decryptedBalance: bigint;
  value: string | number;
  decrypt: () => Promise<void>;
  isLoading: boolean;
  isDecrypting: boolean;
  error: Error;
  symbol: string;
  name: string;
  decimals: number;
}
