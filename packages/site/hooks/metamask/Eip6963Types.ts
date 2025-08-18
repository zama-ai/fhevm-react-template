import type { Eip1193Provider } from "ethers";

export interface Eip6963ProviderInfo {
  rdns: string;
  uuid: string;
  name: string;
  icon: string;
}

export interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
}

export interface Eip6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider";
  detail: Eip6963ProviderDetail;
}

export interface Eip6963RequestProviderEvent extends Event {
  type: "eip6963:requestProvider";
}

export async function checkEip6993(provider: Eip1193Provider): Promise<number> {
  const chainId = await provider.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}