"use client";

import { useEffect, useMemo } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { displayTxResult } from "./utilsDisplay";
import { useFhevm } from "@fhevm-sdk";
import { useFHEDecrypt } from "@fhevm-sdk";
import { useInMemoryStorage } from "@fhevm-sdk";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAnimationConfig } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useWagmiEthers } from "~~/hooks/wagmi/useWagmiEthers";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type DisplayVariableProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  refreshDisplayVariables: boolean;
  inheritedFrom?: string;
  abi: Abi;
};

export const DisplayVariable = ({
  contractAddress,
  abiFunction,
  refreshDisplayVariables,
  abi,
  inheritedFrom,
}: DisplayVariableProps) => {
  const { targetNetwork } = useTargetNetwork();

  const {
    data: result,
    isFetching,
    refetch,
    error,
  } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    chainId: targetNetwork.id,
    query: {
      retry: false,
    },
  });

  const { showAnimation } = useAnimationConfig(result);

  // FHE decrypt support (only shown for hex string handles)
  const { ethersSigner, chainId } = useWagmiEthers();
  const { storage } = useInMemoryStorage();
  const { instance } = useFhevm({
    provider: typeof window !== "undefined" ? (window as any).ethereum : undefined,
    chainId,
  });

  const resultIsHandle = typeof result === "string" && result.startsWith("0x") && result.length === 66;
  const requests = useMemo(() => {
    if (!resultIsHandle) return undefined;
    return [{ handle: result as string, contractAddress: contractAddress as `0x${string}` }] as const;
  }, [resultIsHandle, result, contractAddress]);

  const { canDecrypt, decrypt, isDecrypting, message, results } = useFHEDecrypt({
    instance,
    ethersSigner,
    fhevmDecryptionSignatureStorage: storage,
    chainId,
    requests,
  });
  const clearValue = resultIsHandle ? results[result as string] : undefined;

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error);
      notification.error(parsedError);
    }
  }, [error]);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center">
        <h3 className="font-medium text-lg mb-0 break-all">{abiFunction.name}</h3>
        <button className="btn btn-ghost btn-xs" onClick={async () => await refetch()}>
          {isFetching ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
          )}
        </button>
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </div>
      <div className="text-base-content/80 flex flex-col items-start">
        <div>
          <div
            className={`break-all block transition bg-transparent ${
              showAnimation ? "bg-warning rounded-xs animate-pulse-fast" : ""
            }`}
          >
            {displayTxResult(result)}
          </div>
          {resultIsHandle && (
            <div className="mt-2 flex items-center gap-2">
              <button
                className="btn btn-secondary btn-xs"
                disabled={!canDecrypt || isDecrypting}
                onClick={() => decrypt()}
              >
                {isDecrypting ? "Decrypting..." : "Decrypt"}
              </button>
              {typeof clearValue !== "undefined" && (
                <span className="text-sm text-base-content/70">Clear: {String(clearValue)}</span>
              )}
              {message && <span className="text-xs text-base-content/60">{message}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
