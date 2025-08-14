import { ethers } from "ethers";
import { useMetaMask } from "./useMetaMaskProvider";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface UseMetaMaskEthersSignerState {
  provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
  ethersBrowserProvider: ethers.BrowserProvider | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
}

function useMetaMaskEthersSignerInternal(): UseMetaMaskEthersSignerState {
  const { provider, chainId, accounts, isConnected, connect, error } = useMetaMask();
  const [ethersSigner, setEthersSigner] = useState<
    ethers.JsonRpcSigner | undefined
  >(undefined);
  const [ethersBrowserProvider, setEthersBrowserProvider] = useState<
    ethers.BrowserProvider | undefined
  >(undefined);

  const chainIdRef = useRef<number | undefined>(chainId);
  const ethersSignerRef = useRef<ethers.JsonRpcSigner | undefined>(undefined);

  const sameChain = useRef((chainId: number | undefined) => {
    return chainId === chainIdRef.current;
  });

  const sameSigner = useRef(
    (ethersSigner: ethers.JsonRpcSigner | undefined) => {
      return ethersSigner === ethersSignerRef.current;
    }
  );

  useEffect(() => {
    chainIdRef.current = chainId;
  }, [chainId]);

  useEffect(() => {
    if (
      !provider ||
      !chainId ||
      !isConnected ||
      !accounts ||
      accounts.length === 0
    ) {
      ethersSignerRef.current = undefined;
      setEthersSigner(undefined);
      setEthersBrowserProvider(undefined);
      return;
    }

    const bp: ethers.BrowserProvider = new ethers.BrowserProvider(provider);
    const s = new ethers.JsonRpcSigner(bp, accounts[0]);
    ethersSignerRef.current = s;
    setEthersSigner(s);
    setEthersBrowserProvider(bp);
  }, [provider, chainId, isConnected, accounts]);

  return {
    sameChain,
    sameSigner,
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersBrowserProvider,
    ethersSigner,
    error
  };
}

const MetaMaskEthersSignerContext = createContext<UseMetaMaskEthersSignerState | undefined>(
  undefined
);

export const MetaMaskEthersSignerProvider: React.FC<{ children: ReactNode; }> = ({
  children,
}) => {
  const props = useMetaMaskEthersSignerInternal();
  return (
    <MetaMaskEthersSignerContext.Provider value={props}>
      {children}
    </MetaMaskEthersSignerContext.Provider>
  );
};

export function useMetaMaskEthersSigner() {
  const context = useContext(MetaMaskEthersSignerContext);
  if (context === undefined) {
    throw new Error("useMetaMaskEthersSigner must be used within a MetaMaskEthersSignerProvider");
  }
  return context;
}
