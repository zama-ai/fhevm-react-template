export type Mail = {
  id: number;
  threadId: number;
  owner: string;
  from: string;
  to: string;
  time: string;
  box: Box;
  subject: string;
  body: string;
};

export enum Box {
  INBOX,
  STAR,
  SENT,
  ARCHIVE,
  READ,
  SPAM,
  TRASH,
  REPLY,
}

export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface NetworkInfo {
  chainId: string;
  chainName: string;
  nativeCurrency: NativeCurrency;
  rpcUrls: string[];
}

export type LoadingBarRef = React.RefObject<{
  continuousStart: () => void;
  staticStart: () => void;
  start: () => void;
  complete: () => void;
  increase: (value: number) => void;
  decrease: (value: number) => void;
  getProgress: () => number;
} | null>;
