"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAllow, useEncrypt, useIsAllowed, useUserDecrypt } from "@zama-fhe/react-sdk";
import { ZERO_HANDLE, ZamaSDKEvents } from "@zama-fhe/sdk";
import { bytesToHex } from "viem";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { FHECounter } from "~~/contracts/FHECounter";
import { deploymentFor } from "~~/utils/contract";

/**
 * FHE Counter hook using @zama-fhe/react-sdk v3 + wagmi.
 *
 * - Reads the encrypted counter via wagmi's useReadContract.
 * - Decrypts the handle on-demand via useUserDecrypt (query-based — handles
 *   keypair generation, EIP-712 signing, and caching internally).
 * - Encrypts inputs via useEncrypt and writes increment/decrement via
 *   useWriteContract.
 */
export const useFHECounterWagmi = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const fheCounter = useMemo(() => deploymentFor(FHECounter, chainId), [chainId]);

  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const hasContract = Boolean(fheCounter?.address && fheCounter?.abi);

  const readResult = useReadContract({
    address: hasContract ? fheCounter!.address : undefined,
    abi: hasContract ? fheCounter!.abi : undefined,
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

  const encrypt = useEncrypt();
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

  // Handles array for the user-decrypt query (fires automatically once enabled).
  const decryptHandles = useMemo(() => {
    if (!countHandle || countHandle === ZERO_HANDLE || !fheCounter?.address) return [];
    return [
      {
        handle: countHandle as `0x${string}`,
        contractAddress: fheCounter.address,
      },
    ];
  }, [countHandle, fheCounter?.address]);

  // Authorization: useAllow acquires FHE keypair + EIP-712 signature; useIsAllowed
  // gates whether a user-decrypt call would succeed.
  const { mutate: allow, isPending: isAllowing } = useAllow();
  const contractAddr = (fheCounter?.address ?? "0x0") as `0x${string}`;
  const { data: isAllowed } = useIsAllowed({ contractAddresses: [contractAddr] });

  const [decryptEnabled, setDecryptEnabled] = useState(false);

  const decrypt = useUserDecrypt({ handles: decryptHandles }, { enabled: decryptEnabled && !!isAllowed });

  const cachedDecryptedValue = useMemo(() => {
    if (!countHandle || !decrypt.data) return undefined;
    return decrypt.data[countHandle as `0x${string}`];
  }, [countHandle, decrypt.data]);

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

  const decryptCountHandle = useCallback(async () => {
    if (!canDecrypt || !countHandle || !fheCounter?.address) return;
    setDecryptEnabled(true);
    if (!isAllowed) {
      setMessage("Authorizing decryption...");
      allow([fheCounter.address]);
      return;
    }
    setMessage("Starting decryption...");
  }, [canDecrypt, countHandle, fheCounter?.address, isAllowed, allow]);

  useEffect(() => {
    if (decrypt.error) {
      setMessage(`Decryption failed: ${decrypt.error.message}`);
    }
  }, [decrypt.error]);

  const updateCounter = useCallback(
    async (value: number) => {
      if (isProcessing || !canUpdateCounter || value === 0 || !fheCounter?.address || !address) return;
      const op = value > 0 ? "increment" : "decrement";
      const valueAbs = Math.abs(value);
      setIsProcessing(true);
      setMessage(`Starting ${op}(${valueAbs})...`);
      try {
        setMessage("Encrypting value...");
        const enc = await encrypt.mutateAsync({
          values: [{ value: BigInt(valueAbs), type: "euint32" }],
          contractAddress: fheCounter.address,
          userAddress: address,
        });

        // FHE operations are gas-intensive; cap below Sepolia's block gas limit (16,777,216).
        setMessage("Sending transaction...");
        await writeContractAsync({
          address: fheCounter.address,
          abi: fheCounter.abi,
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
