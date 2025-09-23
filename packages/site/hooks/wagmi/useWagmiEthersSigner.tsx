import { ReactNode, RefObject, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";

// Create a proper EIP-1193 provider interface
interface Eip1193Provider {
  request: (args: any) => Promise<any>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
}

export interface UseWagmiEthersSignerState {
  provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
  ethersBrowserProvider: ethers.BrowserProvider | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  initialMockChains: Readonly<Record<number, string>> | undefined;
}

function useWagmiEthersSignerInternal(parameters: {
  initialMockChains?: Readonly<Record<number, string>>;
}): UseWagmiEthersSignerState {
  const { initialMockChains } = parameters;
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersBrowserProvider, setEthersBrowserProvider] = useState<ethers.BrowserProvider | undefined>(undefined);
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<ethers.ContractRunner | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const chainId = chain?.id;
  const accounts = useMemo(() => (address ? [address] : undefined), [address]);

  const chainIdRef = useRef<number | undefined>(chainId);
  const ethersSignerRef = useRef<ethers.JsonRpcSigner | undefined>(undefined);

  const sameChain = useRef((chainId: number | undefined) => {
    return chainId === chainIdRef.current;
  });

  const sameSigner = useRef((ethersSigner: ethers.JsonRpcSigner | undefined) => {
    return ethersSigner === ethersSignerRef.current;
  });

  const connect = () => {
    // Rainbow Wallet connection is handled by RainbowKit's ConnectButton
    // This function is kept for compatibility but doesn't need to do anything
    console.log("Connect function called - Rainbow Wallet connection handled by RainbowKit");
  };

  useEffect(() => {
    chainIdRef.current = chainId;
  }, [chainId]);

  useEffect(() => {
    if (!walletClient || !chainId || !isConnected || !accounts || accounts.length === 0) {
      ethersSignerRef.current = undefined;
      setEthersSigner(undefined);
      setEthersBrowserProvider(undefined);
      setEthersReadonlyProvider(undefined);
      setError(undefined);
      return;
    }

    try {
      console.warn(`[useWagmiEthersSignerInternal] create new ethers.BrowserProvider(), chainId=${chainId}`);
      console.log("Wallet client:", walletClient);

      // Convert wagmi wallet client to EIP-1193 provider
      const eip1193Provider: Eip1193Provider = {
        request: async (args: any) => {
          return await walletClient.request(args);
        },
        on: () => {
          // wagmi handles events differently, so we'll implement a basic version
          console.log("Provider events not fully implemented for wagmi");
        },
        removeListener: () => {
          console.log("Provider removeListener not fully implemented for wagmi");
        },
      };

      const bp: ethers.BrowserProvider = new ethers.BrowserProvider(eip1193Provider);
      let rop: ethers.ContractRunner = bp;
      const rpcUrl: string | undefined = initialMockChains?.[chainId];

      if (rpcUrl) {
        // Try to avoid using wallet Eip1193Provider for view functions in mock mode
        // Wallet keeps a cache value of all view function calls. When using a dev node, this can be problematic and
        // lead to nasty bugs. See README for more infos.
        rop = new ethers.JsonRpcProvider(rpcUrl);
        console.warn(
          `[useWagmiEthersSignerInternal] create new readonly provider ethers.JsonRpcProvider(${rpcUrl}), chainId=${chainId}`,
        );
      } else {
        console.warn(
          `[useWagmiEthersSignerInternal] use ethers.BrowserProvider() as readonly provider, chainId=${chainId}`,
        );
      }

      const s = new ethers.JsonRpcSigner(bp, accounts[0]);
      ethersSignerRef.current = s;
      setEthersSigner(s);
      setEthersBrowserProvider(bp);
      setEthersReadonlyProvider(rop);
      setError(undefined);

      console.log("Successfully created ethers providers and signer");
    } catch (err) {
      console.error("Error creating ethers providers:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setEthersSigner(undefined);
      setEthersBrowserProvider(undefined);
      setEthersReadonlyProvider(undefined);
    }
  }, [walletClient, chainId, isConnected, accounts, initialMockChains]);

  return {
    sameChain,
    sameSigner,
    provider: walletClient
      ? ({
          request: async (args: any) => {
            return await walletClient.request(args);
          },
          on: () => {
            console.log("Provider events not fully implemented for wagmi");
          },
          removeListener: () => {
            console.log("Provider removeListener not fully implemented for wagmi");
          },
        } as ethers.Eip1193Provider)
      : undefined,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersBrowserProvider,
    ethersReadonlyProvider,
    ethersSigner,
    error,
    initialMockChains,
  };
}

const WagmiEthersSignerContext = createContext<UseWagmiEthersSignerState | undefined>(undefined);

interface WagmiEthersSignerProviderProps {
  children: ReactNode;
  initialMockChains: Readonly<Record<number, string>>;
}

export const WagmiEthersSignerProvider: React.FC<WagmiEthersSignerProviderProps> = ({
  children,
  initialMockChains,
}) => {
  const props = useWagmiEthersSignerInternal({ initialMockChains });
  return <WagmiEthersSignerContext.Provider value={props}>{children}</WagmiEthersSignerContext.Provider>;
};

export function useWagmiEthersSigner() {
  const context = useContext(WagmiEthersSignerContext);
  if (context === undefined) {
    throw new Error("useWagmiEthersSigner must be used within a WagmiEthersSignerProvider");
  }
  return context;
}
