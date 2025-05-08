import { Chain } from 'viem';
import { useChainId } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

export const useChain = () => {
  const chainId = useChainId();

  // Get the appropriate chain object based on chainId
  let chain: Chain;
  switch (chainId) {
    case mainnet.id:
      chain = mainnet;
      break;
    case sepolia.id:
      chain = sepolia;
      break;
    default:
      // Default to sepolia if chainId is not recognized
      chain = sepolia;
  }

  return {
    chainId,
    chain,
  };
};
