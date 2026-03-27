"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { loadOrCreateDecryptSession, buildSignedPermit } from "../FhevmDecryptionSignature.js";
import { GenericStringStorage } from "../storage/GenericStringStorage.js";
import { FhevmInstance } from "../fhevmTypes.js";
import { toFhevmHandle } from "@fhevm/sdk/ethers";
import { ethers } from "ethers";

export type FHEDecryptRequest = { handle: string | bigint; contractAddress: `0x${string}` };

/** Convert a handle (bigint, number, or hex string) to a 0x-prefixed bytes32 hex string */
function toBytes32Hex(handle: string | bigint | number): string {
  if (typeof handle === "bigint" || typeof handle === "number") {
    return "0x" + BigInt(handle).toString(16).padStart(64, "0");
  }
  // Already a hex string
  if (handle.startsWith("0x")) return handle;
  return "0x" + handle.padStart(64, "0");
}

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
  const [error, setError] = useState<string | null>(null);

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

    lastReqKeyRef.current = requestsKey;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt");
    setError(null);

    const run = async () => {
      const isStale = () =>
        thisChainId !== chainId || thisSigner !== ethersSigner || requestsKey !== lastReqKeyRef.current;

      try {
        const uniqueAddresses = Array.from(new Set(thisRequests.map(r => r.contractAddress)));

        // 1. Load or create a decrypt session (key pair + signed permit)
        const session = await loadOrCreateDecryptSession(
          instance,
          uniqueAddresses,
          ethersSigner,
          fhevmDecryptionSignatureStorage,
        );

        if (!session) {
          setMessage("Unable to create decrypt session");
          setError("SESSION_ERROR: Failed to create decrypt session");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setMessage("Decrypting...");

        let decryptedHandles: readonly any[] = [];
        try {
          // 2. Restore the key pair from serialized bytes
          console.log("[decrypt] Loading key pair from serialized bytes...");
          const e2eTransportKeyPair = await instance.loadE2eTransportKeyPair({
            tkmsPrivateKeyBytes: session.serializedKeyPair as any,
          });
          console.log("[decrypt] Key pair loaded");

          // 3. Build the signed permit
          const signedPermit = buildSignedPermit(session);
          console.log("[decrypt] Signed permit built:", {
            signer: signedPermit.signer,
            hasPermit: !!signedPermit.permit,
            hasSignature: !!signedPermit.signature,
          });

          // 4. Decrypt using the new API
          const encryptedValues = thisRequests.map(r => ({
            encrypted: toFhevmHandle(toBytes32Hex(r.handle)),
            contractAddress: r.contractAddress as any,
          }));
          console.log("[decrypt] Calling instance.decrypt with", encryptedValues.length, "values:", encryptedValues);
          decryptedHandles = await instance.decrypt({
            e2eTransportKeyPair,
            encryptedValues,
            signedPermit,
          });
          console.log("[decrypt] Success:", decryptedHandles);
        } catch (e) {
          console.error("[decrypt] Failed:", e);
          const err = e as unknown as { name?: string; message?: string };
          const code = err && typeof err === "object" && "name" in (err as any) ? (err as any).name : "DECRYPT_ERROR";
          const msg =
            err && typeof err === "object" && "message" in (err as any) ? (err as any).message : "Decryption failed";
          setError(`${code}: ${msg}`);
          setMessage("Decryption failed");
          return;
        }

        // Convert the array of DecryptedFhevmHandle to the expected Record format
        const res: Record<string, string | bigint | boolean> = {};
        for (let i = 0; i < thisRequests.length; i++) {
          const handle = String(thisRequests[i].handle);
          const decrypted = decryptedHandles[i];
          if (decrypted) {
            res[handle] = decrypted.value;
          }
        }

        setMessage("Decryption completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setResults(res);
      } catch (e) {
        const err = e as unknown as { name?: string; message?: string };
        const code = err && typeof err === "object" && "name" in (err as any) ? (err as any).name : "UNKNOWN_ERROR";
        const msg =
          err && typeof err === "object" && "message" in (err as any) ? (err as any).message : "Unknown error";
        setError(`${code}: ${msg}`);
        setMessage("Decryption errored");
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
        lastReqKeyRef.current = requestsKey;
      }
    };

    run();
  }, [instance, ethersSigner, fhevmDecryptionSignatureStorage, chainId, requests, requestsKey]);

  return { canDecrypt, decrypt, isDecrypting, message, results, error, setMessage, setError } as const;
};
