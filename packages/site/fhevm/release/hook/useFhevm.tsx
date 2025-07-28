"use client";

import React, { ReactNode, useMemo } from "react";
import {
  FhevmInstanceProvider,
  useFhevmInstance,
} from "../../core/useFhevmInstance";
import { FhevmInstanceContextType } from "../../core/createFhevmInstanceProvider";
import { useAccount } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/fhevm/core/constants";
import { fhevmReactConfig } from "./fhevmReactConfig";

export function FhevmProvider({ children }: { children: ReactNode }) {
  return (
      <FhevmInstanceProvider>{children}</FhevmInstanceProvider>
  );
}

export function useFhevm(): FhevmInstanceContextType {
  const { chainId } = useAccount();
  const real = useFhevmInstance();

  return useMemo(() => {
    if (chainId === SEPOLIA_CHAIN_ID) return real;

    return {
      status: "none",
      error: new Error(`Unsupported chainId: ${chainId}`),
      instance: undefined,
      chainId: undefined
    };
  }, [chainId, real]);
}

export { fhevmReactConfig }