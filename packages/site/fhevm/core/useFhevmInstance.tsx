"use client";

import { createContext } from "react";
import { fhevmCreateInstance, isFhevmSupported } from "../release/fhevm";
import { FhevmSDKProvider, useFhevmSDK } from "./useFhevmSDK";
import {
  createFhevmInstanceProvider,
  FhevmInstanceContextType,
} from "./createFhevmInstanceProvider";

const FhevmInstanceContext = createContext<
  FhevmInstanceContextType | undefined
>(undefined);

export const { provider: FhevmInstanceProvider, hook: useFhevmInstance } =
  createFhevmInstanceProvider(
    FhevmSDKProvider,
    useFhevmSDK,
    fhevmCreateInstance,
    isFhevmSupported,
    FhevmInstanceContext
  );
