import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import { Mail, Box } from "@/types";
import { RPC_URLS } from "@/constants";
import { useFhevm } from "@/fhevm/useFhevm";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { FHEZmailABI } from "@/abi/FHEZmailABI";
import { FHEZmailAddresses } from "@/abi/FHEZmailAddresses";
import { stringToBigInts, bigIntToString, parseUnixToUTC } from "@/utils";

import type { FhevmInstance } from "@/fhevm/fhevmTypes";

// =================== HOOK ===================

/** Hook to interact with FHEZmail contract */
export const useFHEZmail = ({
  fhevmDecryptionSignatureStorage,
}: {
  fhevmDecryptionSignatureStorage: GenericStringStorage;
}) => {
  const [contractWrite, setContractWrite] = useState<ethers.Contract>();
  const [contractRead, setContractRead] = useState<ethers.Contract>();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const toNum = (x: bigint | number) => Number(x);

  const { acount, provider, chainId, ethersSigner, initialMockChains } =
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
        const contractWrite = new ethers.Contract(
          address,
          FHEZmailABI.abi,
          ethersSigner
        );
        const contractRead = new ethers.Contract(
          address,
          FHEZmailABI.abi,
          new ethers.JsonRpcProvider(RPC_URLS[0])
        );
        setContractWrite(contractWrite);
        setContractRead(contractRead);
        setContractAddress(address);
      } catch (err) {
        console.error(err);
      }
    };
    if (chainId) init();
  }, [provider, ethersSigner, chainId]);

  useEffect(() => {
    if (fheInstanceStatus === "ready" && contractWrite && contractRead) {
      toast.success("FHEVM and Zmail contract ready!");
      setIsInitialized(true);
    }
  }, [fheInstanceStatus, contractWrite, contractRead]);

  // =================== MAIL FUNCTIONS ===================

  /** Fetch mails from contract */
  const fetchMails = async (
    method: string,
    address: string = acount ?? "",
    ...args: any[]
  ): Promise<Mail[]> => {
    if (contractRead) {
      try {
        const rawMails: any[] = await (contractRead as any)[method](
          address,
          ...args
        );
        if (rawMails.length === 0) return [];
        return rawMails
          .map((m) => {
            const timestamp = Number(m.time);
            return {
              id: toNum(m.id),
              threadId: toNum(m.threadId),
              owner: m.owner,
              from: m.from,
              to: m.to,
              timestamp,
              time: parseUnixToUTC(timestamp),
              box: Number(m.box) as Box,
              subject: m.subjectCT,
              body: m.bodyCT,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp);
      } catch (err: any) {
        if (err.code === "BAD_DATA" && err.value === "0x") return [];
        console.error(`Error in ${method}:`, err);
        return [];
      }
    }

    return [];
  };

  /** Encrypt string for contract in chunks */
  async function encryptChunksForContract(
    fheInstance: FhevmInstance,
    signer: ethers.Signer,
    str: string
  ) {
    const bigints = stringToBigInts(str);
    const ciphertexts: Uint8Array[] = [];
    const proofs: Uint8Array[] = [];
    const BATCH_SIZE = 8;

    for (let i = 0; i < bigints.length; i += BATCH_SIZE) {
      const batch = bigints.slice(i, i + BATCH_SIZE);
      const input = fheInstance.createEncryptedInput(
        contractAddress,
        await signer.getAddress()
      );
      batch.forEach((bn) => input.add256(bn));
      const encrypted = await input.encrypt();
      encrypted.handles.forEach((handle) => {
        ciphertexts.push(handle);
        proofs.push(encrypted.inputProof);
      });
    }

    return { ciphertexts, proofs };
  }

  /** Send new mail */
  const sendMail = async (to: string, subject: string, body: string) => {
    if (contractWrite && fheInstance && ethersSigner) {
      const toastLoading = toast.loading("Sending mail...");
      try {
        const subjectEnc = await encryptChunksForContract(
          fheInstance,
          ethersSigner,
          subject
        );
        const bodyEnc = await encryptChunksForContract(
          fheInstance,
          ethersSigner,
          body
        );
        const tx = await contractWrite.sendMail(
          to,
          subjectEnc.ciphertexts,
          subjectEnc.proofs,
          bodyEnc.ciphertexts,
          bodyEnc.proofs
        );
        await tx.wait();
        toast.success("Mail sent successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to send mail.");
      } finally {
        toast.dismiss(toastLoading);
      }
    }
  };

  /** Decrypt FHE handles */
  async function decryptHandles(
    fheInstance: any,
    handles: { handle: string; contractAddress: `0x${string}` }[],
    sig: any
  ) {
    const results: Record<string, string> = {};
    for (const h of handles) {
      try {
        const decrypted = await fheInstance.userDecrypt(
          [h],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );
        Object.assign(results, decrypted);
      } catch (err) {
        console.error("Decrypt error at handle:", h, err);
      }
    }
    return results;
  }

  /** Reply to an existing thread */
  const reply = async (threadId: number, subject: string, body: string) => {
    if (contractWrite && fheInstance && ethersSigner) {
      const toastLoading = toast.loading("Replying mail...");
      try {
        const subjectEnc = await encryptChunksForContract(
          fheInstance,
          ethersSigner,
          subject
        );
        const bodyEnc = await encryptChunksForContract(
          fheInstance,
          ethersSigner,
          body
        );
        const tx = await contractWrite.reply(
          threadId,
          subjectEnc.ciphertexts,
          subjectEnc.proofs,
          bodyEnc.ciphertexts,
          bodyEnc.proofs
        );
        await tx.wait();
        toast.success("Mail reply successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to reply mail.");
      } finally {
        toast.dismiss(toastLoading);
      }
    }
  };

  /** Get and decrypt a mail thread */
  const getThread = async (
    threadId: number,
    loading: boolean = true
  ): Promise<Mail[]> => {
    if (contractRead && fheInstance && ethersSigner) {
      const toastLoading = toast.loading("View mail...");
      try {
        const rawMails = await contractRead.myThread(threadId);
        if (rawMails.length === 0) return [];
        const sig = await FhevmDecryptionSignature.loadOrSign(
          fheInstance,
          [contractAddress],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );
        if (!sig) return [];

        const handles = rawMails.flatMap((m: any) => [
          ...m.subjectCT.map((h: Uint8Array) => ({
            handle: h,
            contractAddress,
          })),
          ...m.bodyCT.map((h: Uint8Array) => ({ handle: h, contractAddress })),
        ]);

        const decrypted = await decryptHandles(fheInstance, handles, sig);

        return rawMails.map((m: any) => ({
          id: toNum(m.id),
          threadId: toNum(m.threadId),
          owner: m.owner,
          from: m.from,
          to: m.to,
          time: parseUnixToUTC(Number(m.time)),
          box: Number(m.box) as Box,
          subject: m.subjectCT
            .map((h: string) => bigIntToString(BigInt(decrypted[h])))
            .join(""),
          body: m.bodyCT
            .map((h: string) => bigIntToString(BigInt(decrypted[h])))
            .join(""),
        }));
      } catch (err) {
        console.error("Error in getThread:", err);
        return [];
      } finally {
        toast.dismiss(toastLoading);
      }
    }

    return [];
  };

  /** Forward an existing mail */
  const forward = async (mailId: number, to: string) => {
    const toastLoading = toast.loading("Forwarding mail...");
    try {
      const tx = await contractWrite?.forward(mailId, to);
      await tx.wait();
      toast.success("Mail forward successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to forward mail.");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  /** Move mails to another box. */
  const moveMails = async (mailIds: number[], newBox: Box | null) => {
    const toastLoading = toast.loading("Moving mails...");
    try {
      if (contractWrite) {
        const tx = await contractWrite.move(mailIds, newBox);
        await tx.wait();
        toast.success("Mails moved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to move mails.");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  // =================== FETCH HELPERS ===================
  const getInbox = () => fetchMails("inbox");
  const getTrash = () => fetchMails("trash");
  const getSent = () => fetchMails("sent");
  const getRead = () => fetchMails("read");
  const getSpam = () => fetchMails("spam");
  const getArchive = () => fetchMails("archive");
  const getStarred = () => fetchMails("star");
  const getMails = () => fetchMails("myMailsOf");

  return {
    isInitialized,
    fheInstance,
    contract: contractWrite,
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
