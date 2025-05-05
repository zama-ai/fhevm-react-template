import { Chain } from "viem";
import { useChainId } from "wagmi";
import { mainnet, sepolia, polygon, optimism, arbitrum } from "wagmi/chains";

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
    case polygon.id:
      chain = polygon;
      break;
    case optimism.id:
      chain = optimism;
      break;
    case arbitrum.id:
      chain = arbitrum;
      break;
    default:
      // Default to mainnet if chainId is not recognized
      chain = mainnet;
  }

  return {
    chainId,
    chain,
  };
};
