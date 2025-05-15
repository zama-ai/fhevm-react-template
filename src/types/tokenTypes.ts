export interface Token {
  balance: string;
  rawBalance: bigint;
  lastUpdated: string;
  decryptedBalance: bigint | null;
  decrypt: () => Promise<void>;
  isLoading: boolean;
  isDecrypting: boolean;
  error: Error | null;
  decryptionError: string | null;
  symbol: string;
  name: string;
  decimals: number;
}
