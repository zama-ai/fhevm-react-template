"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useAllow, useEncrypt, useIsAllowed, useUserDecrypt } from "@zama-fhe/react-sdk";
import { ZERO_HANDLE, ZamaSDKEvents } from "@zama-fhe/sdk";
import { bytesToHex } from "viem";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import type { Contract } from "~~/utils/helper/contract";
import type { AllowedChainIds } from "~~/utils/helper/networks";

/**
 * useFHECounterWagmi - FHE Counter hook using @zama-fhe/react-sdk v2 + wagmi
 *
 * What it does:
 * - Reads the current encrypted counter via wagmi's useReadContract
 * - Decrypts the handle on-demand using useUserDecrypt (query-based: handles keypair + EIP-712 + signing internally)
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

  useEffect(() => {
    const ctrl = new AbortController();
    const { CredentialsCached, DecryptEnd } = ZamaSDKEvents;
    window.addEventListener(CredentialsCached, () => setMessage("Credentials ready, decrypting..."), {
      signal: ctrl.signal,
    });
    window.addEventListener(DecryptEnd, () => setMessage("Decryption complete!"), {
      signal: ctrl.signal,
    });
    return () => ctrl.abort();
  }, []);

  // Build handles array for decryption query (query-based, fires automatically when enabled)
  const decryptHandles = useMemo(() => {
    if (!countHandle || countHandle === ZERO_HANDLE || !fheCounter?.address) return [];
    return [{ handle: countHandle as `0x${string}`, contractAddress: fheCounter.address as `0x${string}` }];
  }, [countHandle, fheCounter?.address]);

  // Authorization: useAllow acquires FHE keypair + EIP-712 signature, useIsAllowed gates decryption
  const { mutate: allow, isPending: isAllowing } = useAllow();
  const contractAddr = (fheCounter?.address ?? "0x0") as `0x${string}`;
  const { data: isAllowed } = useIsAllowed({ contractAddresses: [contractAddr] });

  // Whether the user has requested decryption
  const [decryptEnabled, setDecryptEnabled] = useState(false);

  // Decryption hook - query-based: fires when authorized and handles are provided
  const decrypt = useUserDecrypt({ handles: decryptHandles }, { enabled: decryptEnabled && !!isAllowed });

  // Extract decrypted value from query result
  const cachedDecryptedValue = useMemo(() => {
    if (!countHandle || !decrypt.data) return undefined;
    return decrypt.data[countHandle as `0x${string}`];
  }, [countHandle, decrypt.data]);

  // Derived state
  const isDecrypted = cachedDecryptedValue !== undefined;
  const isDecrypting = decrypt.isFetching;
  const clearCount = useMemo(() => {
    if (!countHandle) return undefined;
    if (countHandle === ZERO_HANDLE) return BigInt(0);
    return cachedDecryptedValue;
  }, [countHandle, cachedDecryptedValue]);

  const canDecrypt = Boolean(
    hasContract &&
      isConnected &&
      address &&
      countHandle &&
      countHandle !== ZERO_HANDLE &&
      !isDecrypted &&
      !isDecrypting &&
      !isAllowing,
  );

  const canUpdateCounter = Boolean(hasContract && isConnected && address && !isProcessing);

  // Decrypt the current count handle: authorize if needed, then enable the query
  const decryptCountHandle = useCallback(async () => {
    if (!canDecrypt || !countHandle || !fheCounter?.address) return;
    setDecryptEnabled(true);
    if (!isAllowed) {
      setMessage("Authorizing decryption...");
      allow([fheCounter.address as `0x${string}`]);
      return;
    }
    setMessage("Starting decryption...");
  }, [canDecrypt, countHandle, fheCounter?.address, isAllowed, allow]);

  // Report decryption errors
  useEffect(() => {
    if (decrypt.error) {
      setMessage(`Decryption failed: ${decrypt.error.message}`);
    }
  }, [decrypt.error]);

  // Mutations (increment/decrement)
  const updateCounter = useCallback(
    async (value: number) => {
      if (isProcessing || !canUpdateCounter || value === 0 || !fheCounter?.address || !address) return;
      const op = value > 0 ? "increment" : "decrement";
      const valueAbs = Math.abs(value);
      setIsProcessing(true);
      setMessage(`Starting ${op}(${valueAbs})...`);
      try {
        // Encrypt the value with FHE type annotation
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
          args: [bytesToHex(enc.handles[0]!), bytesToHex(enc.inputProof)],
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
