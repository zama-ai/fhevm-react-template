import { useEffect, useState } from 'react';
import { useReadContract, useChainId } from 'wagmi';
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

  // Add validation for tokenAddress
  if (!tokenAddress) {
    throw new Error('tokenAddress is required');
  }

  const [balance, setBalance] = useState('0');
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);

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
    address: tokenAddress as `0x${string}`,
    abi: confidentialErc20Abi,
    functionName: 'symbol',
    query: {
      enabled: enabled && !!tokenAddress,
    },
  });

  const tokenDecimalsData = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: confidentialErc20Abi,
    functionName: 'decimals',
    query: {
      enabled: enabled && !!tokenAddress,
    },
  });

  // ERC20 token balance query using balanceOf
  const tokenBalanceData = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: confidentialErc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: enabled && !!address && !!tokenAddress,
    },
  });

  useEffect(() => {
    // For ERC20 tokens
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

    if (tokenBalanceData.data && !tokenBalanceData.isLoading && tokenDecimals) {
      const rawBalance = tokenBalanceData.data as bigint;
      setRawBalance(rawBalance);
      const formattedBalance = formatUnits(rawBalance, tokenDecimals);
      setBalance(formattedBalance);
    }

    // For Confidential tokens
    if (isConfidential) {
      if (decryptedBalance || decryptedBalance === 0n) {
        const rawBalance = decryptedBalance;
        setRawBalance(rawBalance);
        const formattedBalance = formatUnits(decryptedBalance, tokenDecimals);
        setBalance(formattedBalance);
      } else {
        setBalance('•••••••');
      }
    }
  }, [
    isConfidential,
    decryptedBalance,
    chainId,
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
    decrypt,
    isLoading,
    isDecrypting,
    error,
    decryptionError,
    symbol: tokenSymbol,
    name: tokenSymbol,
    decimals: tokenDecimals,
  };
}
