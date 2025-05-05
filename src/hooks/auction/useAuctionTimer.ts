import { useState, useEffect } from 'react';

interface UseAuctionTimerProps {
  expiresAt: number;
  startAt: number;
  discountRate: number;
  hasAuctionStarted: boolean;
  refreshCurrentPrice: () => void;
  refreshTokensLeft: () => void;
}

interface UseAuctionTimerReturn {
  timeRemaining: number;
  stepTimeRemaining: number;
  formatTimeRemaining: (seconds: number) => string;
}

export const useAuctionTimer = ({
  expiresAt,
  startAt,
  discountRate,
  hasAuctionStarted,
  refreshCurrentPrice,
  refreshTokensLeft,
}: UseAuctionTimerProps): UseAuctionTimerReturn => {
  const [auctionTimeRemaining, setAuctionTimeRemaining] = useState<number>(0);
  const [stepTimeRemaining, setStepTimeRemaining] = useState<number>(0);

  // Format time remaining in HH:MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isNaN(startAt) && !isNaN(expiresAt)) {
      // Calculate time remaining
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = Math.max(0, expiresAt - currentTime);

      setAuctionTimeRemaining(remainingTime);
      setStepTimeRemaining(remainingTime / discountRate);
    }
  }, [startAt, expiresAt, discountRate]);

  // Update timer and price
  useEffect(() => {
    if (!hasAuctionStarted) return;

    const timer = setInterval(() => {
      setAuctionTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });

      refreshCurrentPrice();
      refreshTokensLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, [
    auctionTimeRemaining,
    hasAuctionStarted,
    refreshCurrentPrice,
    refreshTokensLeft,
  ]);

  return {
    timeRemaining: auctionTimeRemaining,
    formatTimeRemaining,
    stepTimeRemaining,
  };
};
