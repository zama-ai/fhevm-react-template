"use client";

import { useEffect, useRef, useState } from "react";
import { FhevmInitSDKType, FhevmLoadSDKType } from "./fhevmTypes";

export type FhevmSDKStatus =
  | "unloaded"
  | "loading"
  | "initializing"
  | "initialized"
  | "error";

export interface FhevmSDKState {
  status: FhevmSDKStatus;
  error: Error | undefined;
}

// Abstract SDK Loader. 
// At startup both the real relayer SDK and optionally the debug Hardhat relayer SDK are loaded
// TODO: add argument: name the sdk.
export function useFhevmSDKLoader(
  loadSDK: FhevmLoadSDKType | undefined,
  initSDK: FhevmInitSDKType | undefined
): FhevmSDKState {
  const [status, setStatus] = useState<FhevmSDKStatus>("unloaded");
  const [error, setError] = useState<Error | undefined>(undefined);
  const activeLoadId = useRef(0);

  useEffect(() => {
    const thisLoadId = ++activeLoadId.current;

    const run = async () => {
      try {
        if (thisLoadId !== activeLoadId.current) return;

        setError(undefined);
        setStatus("loading");

        if (loadSDK) {
          await loadSDK();
          if (thisLoadId !== activeLoadId.current) return;
        }

        setStatus("initializing");

        if (initSDK) {
          await initSDK();
          if (thisLoadId !== activeLoadId.current) return;
        }

        setStatus("initialized");
      } catch (e) {
        if (thisLoadId !== activeLoadId.current) return;

        setStatus("error");
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    };

    run();

    return () => {
      // Defensive: cancel any in-progress instance creation
      activeLoadId.current = thisLoadId + 1;
      setStatus("unloaded");
    };
  }, [loadSDK, initSDK]);

  return { status, error };
}
