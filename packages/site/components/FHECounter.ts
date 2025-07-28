import { FHECounterAddresses } from "@/abi/FHECounterAddresses";
import { FHECounterABI } from "@/abi/FHECounterABI";

export function getFHECounterByChainId(chainId: number | undefined): {
  abi: typeof FHECounterABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
} {
  if (!chainId) {
    return { abi: FHECounterABI.abi };
  }

  const entry =
    FHECounterAddresses[chainId.toString() as keyof typeof FHECounterAddresses];

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId,
    chainName: entry?.chainName,
    abi: FHECounterABI.abi,
  };
}
