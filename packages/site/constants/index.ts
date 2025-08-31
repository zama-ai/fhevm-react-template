import { NativeCurrency, NetworkInfo } from "@/types";

export const TAB_INDEXES = {
  INBOX: 0,
  STARRED: 1,
  SENT: 2,
  ARCHIVE: 3,
  SPAM: 4,
  READ: 5,
  TRASH: 6,
} as const;

export type TabKey = keyof typeof TAB_INDEXES;

export type TabIndex = (typeof TAB_INDEXES)[TabKey];

export const CHAIN_ID: string = "0xaa36a7";
export const CHAIN_NAME: string = "Sepolia";
export const SYMBOL: string = "SepoliaETH";

export const NATIVE_CURRENCY: NativeCurrency = {
  name: CHAIN_NAME,
  symbol: SYMBOL,
  decimals: 18,
};

export const RPC_URLS: string[] = ["https://eth-sepolia.g.alchemy.com/v2/pRrAQUdchAxHQKNS_UM61"];

export const NETWORK_INFO: NetworkInfo = {
  chainId: CHAIN_ID,
  chainName: CHAIN_NAME,
  nativeCurrency: NATIVE_CURRENCY,
  rpcUrls: RPC_URLS,
};
