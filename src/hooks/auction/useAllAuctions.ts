import { useState, useEffect, useMemo } from 'react';
import { readContract } from 'wagmi/actions';
import { factoryAuctionAbi } from '@/utils/factoryAuctionAbi';
import { VITE_AUCTION_FACTORY_CONTRACT_ADDRESS } from '@/config/env';
import { auctionAbi } from '@/utils/auctionAbi';
import { useWallet } from '../useWallet';
import { wagmiAdapter } from '@/config';

export interface AuctionSummary {
  address: `0x${string}`;
  hasAuctionStarted?: boolean;
  expiresAt?: number;
  seller?: string;
}

export function useAllAuctions() {
  const { address, isConnected } = useWallet();
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!isConnected) {
        setAuctions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Read all auctions from the factory contract
        const result = await readContract(wagmiAdapter.wagmiConfig, {
          address: VITE_AUCTION_FACTORY_CONTRACT_ADDRESS as `0x${string}`,
          abi: factoryAuctionAbi,
          functionName: 'getAllAuctions',
        });

        if (result && Array.isArray(result)) {
          const auctionAddresses = result as `0x${string}`[];

          // Initialize auctionSummaries with addresses first
          // This prevents the "map of undefined" error if promise.all fails
          const auctionSummaries: AuctionSummary[] = auctionAddresses.map(
            (auctionAddress) => ({
              address: auctionAddress,
              hasAuctionStarted: false,
              expiresAt: 0,
              seller: '',
            }),
          );

          // Set the initial data first to prevent the map error
          setAuctions(auctionSummaries);

          // Get additional details for each auction
          const auctionDetailsPromises = auctionAddresses.map(
            async (auctionAddress) => {
              try {
                const hasStarted = await readContract(
                  wagmiAdapter.wagmiConfig,
                  {
                    address: auctionAddress,
                    abi: auctionAbi,
                    functionName: 'auctionStart',
                  },
                );

                const expiresAtResult = await readContract(
                  wagmiAdapter.wagmiConfig,
                  {
                    address: auctionAddress,
                    abi: auctionAbi,
                    functionName: 'expiresAt',
                  },
                );

                const sellerResult = await readContract(
                  wagmiAdapter.wagmiConfig,
                  {
                    address: auctionAddress,
                    abi: auctionAbi,
                    functionName: 'seller',
                  },
                );

                return {
                  address: auctionAddress,
                  hasAuctionStarted: Boolean(hasStarted),
                  expiresAt: Number(expiresAtResult),
                  seller: sellerResult as string,
                };
              } catch (err) {
                console.error(
                  `Error fetching details for auction ${auctionAddress}:`,
                  err,
                );
                return {
                  address: auctionAddress,
                  hasAuctionStarted: false,
                  expiresAt: 0,
                  seller: '',
                };
              }
            },
          );

          try {
            const auctionsWithDetails = await Promise.all(
              auctionDetailsPromises,
            );
            console.log(auctionsWithDetails);
            setAuctions(auctionsWithDetails);
          } catch (err) {
            console.error('Error fetching auction details:', err);
            // We already set initial auction data above, so we don't need to set again
          }
        } else {
          setAuctions([]);
        }
      } catch (err) {
        console.error('Error fetching auctions:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to fetch auctions'),
        );
        // Make sure auctions is at least an empty array to prevent map errors
        setAuctions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, [isConnected, address]);

  // Filter for active auctions
  const activeAuctions = useMemo(() => {
    if (!auctions || !auctions.length) return [];
    const now = Math.floor(Date.now() / 1000);
    return auctions.filter(
      (auction) =>
        auction.hasAuctionStarted &&
        auction.expiresAt &&
        auction.expiresAt > now,
    );
  }, [auctions]);

  // Filter for ended auctions
  const endedAuctions = useMemo(() => {
    if (!auctions || !auctions.length) return [];
    const now = Math.floor(Date.now() / 1000);
    return auctions.filter(
      (auction) =>
        auction.hasAuctionStarted &&
        auction.expiresAt &&
        auction.expiresAt <= now,
    );
  }, [auctions]);

  // Filter for user's auctions
  const myAuctions = useMemo(() => {
    if (!auctions || !auctions.length || !address) return [];
    return auctions.filter(
      (auction) => auction.seller?.toLowerCase() === address.toLowerCase(),
    );
  }, [auctions, address]);

  return {
    auctions,
    activeAuctions,
    endedAuctions,
    myAuctions,
    isLoading,
    error,
  };
}
