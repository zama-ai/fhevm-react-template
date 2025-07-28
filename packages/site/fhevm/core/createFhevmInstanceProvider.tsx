"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FC,
} from "react";
import { useAccount } from "wagmi";
import {
  FhevmCreateInstanceType,
  FhevmInstance,
  IsFhevmSupportedType,
} from "./fhevmTypes";
import { FhevmSDKStatus } from "./useFhevmSDKLoader";

export type FhevmInstanceStatus = "none" | "creating" | "ready" | "error";

export interface FhevmInstanceContextType {
  status: FhevmInstanceStatus;
  error: Error | undefined;
  instance: FhevmInstance | undefined;
  chainId: number | undefined;
}

export function createFhevmInstanceProvider(
  FhevmSDKProvider: FC<{ children: ReactNode }>,
  useFhevmSDK: () => { status: FhevmSDKStatus; error: Error | undefined },
  fhevmCreateInstanceFunc: FhevmCreateInstanceType | undefined,
  isFhevmSupportedFunc: IsFhevmSupportedType,
  Context: ReturnType<
    typeof createContext<FhevmInstanceContextType | undefined>
  >
): {
  provider: FC<{ children: ReactNode }>;
  hook: () => FhevmInstanceContextType;
} {
  const FhevmInstanceInnerProvider: FC<{ children: ReactNode }> = ({
    children,
  }) => {
    const [status, setStatus] = useState<FhevmInstanceStatus>("none");
    const [error, setError] = useState<Error | undefined>(undefined);
    const [instance, setInstance] = useState<FhevmInstance | undefined>();
    const [chainId, setChainId] = useState<number | undefined>();
    const { status: sdkStatus, error: sdkError } = useFhevmSDK();
    const { isConnected, chainId: accountChaintId } = useAccount();
    const activeLoadId = useRef(0);

    function forwardError(error: unknown) {
      setInstance(undefined);
      setStatus("error");
      setError(error instanceof Error ? error : new Error(String(error)));
    }

    function resetInstanceState(s: "none" | "creating") {
      setInstance(undefined);
      setStatus(s);
      setError(undefined);
    }

    useEffect(() => {
      const thisLoadId = ++activeLoadId.current;

      if (sdkStatus === "error") {
        forwardError(sdkError);
        return;
      }

      if (
        sdkStatus !== "initialized" ||
        !isConnected ||
        accountChaintId === undefined ||
        !isFhevmSupportedFunc(accountChaintId)
      ) {
        resetInstanceState("none");
        return;
      }

      const run = async () => {
        try {
          if (thisLoadId !== activeLoadId.current) return;
          resetInstanceState("creating");

          const ins = await fhevmCreateInstanceFunc!();
          if (thisLoadId !== activeLoadId.current) return;

          setInstance(ins);
          setChainId(accountChaintId);
          setStatus("ready");
        } catch (error) {
          if (thisLoadId !== activeLoadId.current) return;
          forwardError(error);
        }
      };

      run();

      return () => {
        activeLoadId.current = thisLoadId + 1;
        //resetInstanceState("none") ?
        setInstance(undefined);
      };
    }, [sdkStatus, sdkError, accountChaintId, isConnected]);

    return (
      <Context.Provider value={{ status, error, instance, chainId }}>
        {children}
      </Context.Provider>
    );
  };

  const InstanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
      <FhevmSDKProvider>
        <FhevmInstanceInnerProvider>{children}</FhevmInstanceInnerProvider>
      </FhevmSDKProvider>
    );
  };

  const useInstanceHook = () => {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error(
        "FHEVM instance context must be used within its provider"
      );
    }
    return ctx;
  };

  return { provider: InstanceProvider, hook: useInstanceHook };
}
