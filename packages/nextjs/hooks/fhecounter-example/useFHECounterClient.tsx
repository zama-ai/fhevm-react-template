"use client";

import { useEffect, useMemo, useState } from "react";
import { FhevmClient } from "fhevm-sdk";
import { useAccount, useWalletClient } from "wagmi";
import { FHECounterContractClient } from "~~/contracts/FHECounterContractClient";

/**
 * useFHECounterWagmi - Minimal FHE Counter hook for Wagmi devs
 *
 * What it does:
 * - Reads the current encrypted counter
 * - Decrypts the handle on-demand with useFHEDecrypt
 * - Encrypts inputs and writes increment/decrement
 *
 * Pass your FHEVM instance and a simple key-value storage for the decryption signature.
 * That's it. Everything else is handled for you.
 */
export const useFHECounterClient = () => {
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  const [fhevmClient, setFhevmClient] = useState<FhevmClient | undefined>(undefined);

  useEffect(() => {
    // 没有必要条件时，直接退出
    if (!account?.chainId || !account?.address || !walletClient) {
      setFhevmClient(undefined);
      return;
    }

    async function initClient() {
      const client = new FhevmClient();
      await client.init({
        contractAddress: "0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e",
        durationDays: 7,
        walletClient: walletClient as any,
      });

      setFhevmClient(client);
    }
    initClient();
  }, [account?.chainId, account?.address, walletClient]);

  const contractClient = useMemo(() => {
    if (!account.chain) return undefined;
    return new FHECounterContractClient({
      contractAddress: "0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e",
      chain: account.chain!,
    });
  }, [account.chain]);

  useEffect(() => {
    if (contractClient && walletClient) {
      contractClient.setWalletClient(walletClient);
    }
  }, [walletClient, contractClient]);

  return { fhevmClient, contractClient };
};
