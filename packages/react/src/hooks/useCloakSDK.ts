import { useCallback, useEffect, useRef, useState } from "react";
import { 
  CloakSDK, 
  FhevmSDKConfig, 
  Provider, 
  ChainConfig,
  CloakSDKError 
} from "@cloak-sdk/core";

export type CloakSDKStatus = "idle" | "loading" | "ready" | "error";

export interface UseCloakSDKOptions {
  provider: Provider | undefined;
  chainId: number | undefined;
  enabled?: boolean;
  mockChains?: Record<number, string>;
  onStatusChange?: (status: CloakSDKStatus) => void;
  onError?: (error: CloakSDKError) => void;
}

export interface UseCloakSDKReturn {
  sdk: CloakSDK | undefined;
  status: CloakSDKStatus;
  error: CloakSDKError | undefined;
  chainInfo: ChainConfig | undefined;
  refresh: () => void;
  isReady: boolean;
}

export function useCloakSDK(options: UseCloakSDKOptions): UseCloakSDKReturn {
  const { 
    provider, 
    chainId, 
    enabled = true, 
    mockChains, 
    onStatusChange, 
    onError 
  } = options;

  const [sdk, setSdk] = useState<CloakSDK | undefined>(undefined);
  const [status, setStatus] = useState<CloakSDKStatus>("idle");
  const [error, setError] = useState<CloakSDKError | undefined>(undefined);
  const [chainInfo, setChainInfo] = useState<ChainConfig | undefined>(undefined);
  const [isRunning, setIsRunning] = useState<boolean>(enabled);
  const [providerChanged, setProviderChanged] = useState<number>(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const providerRef = useRef<Provider | undefined>(provider);
  const chainIdRef = useRef<number | undefined>(chainId);
  const mockChainsRef = useRef<Record<number, string> | undefined>(mockChains);

  const refresh = useCallback(() => {
    if (abortControllerRef.current) {
      providerRef.current = undefined;
      chainIdRef.current = undefined;
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    providerRef.current = provider;
    chainIdRef.current = chainId;

    setSdk(undefined);
    setError(undefined);
    setStatus("idle");
    setChainInfo(undefined);

    if (provider !== undefined) {
      setProviderChanged(prev => prev + 1);
    }
  }, [provider, chainId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setIsRunning(enabled);
  }, [enabled]);

  useEffect(() => {
    if (isRunning === false) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setSdk(undefined);
      setError(undefined);
      setStatus("idle");
      setChainInfo(undefined);
      return;
    }

    if (isRunning === true) {
      if (providerRef.current === undefined) {
        setSdk(undefined);
        setError(undefined);
        setStatus("idle");
        setChainInfo(undefined);
        return;
      }

      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController();
      }

      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setStatus("loading");
      setError(undefined);

      const thisSignal = abortControllerRef.current.signal;
      const thisProvider = providerRef.current;
      const thisMockChains = mockChainsRef.current;

      const initializeSDK = async () => {
        try {
          const cloakSDK = new CloakSDK();
          
          const config: FhevmSDKConfig = {
            provider: thisProvider,
            mockChains: thisMockChains,
            signal: thisSignal,
            onStatusChange: (status) => {
              console.log(`[useCloakSDK] Status changed: ${status}`);
            },
          };

          await cloakSDK.initialize(config);

          if (thisSignal.aborted) return;
          if (thisProvider !== providerRef.current) return;

          const chainInfo = await cloakSDK.getChainInfo();

          setSdk(cloakSDK);
          setError(undefined);
          setStatus("ready");
          setChainInfo(chainInfo);
          
          if (onStatusChange) {
            onStatusChange("ready");
          }
        } catch (err) {
          if (thisSignal.aborted) return;
          if (thisProvider !== providerRef.current) return;

          const error = err instanceof CloakSDKError 
            ? err 
            : new CloakSDKError("SDK_INITIALIZATION_ERROR", "Failed to initialize SDK", err);

          setSdk(undefined);
          setError(error);
          setStatus("error");
          setChainInfo(undefined);
          
          if (onStatusChange) {
            onStatusChange("error");
          }
          
          if (onError) {
            onError(error);
          }
        }
      };

      initializeSDK();
    }
  }, [isRunning, providerChanged, onStatusChange, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (sdk) {
        sdk.destroy();
      }
    };
  }, [sdk]);

  const isReady = status === "ready" && sdk !== undefined;

  return {
    sdk,
    status,
    error,
    chainInfo,
    refresh,
    isReady,
  };
}
