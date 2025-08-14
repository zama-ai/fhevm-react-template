"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { FHECounterAddresses } from "@/abi/FHECounterAddresses";
import { FHECounterABI } from "@/abi/FHECounterABI";

export type ClearValueType = { handle: string; clear: string | bigint | boolean };

/**
 * Resolves FHECounter contract metadata for the given EVM `chainId`.
 *
 * The ABI and address book are **generated** from the `fhevm-hardhat-template`
 * artifacts into the `@/abi` folder at build time. This function performs a
 * simple lookup in that generated map.
 *
 * Behavior:
 * - If `chainId` is `undefined` or not found in the map, returns ABI only.
 * - Otherwise returns `{ abi, address, chainId, chainName }`.
 *
 * @param chainId - Target chain id (e.g., 1, 5, 11155111). `undefined` returns ABI-only.
 * @returns Contract info for the chain or ABI-only fallback.
 * @example
 * const { abi, address } = getFHECounterByChainId(chainId);
 */
function getFHECounterByChainId(chainId: number | undefined): {
  abi: typeof FHECounterABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
} {
  if (!chainId) {
    return { abi: FHECounterABI.abi };
  }

  const entry =
    FHECounterAddresses[chainId.toString() as keyof typeof FHECounterAddresses];

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId,
    chainName: entry?.chainName,
    abi: FHECounterABI.abi,
  };
}

/*
 * Main FHECounter React component with 3 buttons
 *  - "Decrypt" button: allows you to decrypt the current FHECounter count handle.
 *  - "Increment" button: allows you to increment the FHECounter count handle using FHE operations.
 *  - "Decrement" button: allows you to decrement the FHECounter count handle using FHE operations.
 */
export const useFHECounter = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersBrowserProvider: ethers.BrowserProvider | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersBrowserProvider,
    sameChain,
    sameSigner,
  } = parameters;

  //////////////////////////////////////////////////////////////////////////////
  // States + Refs (refs are mostly used to access latest React values and avoid state dependencies)
  //////////////////////////////////////////////////////////////////////////////

  const [countHandle, setCountHandle] = useState<string | undefined>(undefined);
  const [clearCount, setClearCount] = useState<ClearValueType | undefined>(
    undefined
  );
  const clearCountRef = useRef<ClearValueType>(undefined);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [isIncOrDec, setIsIncOrDec] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const fheCounterAddressRef = useRef<string | undefined>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isDecryptingRef = useRef<boolean>(isDecrypting);
  const isIncOrDecRef = useRef<boolean>(isIncOrDec);

  const isDecrypted = countHandle && countHandle === clearCount?.handle;

  //////////////////////////////////////////////////////////////////////////////
  // FHECounter
  //////////////////////////////////////////////////////////////////////////////

  const fheCounter = useMemo(() => {
    const c = getFHECounterByChainId(chainId);

    //chainIdRef.current = chainId;
    fheCounterAddressRef.current = c.address;

    return c;
  }, [chainId]);

  //////////////////////////////////////////////////////////////////////////////
  // Count Handle
  //////////////////////////////////////////////////////////////////////////////

  const canGetCount = useMemo(() => {
    return fheCounter.address && ethersBrowserProvider && !isRefreshing;
  }, [fheCounter.address, ethersBrowserProvider, isRefreshing]);

  const refreshCountHandle = useCallback(() => {
    if (isRefreshingRef.current) {
      return;
    }

    if (!fheCounter?.address || !chainId || !ethersBrowserProvider) {
      setCountHandle(undefined);
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = chainId;
    const thisFheCounterAddress = fheCounter.address;
    const thisEthersBrowserProvider = ethersBrowserProvider;
    const thisFheCounterContract = new ethers.Contract(
      thisFheCounterAddress,
      fheCounter.abi,
      thisEthersBrowserProvider
    );

    thisFheCounterContract
      .getCount()
      .then((value) => {
        if (
          sameChain.current(thisChainId) && //thisChainId === chainIdRef.current &&
          thisFheCounterAddress === fheCounterAddressRef.current
        ) {
          setCountHandle(value);
        }

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      })
      .catch((e) => {
        setMessage("FHECounter.getCount() call failed! error=" + e);

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [fheCounter, chainId, ethersBrowserProvider, sameChain]); // Add sameChain to the dependency array to silence the linter

  // Auto refresh the count handle
  useEffect(() => {
    refreshCountHandle();
  }, [refreshCountHandle]);

  //////////////////////////////////////////////////////////////////////////////
  // Count Handle Decryption
  //////////////////////////////////////////////////////////////////////////////

  const canDecrypt = useMemo(() => {
    return (
      fheCounter.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      countHandle &&
      countHandle !== ethers.ZeroHash && // fhe handle not initialized
      countHandle !== clearCount?.handle // not yet decrypted
    );
  }, [
    fheCounter.address,
    instance,
    ethersSigner,
    isRefreshing,
    isDecrypting,
    countHandle,
    clearCount,
  ]);

  /**
   * Asynchronous FHEVM decryption process.
   *
   * - Prevents double execution by using `isDecryptingRef` as a guard.
   * - Checks if the value has already been decrypted using `clearCountRef` to avoid redundant operations.
   * - Verifies if the decryption result is stale by comparing the current `chainId`, `contract address`, and `signer`.
   */
  const decryptCountHandle = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) {
      return;
    }

    if (!fheCounter.address || !instance || !ethersSigner) {
      return;
    }

    // Already computed
    if (countHandle === clearCountRef.current?.handle) {
      return;
    }

    if (!countHandle) {
      setClearCount(undefined);
      clearCountRef.current = undefined;
      return;
    }

    if (countHandle === ethers.ZeroHash) {
      setClearCount({ handle: countHandle, clear: BigInt(0) });
      clearCountRef.current = { handle: countHandle, clear: BigInt(0) };
      return;
    }

    const thisChainId = chainId;
    const thisFheCounterAddress = fheCounter.address;
    const thisCountHandle = countHandle;
    const thisEthersSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt");

    const run = async () => {
      const isStale = () =>
        thisFheCounterAddress !== fheCounterAddressRef.current ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisEthersSigner);

      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [fheCounter.address as `0x${string}`],
            ethersSigner,
            fhevmDecryptionSignatureStorage
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

        // should be ok even if instance changed
        const res = await instance.userDecrypt(
          [{ handle: thisCountHandle, contractAddress: thisFheCounterAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        setMessage("FHEVM userDecrypt completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setClearCount({ handle: thisCountHandle, clear: res[thisCountHandle] });
        clearCountRef.current = {
          handle: thisCountHandle,
          clear: res[thisCountHandle],
        };

        setMessage(
          "Count handle clear value is " + clearCountRef.current.clear
        );
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [
    fhevmDecryptionSignatureStorage,
    ethersSigner,
    fheCounter.address,
    instance,
    countHandle,
    chainId,
    sameChain,
    sameSigner,
  ]);

  //////////////////////////////////////////////////////////////////////////////
  // Count Handle Decryption
  //////////////////////////////////////////////////////////////////////////////

  const canIncOrDec = useMemo(() => {
    return (
      fheCounter.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isIncOrDec
    );
  }, [fheCounter.address, instance, ethersSigner, isRefreshing, isIncOrDec]);

  /**
   * Asynchronous FHEVM encryption process.
   *
   * - Prevents double execution by using `isIncOrDecRef` as a guard.
   * - Verifies if the decryption result is stale by comparing the current `chainId`, `contract address`, and `signer`.
   */
  const incOrDec = useCallback(
    (value: number) => {
      if (isRefreshingRef.current || isIncOrDecRef.current) {
        return;
      }

      if (!fheCounter.address || !instance || !ethersSigner || value === 0) {
        return;
      }

      const thisChainId = chainId;
      const thisFheCounterAddress = fheCounter.address;
      const thisEthersSigner = ethersSigner;
      const thisFheCounterContract = new ethers.Contract(
        thisFheCounterAddress,
        fheCounter.abi,
        thisEthersSigner
      );

      const op = value > 0 ? "increment" : "decrement";
      const valueAbs = value > 0 ? value : -value;
      const opMsg = `${op}(${valueAbs})`;

      isIncOrDecRef.current = true;
      setIsIncOrDec(true);
      setMessage(`Start ${opMsg}...`);

      const run = async (op: "increment" | "decrement", valueAbs: number) => {
        // let the browser repaint before running 'input.encrypt()' (CPU-costly)
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isStale = () =>
          thisFheCounterAddress !== fheCounterAddressRef.current ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          const input = instance.createEncryptedInput(
            thisFheCounterAddress,
            thisEthersSigner.address
          );
          input.add32(valueAbs);

          // is CPU-intensive (browser may freeze a little when FHE-WASM modules are loading)
          const enc = await input.encrypt();

          if (isStale()) {
            setMessage(`Ignore ${opMsg}`);
            return;
          }

          setMessage(`Call ${opMsg}...`);

          // Call contract (increment or decrement)
          const tx: ethers.TransactionResponse =
            op === "increment"
              ? await thisFheCounterContract.increment(
                  enc.handles[0],
                  enc.inputProof
                )
              : await thisFheCounterContract.decrement(
                  enc.handles[0],
                  enc.inputProof
                );

          setMessage(`Wait for tx:${tx.hash}...`);

          const receipt = await tx.wait();

          setMessage(`Call ${opMsg} completed status=${receipt?.status}`);

          if (isStale()) {
            setMessage(`Ignore ${opMsg}`);
            return;
          }

          refreshCountHandle();
        } catch {
          setMessage(`${opMsg} Failed!`);
        } finally {
          isIncOrDecRef.current = false;
          setIsIncOrDec(false);
        }
      };

      run(op, valueAbs);
    },
    [
      ethersSigner,
      fheCounter.address,
      fheCounter.abi,
      instance,
      chainId,
      refreshCountHandle,
      sameChain,
      sameSigner,
    ]
  );

  return {
    contractAddress: fheCounter.address,
    canDecrypt,
    canGetCount,
    canIncOrDec,
    incOrDec,
    decryptCountHandle,
    isDecrypted,
    message,
    clear: clearCount?.clear,
    handle: countHandle,
    isDecrypting,
    isRefreshing,
    isIncOrDec
  };
};
