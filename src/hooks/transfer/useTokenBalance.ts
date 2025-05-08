import { useEffect, useState } from 'react';
import { useBalance, useReadContract, useChainId } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { formatUnits } from '@/lib/helper';
import { confidentialErc20Abi } from '@/abi/confidentialErc20Abi';
import { useSigner } from '../wallet/useSigner';
import { useDecryptValue } from '../fhevm/useDecryptValue';

interface UseTokenBalanceProps {
  address?: string;
  tokenAddress: string;
  isConfidential?: boolean;
  enabled?: boolean;
}

export function useTokenBalance({
  address,
  tokenAddress,
  isConfidential = false,
  enabled = true,
}: UseTokenBalanceProps) {
  const chainId = useChainId();
  const [balance, setBalance] = useState('0');
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [value, setValue] = useState<string | number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);

  const isNativeToken = tokenAddress === 'native';
  const { signer } = useSigner();

  const {
    decryptedValue: decryptedBalance,
    lastUpdated,
    isDecrypting,
    decrypt: decryptBalance,
    error: decryptionError,
  } = useDecryptValue({
    signer,
  });

  // Remove tokenData and add separate queries for symbol and decimals
  const tokenSymbolData = useReadContract({
    address: isNativeToken ? undefined : (tokenAddress as `0x${string}`),
    abi: confidentialErc20Abi,
    functionName: 'symbol',
    query: {
      enabled: enabled && !isNativeToken && !!tokenAddress,
    },
  });

  const tokenDecimalsData = useReadContract({
    address: isNativeToken ? undefined : (tokenAddress as `0x${string}`),
    abi: confidentialErc20Abi,
    functionName: 'decimals',
    query: {
      enabled: enabled && !isNativeToken && !!tokenAddress,
    },
  });

  // Native token balance query
  const nativeBalanceData = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: enabled && !!address && isNativeToken,
    },
  });

  // ERC20 token balance query using balanceOf
  const tokenBalanceData = useReadContract({
    address: isNativeToken ? undefined : (tokenAddress as `0x${string}`),
    abi: confidentialErc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: enabled && !!address && !isNativeToken && !!tokenAddress,
    },
  });

  useEffect(() => {
    // For native token
    if (isNativeToken) {
      setIsLoading(nativeBalanceData.isLoading);

      if (nativeBalanceData.error) {
        setError(nativeBalanceData.error);
      } else {
        setError(null);
      }

      if (nativeBalanceData.data && !nativeBalanceData.isLoading) {
        const formattedBalance = formatUnits(
          nativeBalanceData.data.value,
          nativeBalanceData.data.decimals,
        );
        setBalance(formattedBalance);
        setRawBalance(nativeBalanceData.data.value);

        // Get the appropriate token price based on the current network
        const nativePrice = 1940; // Default ETH price

        setValue(parseFloat(formattedBalance) * nativePrice);
      }
    }
    // For ERC20 tokens
    else {
      setIsLoading(
        tokenBalanceData.isLoading ||
          tokenSymbolData.isLoading ||
          tokenDecimalsData.isLoading,
      );

      if (tokenBalanceData.error) {
        setError(tokenBalanceData.error);
      } else if (tokenSymbolData.error) {
        setError(tokenSymbolData.error);
      } else if (tokenDecimalsData.error) {
        setError(tokenDecimalsData.error);
      } else {
        setError(null);
      }

      // Update symbol and decimals when available
      if (tokenSymbolData.data) {
        setTokenSymbol(tokenSymbolData.data as string);
      }

      if (tokenDecimalsData.data) {
        setTokenDecimals(Number(tokenDecimalsData.data));
      }

      if (
        tokenBalanceData.data &&
        !tokenBalanceData.isLoading &&
        tokenDecimals
      ) {
        const rawBalance = tokenBalanceData.data as bigint;
        setRawBalance(rawBalance);
        const formattedBalance = formatUnits(rawBalance, tokenDecimals);
        setBalance(formattedBalance);

        // Mock price calculation based on token symbol
        const mockPrice =
          tokenSymbol === 'LINK'
            ? 11.5
            : tokenSymbol === 'MATIC'
              ? 1.1
              : tokenSymbol === 'WETH'
                ? 1940
                : tokenSymbol === 'UNI'
                  ? 9.8
                  : 5;

        setValue(parseFloat(formattedBalance) * mockPrice);
      }

      // For Confidential tokens
      if (isConfidential) {
        if (decryptedBalance || decryptedBalance === 0n) {
          const rawBalance = decryptedBalance;
          setRawBalance(rawBalance);
          const formattedBalance = formatUnits(decryptedBalance, tokenDecimals);
          setBalance(formattedBalance);
          // Mock price calculation based on token symbol
          const mockPrice =
            tokenSymbol === 'LINK'
              ? 11.5
              : tokenSymbol === 'MATIC'
                ? 1.1
                : tokenSymbol === 'WETH'
                  ? 1940
                  : tokenSymbol === 'WETHc'
                    ? 1940
                    : tokenSymbol === 'UNI'
                      ? 9.8
                      : 5;

          setValue(parseFloat(formattedBalance) * mockPrice);
        } else {
          setBalance('•••••••');
          setValue('•••••••');
        }
      }
    }
  }, [
    isNativeToken,
    isConfidential,
    decryptedBalance,
    chainId,
    nativeBalanceData.data,
    nativeBalanceData.isLoading,
    nativeBalanceData.error,
    tokenBalanceData.data,
    tokenBalanceData.isLoading,
    tokenBalanceData.error,
    tokenSymbolData.data,
    tokenSymbolData.isLoading,
    tokenSymbolData.error,
    tokenDecimalsData.data,
    tokenDecimalsData.isLoading,
    tokenDecimalsData.error,
    tokenDecimals,
    tokenSymbol,
  ]);

  // Get the appropriate native token symbol based on the chain
  const getNativeSymbol = () => {
    return 'ETH'; // Default for Ethereum networks (mainnet, sepolia, etc.)
  };

  // Get the appropriate native token name based on the chain
  const getNativeName = () => {
    if (chainId === sepolia.id) return 'Sepolia ETH';
    return 'Sepolia ETH'; // Default
  };

  const decrypt = async () => {
    if (isConfidential) {
      await decryptBalance(rawBalance, tokenAddress as `0x${string}`);
    }
  };

  return {
    balance,
    rawBalance,
    lastUpdated,
    decryptedBalance,
    value,
    decrypt,
    isLoading,
    isDecrypting,
    error,
    symbol: isNativeToken ? getNativeSymbol() : tokenSymbol,
    name: isNativeToken ? getNativeName() : tokenSymbol,
    decimals: isNativeToken ? 18 : tokenDecimals,
  };
}
