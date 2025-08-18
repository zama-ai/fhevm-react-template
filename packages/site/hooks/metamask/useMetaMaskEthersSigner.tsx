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
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  initialMockChains: Readonly<Record<number, string>> | undefined;
}

function useMetaMaskEthersSignerInternal(parameters: { initialMockChains?: Readonly<Record<number, string>> }): UseMetaMaskEthersSignerState {
  const { initialMockChains } = parameters;
  const { provider, chainId, accounts, isConnected, connect, error } = useMetaMask();
  const [ethersSigner, setEthersSigner] = useState<
    ethers.JsonRpcSigner | undefined
  >(undefined);
  const [ethersBrowserProvider, setEthersBrowserProvider] = useState<
    ethers.BrowserProvider | undefined
  >(undefined);
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<
    ethers.ContractRunner | undefined
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
      setEthersReadonlyProvider(undefined);
      return;
    }

    console.warn(`[useMetaMaskEthersSignerInternal] create new ethers.BrowserProvider(), chainId=${chainId}`);

    const bp: ethers.BrowserProvider = new ethers.BrowserProvider(provider);
    let rop: ethers.ContractRunner = bp;
    const rpcUrl: string | undefined = initialMockChains?.[chainId];
    if (rpcUrl) {
      // Try to avoid using MetaMask Eip1193Provider for view functions in mock mode
      // MetaMask keeps a cache value of all view function calls. When using a dev node, this can be problematic and 
      // lead to nasty bugs. See README for more infos.
      rop = new ethers.JsonRpcProvider(rpcUrl);
      console.warn(`[useMetaMaskEthersSignerInternal] create new readonly provider ethers.JsonRpcProvider(${rpcUrl}), chainId=${chainId}`);
    } else {
      console.warn(`[useMetaMaskEthersSignerInternal] use ethers.BrowserProvider() as readonly provider, chainId=${chainId}`);
    }

    const s = new ethers.JsonRpcSigner(bp, accounts[0]);
    ethersSignerRef.current = s;
    setEthersSigner(s);
    setEthersBrowserProvider(bp);
    setEthersReadonlyProvider(rop);
  }, [provider, chainId, isConnected, accounts, initialMockChains]);

  return {
    sameChain,
    sameSigner,
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersBrowserProvider,
    ethersReadonlyProvider,
    ethersSigner,
    error,
    initialMockChains
  };
}

const MetaMaskEthersSignerContext = createContext<UseMetaMaskEthersSignerState | undefined>(
  undefined
);

interface MetaMaskEthersSignerProviderProps {
  children: ReactNode;
  initialMockChains: Readonly<Record<number, string>>;
}

export const MetaMaskEthersSignerProvider: React.FC<MetaMaskEthersSignerProviderProps> = ({
  children, initialMockChains
}) => {
  const props = useMetaMaskEthersSignerInternal({ initialMockChains });
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
