"use client";

import {
  createContext,
  FC,
  ReactNode,
} from "react";
import { useFhevmSDKLoader, FhevmSDKStatus } from "./useFhevmSDKLoader";
import { FhevmInitSDKType, FhevmLoadSDKType } from "./fhevmTypes";

export interface FhevmSDKContextType {
  status: FhevmSDKStatus;
  error: Error | undefined;
}

export function createFhevmSDKProvider(
  loadSDK: FhevmLoadSDKType | undefined,
  initSDK: FhevmInitSDKType | undefined,
  Context: ReturnType<typeof createContext<FhevmSDKContextType | undefined>>
): FC<{ children: ReactNode }> {
  const Provider: FC<{ children: ReactNode }> = ({ children }) => {
    const state = useFhevmSDKLoader(loadSDK, initSDK);
    return <Context.Provider value={state}>{children}</Context.Provider>;
  };
  return Provider;
}
