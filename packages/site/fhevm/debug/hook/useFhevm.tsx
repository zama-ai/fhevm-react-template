"use client";

import React, { ReactNode, useMemo } from "react";
import {
  FhevmMockInstanceProvider,
  useFhevmMockInstance,
} from "./useFhevmMockInstance";
import {
  FhevmInstanceProvider,
  useFhevmInstance,
} from "../../core/useFhevmInstance";
import { FhevmInstanceContextType } from "../../core/createFhevmInstanceProvider";
import { useAccount } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/fhevm/core/constants";
import { HARDHAT_NODE_CHAIN_ID } from "../constants";
import { fhevmReactConfig } from "./fhevmReactConfig";

export function FhevmProvider({ children }: { children: ReactNode }) {
  return (
    <FhevmInstanceProvider>
      <FhevmMockInstanceProvider>{children}</FhevmMockInstanceProvider>
    </FhevmInstanceProvider>
  );
}

export function useFhevm(): FhevmInstanceContextType {
  const { chainId } = useAccount();
  const real = useFhevmInstance();
  const mock = useFhevmMockInstance();

  return useMemo(() => {
    if (chainId === SEPOLIA_CHAIN_ID) return real;
    if (chainId === HARDHAT_NODE_CHAIN_ID) return mock;

    return {
      status: "none",
      error: new Error(`Unsupported chainId: ${chainId}`),
      instance: undefined,
      chainId: undefined
    };
  }, [chainId, real, mock]);
}

export { fhevmReactConfig }