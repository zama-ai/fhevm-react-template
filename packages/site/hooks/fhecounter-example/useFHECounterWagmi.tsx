"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDeployedContractInfo } from "../scaffold-eth";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { FhevmInstance } from "@fhevm-sdk";
import {
  buildParamsFromAbi,
  getEncryptionMethod,
  useFHEDecrypt,
  useFHEEncryption,
  useInMemoryStorage,
} from "@fhevm-sdk";
import { ethers } from "ethers";
import type { Contract } from "~~/utils/scaffold-eth/contract";
import type { AllowedChainIds } from "~~/utils/scaffold-eth/networks";

export const useFHECounterWagmi = (parameters: {
  instance: FhevmInstance | undefined;
  initialMockChains?: Readonly<Record<number, string>>;
}) => {
  const { instance, initialMockChains } = parameters;
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  // Wagmi + ethers interop
  const { chainId, accounts, isConnected, ethersReadonlyProvider, ethersSigner } = useWagmiEthers(initialMockChains);

  // Narrow chainId to AllowedChainIds when present
  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: fheCounter } = useDeployedContractInfo({ contractName: "FHECounter", chainId: allowedChainId });

  // Message bus shared by sub-hooks
  const [message, setMessage] = useState<string>("");

  // Local types/state/refs
  type FHECounterInfo = Contract<"FHECounter"> & { chainId?: number };
  const fheCounterRef = useRef<FHECounterInfo | undefined>(undefined);
  const providerRef = useRef<typeof ethersReadonlyProvider>(ethersReadonlyProvider);
  const addressRef = useRef<string | undefined>(fheCounter?.address);
  const chainIdRef = useRef<number | undefined>(chainId);
  const lastRefreshRef = useRef<number>(0);
  const MIN_REFRESH_MS = 100; // limit refresh to once every 0.1s

  const [countHandle, setCountHandle] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // keep refs in sync
  useEffect(() => {
    providerRef.current = ethersReadonlyProvider;
  }, [ethersReadonlyProvider]);

  useEffect(() => {
    chainIdRef.current = chainId;
  }, [chainId]);

  useEffect(() => {
    if (!fheCounter) return;
    fheCounterRef.current = fheCounter as FHECounterInfo;
    addressRef.current = fheCounter.address;
  }, [fheCounter]);

  // Read count handle
  const canGetCount = useMemo(
    () => Boolean(fheCounter?.address && ethersReadonlyProvider && !isRefreshing),
    [fheCounter?.address, ethersReadonlyProvider, isRefreshing],
  );

  const refreshCountHandle = useCallback(() => {
    if (isRefreshing) return;

    const now = Date.now();
    if (now - lastRefreshRef.current < MIN_REFRESH_MS) return;
    lastRefreshRef.current = now;
    const currentProvider = providerRef.current;
    const currentAddress = addressRef.current;
    const currentChainId = chainIdRef.current;
    if (!fheCounterRef.current || !currentAddress || !currentChainId || !currentProvider) return;

    setIsRefreshing(true);
    const thisAddress = currentAddress;
    const thisChainId = currentChainId;
    const contract = new ethers.Contract(thisAddress, fheCounterRef.current.abi, currentProvider);
    contract
      .getCount()
      .then((value: string) => {
        if (thisChainId === chainIdRef.current && thisAddress === addressRef.current) setCountHandle(value);
      })
      .catch(e => setMessage("FHECounter.getCount() failed: " + (e instanceof Error ? e.message : String(e))))
      .finally(() => setIsRefreshing(false));
  }, [isRefreshing]);

  useEffect(() => {
    if (!fheCounter?.address || !ethersReadonlyProvider) return;
    const t = window.setTimeout(() => refreshCountHandle(), 300);
    return () => window.clearTimeout(t);
  }, [fheCounter?.address, ethersReadonlyProvider, chainId, refreshCountHandle]);

  // Decrypt (reuse existing decrypt hook for simplicity)
  const requests = useMemo(() => {
    if (!fheCounter?.address || !countHandle || countHandle === ethers.ZeroHash) return undefined;
    return [{ handle: countHandle, contractAddress: fheCounter.address } as const];
  }, [fheCounter?.address, countHandle]);

  const {
    canDecrypt,
    decrypt,
    isDecrypting,
    message: decMsg,
    results,
  } = useFHEDecrypt({
    instance,
    ethersSigner,
    fhevmDecryptionSignatureStorage,
    chainId,
    requests,
  });

  useEffect(() => {
    if (decMsg) setMessage(decMsg);
  }, [decMsg]);

  const clearCount = useMemo(() => {
    if (!countHandle) return undefined;
    if (countHandle === ethers.ZeroHash) return { handle: countHandle, clear: BigInt(0) } as const;
    const clear = results[countHandle];
    if (typeof clear === "undefined") return undefined;
    return { handle: countHandle, clear } as const;
  }, [countHandle, results]);

  const isDecrypted = Boolean(countHandle && clearCount?.handle === countHandle);
  const decryptCountHandle = decrypt;

  // Mutations (increment/decrement)
  const { encryptWith } = useFHEEncryption({ instance, ethersSigner, contractAddress: fheCounter?.address });
  const canUpdateCounter = useMemo(
    () => Boolean(fheCounter?.address && instance && ethersSigner && !isProcessing),
    [fheCounter?.address, instance, ethersSigner, isProcessing],
  );

  const updateCounter = useCallback(
    async (value: number) => {
      if (isProcessing || !canUpdateCounter || value === 0) return;
      const op = value > 0 ? "increment" : "decrement";
      const valueAbs = Math.abs(value);
      setIsProcessing(true);
      setMessage(`Starting ${op}(${valueAbs})...`);
      try {
        const functionName = op;
        const functionAbi = fheCounter?.abi.find(item => item.type === "function" && item.name === functionName);
        if (!functionAbi) return setMessage(`Function ABI not found for ${functionName}`);
        if (!functionAbi.inputs || functionAbi.inputs.length === 0)
          return setMessage(`No inputs found for ${functionName}`);
        const firstInput = functionAbi.inputs[0]!;
        const method = getEncryptionMethod(firstInput.internalType);
        setMessage(`Encrypting with ${method}...`);
        const enc = await encryptWith(builder => {
          (builder as any)[method](valueAbs);
        });
        if (!enc) return setMessage("Encryption failed");

        if (!fheCounter?.address || !ethersSigner) return setMessage("Contract info or signer not available");
        const contract = new ethers.Contract(fheCounter.address, fheCounter.abi, ethersSigner);
        const params = buildParamsFromAbi(enc, [...fheCounter.abi] as any[], functionName);
        const tx = await (op === "increment" ? contract.increment(...params) : contract.decrement(...params));
        setMessage("Waiting for transaction...");
        await tx.wait();
        setMessage(`${op}(${valueAbs}) completed!`);
        refreshCountHandle();
      } catch (e) {
        setMessage(`${op} failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      canUpdateCounter,
      fheCounter?.address,
      fheCounter?.abi,
      ethersSigner,
      encryptWith,
      refreshCountHandle,
    ],
  );

  return {
    contractAddress: fheCounter?.address,
    canDecrypt,
    canGetCount,
    canUpdateCounter,
    updateCounter,
    decryptCountHandle,
    refreshCountHandle,
    isDecrypted,
    message,
    clear: clearCount?.clear,
    handle: countHandle,
    isDecrypting,
    isRefreshing,
    isProcessing,
    // Wagmi-specific values
    chainId,
    accounts,
    isConnected,
    ethersSigner,
  };
};
