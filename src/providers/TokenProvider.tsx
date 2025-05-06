import { ReactNode, useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useAccount, useChainId } from 'wagmi';
import TokenContext from '@/providers/TokenContext';
import { Token } from '@/types/tokenTypes';
import { getNativeToken, getDefaultTokens } from '@/utils/tokenUtils';

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useWallet();
  const { address } = useWallet();
  const chainId = useChainId();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true);

      // Get the native token based on current chain
      const nativeToken = getNativeToken(chainId);

      // Get other default tokens based on the current chain
      const otherTokens = getDefaultTokens(chainId);

      // Initialize tokens with default values, always putting native token first
      const initialTokens = [
        {
          ...nativeToken,
          balance: '0',
          rawBalance: '0',
          value: 0,
          change24h: 0,
        },
        ...otherTokens.map((token) => ({
          ...token,
          balance: '0',
          rawBalance: '0',
          value: 0,
          change24h: 0,
        })),
      ];

      setTokens(initialTokens);

      // Start fetching real balances for each token
      fetchTokenBalances(address, chainId);
    } else {
      setTokens([]);
      setIsLoading(false);
    }
  }, [isConnected, address, chainId]);

  // Function to fetch real balances for all tokens
  const fetchTokenBalances = async (
    walletAddress: string,
    currentChainId: number,
  ) => {
    try {
      // Get the native token based on current chain
      const nativeToken = getNativeToken(currentChainId);

      // Get other default tokens based on the current chain
      const otherTokens = getDefaultTokens(currentChainId);

      // Generate random 24h changes for demo purposes
      const nativeChange24h = Math.random() * 10 - 5; // Random value between -5% and +5%

      // Create the native token with balance placeholder - real balance will be fetched by useTokenBalance in TokenCard
      const nativeTokenWithBalance = {
        ...nativeToken,
        balance: '0',
        rawBalance: '0',
        value: 0,
        change24h: nativeChange24h,
      };

      // Create other tokens with balance placeholders
      const otherTokensWithBalances = otherTokens.map((token) => {
        const change24h = Math.random() * 10 - 5; // Random value between -5% and +5%
        return {
          ...token,
          balance: '0',
          rawBalance: '0',
          value: 0,
          change24h,
        };
      });

      // Combine native token and other tokens, always putting native token first
      const allTokens = [nativeTokenWithBalance, ...otherTokensWithBalances];

      setTokens(allTokens);
    } catch (error) {
      console.error('Error initializing tokens:', error);
      toast.error('Failed to load token data');
    } finally {
      setIsLoading(false);
    }
  };

  const storeDecrypt = (tokenAddress: string, newBalance: string) => {
    setTokens((prevTokens) =>
      prevTokens.map((token) =>
        token.address.toLowerCase() === tokenAddress.toLowerCase()
          ? {
              ...token,
              balance: newBalance,
              isDecrypted: true,
            }
          : token,
      ),
    );
  };

  const value = {
    tokens,
    isLoading,
    storeDecrypt,
  };

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};

export default TokenProvider;
