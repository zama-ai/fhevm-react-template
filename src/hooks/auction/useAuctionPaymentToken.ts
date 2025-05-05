import TokenContext from '@/providers/TokenContext';
import { useContext, useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { confidentialErc20Abi } from '@/utils/confidentialErc20Abi';
import { wagmiAdapter } from '@/config';

export const useAuctionPaymentToken = () => {
  const context = useContext(TokenContext);
  const [paymentTokenSymbol, setPaymentTokenSymbol] = useState<string>('~');

  useEffect(() => {
    async function populate() {
      const { symbol, address } = auctionToken;
      setPaymentTokenSymbol(symbol);
      const contractSymbol = await readContract(wagmiAdapter.wagmiConfig, {
        address: address as `0x${string}`,
        abi: confidentialErc20Abi,
        functionName: 'symbol',
      });
      if (typeof contractSymbol === 'string')
        setPaymentTokenSymbol(contractSymbol);
    }
    if (!context.tokens) return;
    const auctionToken = context.tokens.find(
      ({ isAuctionPaymentToken }) => !!isAuctionPaymentToken,
    );
    if (!auctionToken) return;
    populate();
  }, [setPaymentTokenSymbol, context.tokens]);

  return { paymentTokenSymbol };
};
