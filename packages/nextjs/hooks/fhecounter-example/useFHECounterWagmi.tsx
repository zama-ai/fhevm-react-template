"use client";

import { useCallback, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useEncrypt, useUserDecrypt, useUserDecryptedValue } from "@zama-fhe/react-sdk";
import { toHex } from "viem";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import type { Contract } from "~~/utils/helper/contract";
import type { AllowedChainIds } from "~~/utils/helper/networks";

const ZERO_HANDLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * useFHECounterWagmi - FHE Counter hook using @zama-fhe/react-sdk v2 + wagmi
 *
 * What it does:
 * - Reads the current encrypted counter via wagmi's useReadContract
 * - Decrypts the handle on-demand using useUserDecrypt (v2 handles keypair + EIP-712 + signing internally)
 * - Encrypts inputs with useEncrypt and writes increment/decrement via useWriteContract
 */
export const useFHECounterWagmi = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Resolve deployed contract info once we know the chain
  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: fheCounter } = useDeployedContractInfo({ contractName: "FHECounter", chainId: allowedChainId });

  type FHECounterInfo = Contract<"FHECounter"> & { chainId?: number };

  // Simple status string for UX messages
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Helpers
  const hasContract = Boolean(fheCounter?.address && fheCounter?.abi);

  // Read count handle via wagmi
  const readResult = useReadContract({
    address: hasContract ? (fheCounter!.address as `0x${string}`) : undefined,
    abi: hasContract ? ((fheCounter as FHECounterInfo).abi as any) : undefined,
    functionName: "getCount" as const,
    query: {
      enabled: Boolean(hasContract && isConnected),
      refetchOnWindowFocus: false,
    },
  });

  const countHandle = useMemo(() => (readResult.data as string | undefined) ?? undefined, [readResult.data]);
  const canGetCount = Boolean(hasContract && isConnected && !readResult.isFetching);
  const refreshCountHandle = useCallback(async () => {
    const res = await readResult.refetch();
    if (res.error) setMessage("FHECounter.getCount() failed: " + (res.error as Error).message);
  }, [readResult]);

  // Encryption hook
  const encrypt = useEncrypt();

  // Contract write hook
  const { writeContractAsync } = useWriteContract();

  // Decryption hook - v2 handles keypair generation, EIP-712, and signing internally
  const decrypt = useUserDecrypt({
    onCredentialsReady: () => setMessage("Credentials ready, decrypting..."),
    onDecrypted: () => setMessage("Decryption complete!"),
  });

  // Read decrypted value from cache
  const { data: cachedDecryptedValue } = useUserDecryptedValue(countHandle as `0x${string}` | undefined);

  // Derived state
  const isDecrypted = cachedDecryptedValue !== undefined;
  const isDecrypting = decrypt.isPending;
  const clearCount = useMemo(() => {
    if (!countHandle) return undefined;
    if (countHandle === ZERO_HANDLE) return BigInt(0);
    return cachedDecryptedValue;
  }, [countHandle, cachedDecryptedValue]);

  const canDecrypt = Boolean(
    hasContract && isConnected && address && countHandle && countHandle !== ZERO_HANDLE && !isDecrypted && !isDecrypting,
  );

  const canUpdateCounter = Boolean(hasContract && isConnected && address && !isProcessing);

  // Decrypt the current count handle
  const decryptCountHandle = useCallback(async () => {
    if (!canDecrypt || !countHandle || !fheCounter?.address) return;
    setMessage("Starting decryption...");

    try {
      await decrypt.mutateAsync({
        handles: [{ handle: countHandle as `0x${string}`, contractAddress: fheCounter.address }],
      });
    } catch (e) {
      setMessage(`Decryption failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [canDecrypt, countHandle, fheCounter?.address, decrypt]);

  // Mutations (increment/decrement)
  const updateCounter = useCallback(
    async (value: number) => {
      if (isProcessing || !canUpdateCounter || value === 0 || !fheCounter?.address || !address) return;
      const op = value > 0 ? "increment" : "decrement";
      const valueAbs = Math.abs(value);
      setIsProcessing(true);
      setMessage(`Starting ${op}(${valueAbs})...`);
      try {
        // Encrypt the value with FHE type annotation (v2 API)
        setMessage("Encrypting value...");
        const enc = await encrypt.mutateAsync({
          values: [{ value: BigInt(valueAbs), type: "euint32" }],
          contractAddress: fheCounter.address,
          userAddress: address,
        });

        // Write to contract using wagmi
        // FHE operations are gas-intensive; cap below Sepolia's block gas limit (16,777,216)
        setMessage("Sending transaction...");
        await writeContractAsync({
          address: fheCounter.address as `0x${string}`,
          abi: (fheCounter as FHECounterInfo).abi as any,
          functionName: op,
          args: [toHex(enc.handles[0]), toHex(enc.inputProof)],
          gas: 15_000_000n,
        });

        setMessage(`${op}(${valueAbs}) completed!`);
        refreshCountHandle();
      } catch (e) {
        setMessage(`${op} failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, canUpdateCounter, fheCounter, address, encrypt, writeContractAsync, refreshCountHandle],
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
    clear: clearCount,
    handle: countHandle,
    isDecrypting,
    isRefreshing: readResult.isFetching,
    isProcessing,
  };
};
