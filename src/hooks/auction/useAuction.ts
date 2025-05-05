import { auctionAbi } from '@/utils/auctionAbi';
import { useReadContract } from 'wagmi';

export const useAuctionCurrentPrice = (address: string) => {
  const { data, refetch } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'getPrice',
  });
  return { currentPrice: Number(data) || 0, refreshCurrentPrice: refetch };
};

export const useAuctionTokensLeft = (address: string) => {
  const { data, refetch } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'tokensLeftReveal',
  });
  return { tokensLeft: Number(data) || 0, refreshTokensLeft: refetch };
};

export const useAuctionDetails = (address: string) => {
  const { data: startPrice } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'startingPrice',
  });

  const { data: discountRate } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'discountRate',
  });

  const { data: startAt } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'startAt',
  });

  const { data: seller } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'seller',
  });

  const { data: expiresAt } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'expiresAt',
  });

  const { data: reservePrice } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'reservePrice',
  });

  const { data: initialTokenSupply } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'amount',
  });

  const { data: hasAuctionStarted } = useReadContract({
    abi: auctionAbi,
    address: address as `0x${string}`,
    functionName: 'auctionStart',
  });

  return {
    startPrice: Number(startPrice),
    discountRate: Number(discountRate),
    startAt: Number(startAt),
    expiresAt: Number(expiresAt),
    seller: String(seller),
    reservePrice: Number(reservePrice),
    initialTokenSupply: Number(initialTokenSupply),
    hasAuctionStarted: Boolean(hasAuctionStarted),
  };
};
