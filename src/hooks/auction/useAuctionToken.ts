import TokenContext from '@/providers/TokenContext';
import { useContext, useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { confidentialErc20Abi } from '@/utils/confidentialErc20Abi';
import { wagmiAdapter } from '@/config';

export const useAuctionToken = () => {
  const context = useContext(TokenContext);
  const [tokenName, setTokenName] = useState<string>('~');
  const [totalTokenSupply, setTotTokenalSupply] = useState<number>(0);

  useEffect(() => {
    async function populate() {
      const { symbol, address } = auctionToken;
      setTokenName(symbol);
      const [contractSymbol, totalSupply] = await Promise.all([
        readContract(wagmiAdapter.wagmiConfig, {
          address: address as `0x${string}`,
          abi: confidentialErc20Abi,
          functionName: 'symbol',
        }),
        readContract(wagmiAdapter.wagmiConfig, {
          address: address as `0x${string}`,
          abi: confidentialErc20Abi,
          functionName: 'totalSupply',
        }),
      ]);
      if (typeof contractSymbol === 'string') setTokenName(contractSymbol);
      if (typeof totalSupply === 'bigint')
        setTotTokenalSupply(Number(totalSupply));
    }
    if (!context.tokens) return;
    const auctionToken = context.tokens.find(
      ({ isAuctionToken }) => !!isAuctionToken,
    );
    if (!auctionToken) return;
    populate();
  }, [setTokenName, context.tokens, setTotTokenalSupply]);

  return { tokenName, totalTokenSupply };
};
