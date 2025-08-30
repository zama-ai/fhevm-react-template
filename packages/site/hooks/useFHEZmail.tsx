import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import { Mail, Box } from "@/types";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { FHEZmailABI } from "@/abi/FHEZmailABI";
import { FHEZmailAddresses } from "@/abi/FHEZmailAddresses";

// =================== HOOK ===================

/** Hook to interact with FHEZmail contract */
export const useFHEZmail = ({
  fhevmDecryptionSignatureStorage,
}: {
  fhevmDecryptionSignatureStorage: GenericStringStorage;
}) => {
  const [contract, setContract] = useState<ethers.Contract>();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const toNum = (x: bigint | number) => Number(x);

  const { provider, chainId, ethersSigner, initialMockChains } =
    useMetaMaskEthersSigner();
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
        const ctr = new ethers.Contract(address, FHEZmailABI.abi, ethersSigner);
        setContract(ctr);
        setContractAddress(address);
      } catch (err) {
        console.error(err);
      }
    };
    if (chainId) init();
  }, [provider, ethersSigner, chainId]);

  useEffect(() => {
    if (fheInstanceStatus === "ready" && contract) {
      toast.success("FHEVM and Zmail contract ready!");
      setIsInitialized(true);
    }
  }, [fheInstanceStatus, contract]);

  // =================== MAIL FUNCTIONS ===================

  // =================== FETCH HELPERS ===================

  /** Placeholder fetchMails - chưa triển khai */
  const fetchMails = async (
    method: string,
    ...args: any[]
  ): Promise<Mail[]> => {
    return [];
  };

  /** Helpers using fetchMails placeholder */
  const getInbox = () => fetchMails("inbox");
  const getTrash = () => fetchMails("trash");
  const getSent = () => fetchMails("sent");
  const getRead = () => fetchMails("read");
  const getSpam = () => fetchMails("spam");
  const getArchive = () => fetchMails("archive");
  const getStarred = () => fetchMails("star");
  const getMails = () => fetchMails("myMails");

  /** Thread / Mail actions placeholders */
  const getThread = async (threadId: number): Promise<Mail[]> => {
    return [];
  };
  const sendMail = async (to: string, subject: string, body: string) => { };
  const reply = async (threadId: number, subject: string, body: string) => { };
  const forward = async (mailId: number, to: string) => { };
  const moveMails = async (mailIds: number[], newBox: Box | null) => { };

  return {
    isInitialized,
    fheInstance,
    contract,
    getInbox,
    getTrash,
    getSent,
    getRead,
    getSpam,
    getArchive,
    getStarred,
    getMails,
    getThread,
    sendMail,
    reply,
    forward,
    moveMails,
  } as const;
};
