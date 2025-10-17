import { createContext, useContext, ReactNode } from "react";
import { CloakSDK, Provider } from "@cloak-sdk/core";
import { useCloakSDK } from "../hooks/useCloakSDK";

export interface CloakProviderProps {
  provider: Provider | undefined;
  chainId: number | undefined;
  mockChains?: Record<number, string>;
  onStatusChange?: (status: "idle" | "loading" | "ready" | "error") => void;
  onError?: (error: any) => void;
  children: ReactNode;
}

export interface CloakContextValue {
  sdk: CloakSDK | undefined;
  status: "idle" | "loading" | "ready" | "error";
  error: any;
  chainInfo: any;
  isReady: boolean;
  refresh: () => void;
}

const CloakContext = createContext<CloakContextValue | undefined>(undefined);

export function CloakProvider({
  provider,
  chainId,
  mockChains,
  onStatusChange,
  onError,
  children,
}: CloakProviderProps) {
  const { sdk, status, error, chainInfo, refresh, isReady } = useCloakSDK({
    provider,
    chainId,
    mockChains,
    onStatusChange,
    onError,
  });

  const value: CloakContextValue = {
    sdk,
    status,
    error,
    chainInfo,
    isReady,
    refresh,
  };

  return (
    <CloakContext.Provider value={value}>
      {children}
    </CloakContext.Provider>
  );
}

export function useCloakContext(): CloakContextValue {
  const context = useContext(CloakContext);
  if (context === undefined) {
    throw new Error("useCloakContext must be used within a CloakProvider");
  }
  return context;
}

// Convenience hook for getting the SDK instance
export function useCloakSDKInstance(): CloakSDK | undefined {
  const { sdk } = useCloakContext();
  return sdk;
}

// Convenience hook for checking if SDK is ready
export function useCloakReady(): boolean {
  const { isReady } = useCloakContext();
  return isReady;
}
