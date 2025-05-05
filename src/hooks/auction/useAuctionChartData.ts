import { useState, useEffect } from 'react';

interface PriceDataChartPoint {
  time: string;
  price: number;
  reserve: number;
}

interface TokenDataChartPoint {
  time: string;
  tokens: number;
}

interface UseAuctionChartDataProps {
  startPrice: number;
  endPrice: number;
  duration: number;
  initialTokenSupply: number;
  reservePrice: number;
}

export const useAuctionChartData = ({
  startPrice,
  endPrice,
  duration,
  initialTokenSupply,
  reservePrice,
}: UseAuctionChartDataProps) => {
  const [priceChartData, setPriceChartData] = useState<
    Array<PriceDataChartPoint>
  >([]);
  const [tokenChartData, setTokenChartData] = useState<
    Array<TokenDataChartPoint>
  >([]);

  // Generate initial chart data
  useEffect(() => {
    const generateChartData = () => {
      const priceData: PriceDataChartPoint[] = [];
      const tokenData: TokenDataChartPoint[] = [];

      // Generate data points for the entire auction duration
      for (let hour = 0; hour <= duration; hour++) {
        const elapsedRatio = hour / duration;
        const price = startPrice - (startPrice - endPrice) * elapsedRatio;
        const time = `${hour}h`;

        priceData.push({
          time,
          price: Math.max(endPrice, price),
          reserve: reservePrice,
        });

        // For token chart, we'll just use a linear decrease for now as a placeholder
        // In a real application, this would be based on actual token sales
        tokenData.push({
          time,
          tokens: initialTokenSupply - initialTokenSupply * 0.1 * elapsedRatio,
        });
      }

      setPriceChartData(priceData);
      setTokenChartData(tokenData);
    };

    generateChartData();
  }, [startPrice, endPrice, duration, initialTokenSupply, reservePrice]);

  return {
    priceChartData,
    tokenChartData,
    setPriceChartData,
    setTokenChartData,
  };
};
