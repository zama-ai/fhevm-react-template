"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { FHEZmailABI } from "@/abi/FHEZmailABI";
import { FHEZmailAddresses } from "@/abi/FHEZmailAddresses";

/**
 * React hook to interact with the FHEZmail contract.
 * Handles initialization, encryption, decryption, and mailbox actions.
 */
export const useFHEZmail = ({
  fhevmDecryptionSignatureStorage,
}: {
  fhevmDecryptionSignatureStorage: GenericStringStorage;
}) => {
  const [contract, setContract] = useState<ethers.Contract>();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const toNum = (x: bigint | number) => Number(x);

  // ================= INIT FHE + CONTRACT =================
  const {
    provider,
    chainId,
    initialMockChains,
    ethersSigner: signer,
  } = useMetaMaskEthersSigner();

  const { status: fheInstanceStatus, instance: fheInstance } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const address = FHEZmailAddresses[String(chainId)]?.address;
        const ctr = new ethers.Contract(address, FHEZmailABI.abi, signer);
        setContract(ctr);
        setContractAddress(address);
      } catch (err) {
        console.log(err);
      }
    };

    if (chainId) init();
  }, [provider, signer, chainId]);

  useEffect(() => {
    if (fheInstanceStatus === "ready" && contract) {
      toast.success("FHEVM and Zmail contract ready!");
      setIsInitialized(true);
    }
  }, [fheInstanceStatus, contract]);

  const sendMail = () => {};

  return {
    isInitialized,
    fheInstance,
    contract,
    loading,
    sendMail,
  } as const;
};
