"use client";

import { createContext } from "react";
import { fhevmMockCreateInstance, isFhevmMockSupported } from "../fhevm";
import { FhevmMockSDKProvider, useFhevmMockSDK } from "./useFhevmMockSDK";
import {
  createFhevmInstanceProvider,
  FhevmInstanceContextType,
} from "../../core/createFhevmInstanceProvider";

const FhevmMockInstanceContext = createContext<
  FhevmInstanceContextType | undefined
>(undefined);

export const { provider: FhevmMockInstanceProvider, hook: useFhevmMockInstance } =
  createFhevmInstanceProvider(
    FhevmMockSDKProvider,
    useFhevmMockSDK,
    fhevmMockCreateInstance,
    isFhevmMockSupported,
    FhevmMockInstanceContext
  );
