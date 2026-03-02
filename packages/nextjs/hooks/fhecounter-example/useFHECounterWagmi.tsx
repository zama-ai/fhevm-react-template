"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { ZERO_HANDLE, useCreateEIP712, useEncrypt, useGenerateKeypair, useUserDecrypt } from "@zama-fhe/react-sdk";
import { toHex } from "viem";
import { useAccount, useChainId, useReadContract, useSignTypedData, useWriteContract } from "wagmi";
import type { Contract } from "~~/utils/helper/contract";
import type { AllowedChainIds } from "~~/utils/helper/networks";

/**
 * useFHECounterWagmi - FHE Counter hook using @zama-fhe/react-sdk + wagmi
 *
 * What it does:
 * - Reads the current encrypted counter via wagmi's useReadContract
 * - Decrypts the handle on-demand using useGenerateKeypair + useCreateEIP712 + useSignTypedData + useUserDecrypt
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
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedValues, setDecryptedValues] = useState<Record<string, bigint>>({});

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

  // Decryption hooks
  const generateKeypair = useGenerateKeypair();
  const createEIP712 = useCreateEIP712();
  const { signTypedDataAsync } = useSignTypedData();
  const userDecrypt = useUserDecrypt();

  // Cache credentials to avoid re-signing on each decrypt
  const credentialsRef = useRef<{
    publicKey: string;
    privateKey: string;
    signature: string;
    contractAddresses: `0x${string}`[];
    startTimestamp: number;
    durationDays: number;
  } | null>(null);

  // Derived state
  const isDecrypted = Boolean(countHandle && countHandle !== ZERO_HANDLE && decryptedValues[countHandle] !== undefined);
  const clearCount = useMemo(() => {
    if (!countHandle) return undefined;
    if (countHandle === ZERO_HANDLE) return BigInt(0);
    return decryptedValues[countHandle];
  }, [countHandle, decryptedValues]);

  const canDecrypt = Boolean(
    hasContract && isConnected && address && countHandle && countHandle !== ZERO_HANDLE && !isDecrypted && !isDecrypting,
  );

  const canUpdateCounter = Boolean(hasContract && isConnected && address && !isProcessing);

  // Decrypt the current count handle
  const decryptCountHandle = useCallback(async () => {
    if (!canDecrypt || !countHandle || !fheCounter?.address || !address) return;
    setIsDecrypting(true);
    setMessage("Starting decryption...");

    try {
      let creds = credentialsRef.current;

      // Check if cached credentials include the current contract
      const contractAddr = fheCounter.address as `0x${string}`;
      if (!creds || !creds.contractAddresses.includes(contractAddr)) {
        // Generate keypair
        setMessage("Generating FHE keypair...");
        const keypair = await generateKeypair.mutateAsync();

        // Create EIP712 typed data
        const startTimestamp = Math.floor(Date.now() / 1000);
        const durationDays = 1;
        setMessage("Creating EIP-712 credential...");
        const eip712 = await createEIP712.mutateAsync({
          publicKey: keypair.publicKey,
          contractAddresses: [contractAddr],
          startTimestamp,
          durationDays,
        });

        // Sign with wallet
        setMessage("Waiting for wallet signature...");
        const signature = await signTypedDataAsync({
          domain: {
            ...eip712.domain,
            chainId: eip712.domain.chainId,
            verifyingContract: eip712.domain.verifyingContract as `0x${string}`,
          },
          types: eip712.types,
          primaryType: "UserDecryptRequestVerification",
          message: {
            publicKey: eip712.message.publicKey as `0x${string}`,
            contractAddresses: eip712.message.contractAddresses.map((a: string) => a as `0x${string}`),
            startTimestamp: eip712.message.startTimestamp,
            durationDays: eip712.message.durationDays,
            extraData: eip712.message.extraData as `0x${string}`,
          },
        });

        creds = {
          publicKey: keypair.publicKey,
          privateKey: keypair.privateKey,
          signature,
          contractAddresses: [contractAddr],
          startTimestamp,
          durationDays,
        };
        credentialsRef.current = creds;
      }

      // Perform the decryption
      setMessage("Decrypting handle...");
      const results = await userDecrypt.mutateAsync({
        handles: [countHandle],
        contractAddress: fheCounter.address,
        signedContractAddresses: creds.contractAddresses,
        privateKey: creds.privateKey,
        publicKey: creds.publicKey,
        signature: creds.signature,
        signerAddress: address,
        startTimestamp: creds.startTimestamp,
        durationDays: creds.durationDays,
      });

      setDecryptedValues(prev => ({ ...prev, ...results }));
      setMessage("Decryption complete!");
    } catch (e) {
      setMessage(`Decryption failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsDecrypting(false);
    }
  }, [
    canDecrypt,
    countHandle,
    fheCounter?.address,
    address,
    generateKeypair,
    createEIP712,
    signTypedDataAsync,
    userDecrypt,
  ]);

  // Mutations (increment/decrement)
  const updateCounter = useCallback(
    async (value: number) => {
      if (isProcessing || !canUpdateCounter || value === 0 || !fheCounter?.address || !address) return;
      const op = value > 0 ? "increment" : "decrement";
      const valueAbs = Math.abs(value);
      setIsProcessing(true);
      setMessage(`Starting ${op}(${valueAbs})...`);
      try {
        // Encrypt the value
        setMessage("Encrypting value...");
        const enc = await encrypt.mutateAsync({
          values: [BigInt(valueAbs)],
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
