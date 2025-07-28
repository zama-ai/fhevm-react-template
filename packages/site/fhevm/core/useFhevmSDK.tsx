"use client";

import { createContext, useContext } from "react";
import { createFhevmSDKProvider, FhevmSDKContextType } from "./createFhevmSDKProvider";
import { fhevmLoadSDK, fhevmInitSDK } from "../release/fhevm";

const FhevmSDKContext = createContext<FhevmSDKContextType | undefined>(undefined);
export const FhevmSDKProvider = createFhevmSDKProvider(
  fhevmLoadSDK,
  fhevmInitSDK,
  FhevmSDKContext
);

export function useFhevmSDK() {
  const context = useContext(FhevmSDKContext);
  if (context === undefined) {
    throw new Error("useFhevmSDK must be used within a FhevmSDKProvider");
  }
  return context;
}
