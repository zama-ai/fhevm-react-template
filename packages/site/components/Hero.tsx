"use client";

import Image from "next/image";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { getFHECounterByChainId } from "./FHECounter";
import { useFhevm, fhevmReactConfig } from "@/fhevm-react/useFhevm";
import { createInMemoryStorage } from "@/fhevm/core/FhevmDecryptionSignature";
import { useFhevmDecrypt } from "@/fhevm/hook/useFhemDecrypt";
import { useFhevmEncrypt } from "@/fhevm/hook/useFhemEncrypt";
import { useCallback, useMemo, useRef, useState } from "react";
import { sleep } from "@/fhevm/core/utils";
import { ZeroHash } from "ethers";

export const Hero = () => {
  const { isConnected, chainId: accountChainId } = useAccount();
  const chainId = useChainId();
  const { status: fhevmStatus } = useFhevm();
  const storage = createInMemoryStorage();
  const {
    decryptHandle,
    getResult,
    getStatus: getDecryptStatus,
    canDecrypt,
  } = useFhevmDecrypt({
    storage,
  });
  const { encryptAsync, canEncrypt } = useFhevmEncrypt();
  const [error, setError] = useState<Error | undefined>(undefined);
  const [status, setStatus] = useState<"idle" | "error" | "processing">("idle");
  const [inputValue, setInputValue] = useState<number | undefined>(undefined);
  const publicClient = usePublicClient();

  const networkMismatch = chainId !== accountChainId;
  const fheCounter = useMemo(
    () => getFHECounterByChainId(accountChainId),
    [accountChainId]
  );

  const { data: countHandle, refetch: refetchCountHandle } = useReadContract({
    address: fheCounter.address,
    abi: fheCounter.abi,
    chainId: fheCounter.chainId,
    functionName: "getCount",
    query: {
      enabled: !networkMismatch && fheCounter !== undefined,
    },
  });

  const { writeContractAsync } = useWriteContract();
  const processing = useRef<symbol | undefined>(undefined);
  const canProcess = useMemo<boolean>(
    () =>
      !!fheCounter.address &&
      !processing.current &&
      canEncrypt &&
      status !== "processing",
    [canEncrypt, fheCounter.address, status]
  );

  const canRenderDisplayText = useMemo<boolean>(() => {
    if (!countHandle) return false;
    const result = getResult(countHandle);
    return result !== undefined;
  }, [countHandle, getResult]);

  const displayText = useMemo<string>(() => {
    if (!countHandle) return "XXXX";
    const result = getResult(countHandle);
    return result ? result.toString() : "XXXX";
  }, [countHandle, getResult]);

  const renderSpinner = useMemo<boolean>(() => {
    if (status === "processing") {
      return true;
    }
    if (countHandle === undefined) {
      return false;
    }
    if (getDecryptStatus(countHandle) === "decrypting") {
      return true;
    }
    // Decrypted value available ? display it!
    if (getResult(countHandle) !== undefined) {
      return false;
    }
    return false;
  }, [status, countHandle, getDecryptStatus, getResult]);

  function disableDecrypt(): boolean {
    return (
      !canDecrypt ||
      countHandle === ZeroHash ||
      canRenderDisplayText ||
      renderSpinner
    );
  }

  function getInputPositiveInteger(value: unknown): number | undefined {
    if (!value) return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
    return parsed;
  }

  const incrementOrDecrement = useCallback(
    (count: number, func: "increment" | "decrement") => {
      const contractAddress = fheCounter.address;

      if (processing.current) {
        return;
      }

      if (!contractAddress || !canEncrypt || !publicClient) {
        return;
      }

      const guard = Symbol();
      processing.current = guard;

      setError(undefined);
      setStatus("processing");

      const run = async () => {
        if (processing.current !== guard) {
          return;
        }

        await sleep(200);

        try {
          const enc = await encryptAsync({
            contractAddress: contractAddress,
            values: [{ type: "euint32", value: count }],
          });
          if (!enc) {
            return;
          }

          const tx = await writeContractAsync({
            address: contractAddress,
            abi: fheCounter.abi,
            chainId: fheCounter.chainId,
            functionName: func,
            args: [enc.handles[0], enc.inputProof],
          });

          const receipt = await publicClient.waitForTransactionReceipt({
            hash: tx, // tx is a hash string in viem
            confirmations: 1,
          });

          if (receipt.status === "success") {
            await refetchCountHandle();

            if (processing.current === guard) {
              setError(undefined);
              setStatus("idle");
            }
          } else {
            if (processing.current === guard) {
              setError(new Error(`Transaction tx:${tx} reverted`));
              setStatus("error");
            }
          }
        } catch (e) {
          if (processing.current === guard) {
            setError(e instanceof Error ? e : new Error("Increment failed!"));
            setStatus("error");
          }
        } finally {
          if (processing.current === guard) {
            processing.current = undefined;
          }
        }
      };

      run();
    },
    [
      writeContractAsync,
      encryptAsync,
      canEncrypt,
      fheCounter,
      refetchCountHandle,
      publicClient,
    ]
  );

  if (!isConnected) {
    return (
      <section className="relative mx-auto mt-28">
        <h1 className="text-7xl text-zinc-100 font-bold">Welcome</h1>
        <p>FHEVM Status: {fhevmStatus}</p>
        <p className="text-white opacity-70 text-center text-lg">
          to the <strong>MetaMask SDK</strong> quick start app!
          <br /> Connect your wallet to get started.
        </p>
        <Image
          src="/arrow.svg"
          alt="Arrow pointing to the connect wallet button"
          className="absolute hidden md:block md:bottom-5 md:-right-48"
          width={150}
          height={150}
        />
      </section>
    );
  }

  if (networkMismatch) {
    return (
      <section className="relative mx-auto mt-28">
        <p>FHEVM Status: {fhevmStatus}</p>
        NETWORK MISMATCH wagmi-chainId={chainId ?? "<undefined>"}{" "}
        metamask-chainId={accountChainId ?? "<undefined>"}
      </section>
    );
  }

  if (!fheCounter?.address) {
    return (
      <section className="relative mx-auto mt-28">
        <p>FHEVM Status: {fhevmStatus}</p>
        No FHECounter deployed on accountChainId:
        {accountChainId ?? "<undefined>"}
      </section>
    );
  }

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full">
        <div className="flex justify-center items-center h-[185px]">
          {renderSpinner ? (
            Spinner()
          ) : (
            <p className="font-semibold text-[120px] text-center h-[185px]">
              {displayText}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mx-auto">
        <div className="col-span-full mb-4">
          <p className="text-xs">FHEVM Handle:</p>
          <p className="font-mono font-semibold text-xs">{countHandle}</p>
        </div>
        <div className="col-span-full">
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Enter a positive integer"
            className="p-8 text-center text-4xl border border-2 border-gray-400 bg-white text-black rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
            disabled={!canProcess}
            onChange={(e) =>
              setInputValue(getInputPositiveInteger(e.target.value))
            }
          />
        </div>
        <button
          className="bg-black text-white p-4 rounded font-semibold min-w-[200px] disabled:text-opacity-40 disabled:bg-opacity-40"
          disabled={!canProcess || inputValue === undefined}
          onClick={() => {
            if (inputValue) incrementOrDecrement(inputValue, "increment");
          }}
        >
          Increment (+)
        </button>
        <button
          className="bg-black text-white p-2 rounded font-semibold min-w-[200px] disabled:text-opacity-40 disabled:bg-opacity-40"
          disabled={!canProcess || inputValue === undefined}
          onClick={() => {
            if (inputValue) incrementOrDecrement(inputValue, "decrement");
          }}
        >
          Decrement (-)
        </button>
        <button
          className="bg-black text-white p-2 rounded font-semibold min-w-[200px] disabled:text-opacity-40 disabled:bg-opacity-40"
          disabled={disableDecrypt()}
          onClick={() =>
            decryptHandle({
              handles: [
                { handle: countHandle!, contractAddress: fheCounter.address! },
              ],
            })
          }
        >
          Decrypt
        </button>
        <div className="col-span-full mt-4">
          <p className="text-xs text-gray-500">Contract address:</p>
          <p className="font-mono font-semibold text-xs text-gray-500">
            {fheCounter.address}
          </p>
        </div>
      </div>
      <div className="col-span-full mx-20 mt-4 p-5 rounded-lg bg-white border-2 border-gray-400 bg-opacity-50">
        <p className="font-semibold text-gray-600 text-sm">Debug Infos</p>
        {printProperty("Account ChainId", accountChainId.toString())}
        {printProperty("ChainId", chainId.toString())}
        {printProperty("Connected", isConnected)}
        {printProperty("Status", status)}
        {printProperty("Can Encrypt", canEncrypt)}
        {printProperty("Can Process", canProcess)}
        {printProperty("Input Integer", inputValue)}
        {printProperty(
          "Result",
          countHandle
            ? (getResult(countHandle) ?? "<not yet computed>")
            : "<undefined>"
        )}
        {printProperty(
          "Decrypt Status",
          countHandle ? getDecryptStatus(countHandle) : "<undefined>"
        )}
        {printProperty("Render Spinner", renderSpinner)}
        {printProperty("FHEVM Build", fhevmReactConfig.build)}
        {printProperty("Error", error?.message)}
      </div>
    </div>
  );
};

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    displayValue = value ? "true" : "false";
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <p className="text-xs text-gray-500">
      {name}:{" "}
      <span className="font-mono font-semibold text-xs text-gray-500">
        {displayValue}
      </span>
    </p>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin text-black h-[120px] w-[120px]"
      viewBox="0 0 50 50"
      fill="none"
    >
      <circle
        className="opacity-100"
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="120"
        strokeDashoffset="30"
      />
    </svg>
  );
}
