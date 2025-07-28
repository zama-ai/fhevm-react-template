"use client";

import { createContext, useContext } from "react";
import { createFhevmSDKProvider, FhevmSDKContextType } from "../../core/createFhevmSDKProvider";
import { fhevmMockLoadSDK, fhevmMockInitSDK } from "../fhevm";

// This part should not exist in Release compilation
const FhevmMockSDKContext = createContext<FhevmSDKContextType | undefined>(undefined);
export const FhevmMockSDKProvider = createFhevmSDKProvider(
  fhevmMockLoadSDK,
  fhevmMockInitSDK,
  FhevmMockSDKContext
);

export function useFhevmMockSDK() {
  const context = useContext(FhevmMockSDKContext);
  if (context === undefined) {
    throw new Error("useFhevmMockSDK must be used within a FhevmMockSDKProvider");
  }
  return context;
}
