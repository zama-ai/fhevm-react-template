"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FhevmDecryptionSignature } from "../FhevmDecryptionSignature.js";
import { GenericStringStorage } from "../storage/GenericStringStorage.js";
import { FhevmInstance } from "../fhevmTypes.js";
import { ethers } from "ethers";

export type FHEDecryptRequest = { handle: string; contractAddress: `0x${string}` };

export const useFHEDecrypt = (params: {
  instance: FhevmInstance | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  chainId: number | undefined;
  requests: readonly FHEDecryptRequest[] | undefined;
}) => {
  const { instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId, requests } = params;

  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [results, setResults] = useState<Record<string, string | bigint | boolean>>({});

  const isDecryptingRef = useRef<boolean>(isDecrypting);
  const lastReqKeyRef = useRef<string>("");

  const requestsKey = useMemo(() => {
    if (!requests || requests.length === 0) return "";
    const sorted = [...requests].sort((a, b) =>
      (a.handle + a.contractAddress).localeCompare(b.handle + b.contractAddress),
    );
    return JSON.stringify(sorted);
  }, [requests]);

  const canDecrypt = useMemo(() => {
    return Boolean(instance && ethersSigner && requests && requests.length > 0 && !isDecrypting);
  }, [instance, ethersSigner, requests, isDecrypting]);

  const decrypt = useCallback(() => {
    if (isDecryptingRef.current) return;
    if (!instance || !ethersSigner || !requests || requests.length === 0) return;

    const thisChainId = chainId;
    const thisSigner = ethersSigner;
    const thisRequests = requests;

    // Capture the current requests key to avoid false "stale" detection on first run
    lastReqKeyRef.current = requestsKey;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt");

    const run = async () => {
      const isStale = () =>
        thisChainId !== chainId || thisSigner !== ethersSigner || requestsKey !== lastReqKeyRef.current;

      try {
        const uniqueAddresses = Array.from(new Set(thisRequests.map(r => r.contractAddress)));
        const sig: FhevmDecryptionSignature | null = await FhevmDecryptionSignature.loadOrSign(
          instance,
          uniqueAddresses as `0x${string}`[],
          ethersSigner,
          fhevmDecryptionSignatureStorage,
        );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setMessage("Call FHEVM userDecrypt...");

        const mutableReqs = thisRequests.map(r => ({ handle: r.handle, contractAddress: r.contractAddress }));
        const res = await instance.userDecrypt(
          mutableReqs,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays,
        );

        setMessage("FHEVM userDecrypt completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setResults(res);
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
        lastReqKeyRef.current = requestsKey;
      }
    };

    run();
  }, [instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId, requests, requestsKey]);

  return { canDecrypt, decrypt, isDecrypting, message, results, setMessage } as const;
};