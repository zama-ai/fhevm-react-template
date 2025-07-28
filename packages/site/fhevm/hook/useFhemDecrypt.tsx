import { useFhevm } from "@/fhevm-react/useFhevm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Storage } from "wagmi";
import { useFhevmDecryptionSignature } from "./useFhemDecryptionSignature";
import {
  filterUncachedPairs,
  findMinimalSignatureSet,
  groupHandlesByContract,
  uniqueContracts,
} from "../core/FhevmDecryptionSignature";
import type {
  DecryptedResults,
  HandleContractPair,
  StringHandleContractPair,
} from "../core/fhevmTypes";
import { _assert } from "../core/utils";

export type FhevmDecryptionStatus =
  | "idle"
  | "decrypting"
  | "decrypted"
  | "error";

export interface FhevmDecryptionState {
  decryptHandle: (parameters: { handles: HandleContractPair[] }) => void;
  getResult: (handle: `0x${string}`) => bigint | boolean | string | undefined;
  getStatus: (handle: `0x${string}`) => FhevmDecryptionStatus;
  getError: (handle: `0x${string}`) => Error | undefined;
  clear: () => void;
  canDecrypt: boolean;
}

type ContractToHandlesType = Record<
  string,
  (string | Uint8Array<ArrayBufferLike>)[]
>;
type NonEmptyContracts = [`0x${string}`, ...`0x${string}`[]];

function filterInflightDecryptions(
  pairs: StringHandleContractPair[],
  inflightMap: Map<string, Promise<DecryptedResults>>
): StringHandleContractPair[] {
  return pairs.filter(
    (p) => !inflightMap.has(`${p.contractAddress}:${p.handle}`)
  );
}

function removeInflightDecryptions(
  pairs: StringHandleContractPair[],
  inflightMap: Map<string, Promise<DecryptedResults>>,
  results?: DecryptedResults
) {
  if (results) {
    pairs = pairs.filter((p) =>
      Object.prototype.hasOwnProperty.call(results, p.handle)
    );
  }
  pairs.map((p) => {
    inflightMap.delete(`${p.contractAddress}:${p.handle}`);
  });
}

function addInflightDecryptions(
  pairs: StringHandleContractPair[],
  promise: Promise<DecryptedResults>,
  inflightMap: Map<string, Promise<DecryptedResults>>
) {
  pairs.map((p) => {
    inflightMap.set(`${p.contractAddress}:${p.handle}`, promise);
  });
}

export function useFhevmDecrypt(parameters: {
  storage: Storage;
}): FhevmDecryptionState {
  const { instance } = useFhevm();
  const { signKeypair, decryptionSignatures, canSign } =
    useFhevmDecryptionSignature({ storage: parameters.storage });
  const [contractsToHandles, setContractsToHandles] = useState<
    ContractToHandlesType | undefined
  >(undefined);
  const [contracts, setContracts] = useState<NonEmptyContracts | undefined>(
    undefined
  );
  const cacheRef = useRef<DecryptedResults | undefined>(undefined);
  const inflightDecryptionsRef = useRef<Map<string, Promise<DecryptedResults>>>(
    new Map()
  );

  const [decryptedResults, setDecryptedResults] = useState<DecryptedResults>(
    {}
  );
  const getResult = useCallback(
    (handle: `0x${string}`): bigint | boolean | string | undefined => {
      return decryptedResults[handle];
    },
    [decryptedResults]
  );

  const [handleErrorMap, setHandleErrorMap] = useState<Record<string, Error>>(
    {}
  );
  const getError = useCallback(
    (handle: `0x${string}`): Error | undefined => {
      return handleErrorMap[handle];
    },
    [handleErrorMap]
  );

  const [handleStatusMap, setHandleStatusMap] = useState<
    Record<string, FhevmDecryptionStatus>
  >({});
  const getStatus = useCallback(
    (handle: `0x${string}`): FhevmDecryptionStatus => {
      return handleStatusMap[handle] ?? "idle";
    },
    [handleStatusMap]
  );

  function updateHandleResult(results: DecryptedResults) {
    setDecryptedResults((prev) => {
      const next = { ...prev };
      let changed = false;
      const handles = Object.keys(results);
      for (const h of handles) {
        if (prev[h] !== results[h]) {
          next[h] = results[h];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }

  function updateHandleStatus(
    handles: StringHandleContractPair[],
    status: FhevmDecryptionStatus
  ) {
    setHandleStatusMap((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const h of handles) {
        if (prev[h.handle] !== status) {
          next[h.handle] = status;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }

  function updateHandleError(
    handles: StringHandleContractPair[],
    error: Error
  ) {
    setHandleErrorMap((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const h of handles) {
        if (prev[h.handle] !== error) {
          next[h.handle] = error;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }

  const canDecrypt = useMemo<boolean>((): boolean => {
    return !!instance;
  }, [instance]);

  const clear = useCallback(() => {
    inflightDecryptionsRef.current.clear();
    cacheRef.current = {};
    setDecryptedResults({});
    setHandleErrorMap({});
    setHandleStatusMap({});
  }, []);

  const stableClear = useMemo(() => clear, [clear]);

  const decrypt = useCallback(
    (parameters: { handles: HandleContractPair[] }) => {
      const handles: StringHandleContractPair[] = filterUncachedPairs(
        parameters.handles,
        cacheRef.current
      );
      if (handles.length === 0) {
        console.warn(`handle is in cache!`);
      }
      const list = uniqueContracts(handles);
      if (list.length === 0) {
        return;
      }
      const group = groupHandlesByContract(handles);

      setContracts(list as NonEmptyContracts);
      setContractsToHandles(group);

      // Call signKeypair explicitly — not in a useEffect
      if (canSign) {
        signKeypair(list as NonEmptyContracts);
      }
    },
    [signKeypair, canSign]
  );

  const stableDecrypt = useMemo(() => decrypt, [decrypt]);

  useEffect(() => {
    if (
      !decryptionSignatures ||
      !contracts ||
      !instance ||
      !contractsToHandles
    ) {
      return;
    }

    function computeHandleContractPairs(
      contracts: `0x${string}`[],
      map: ContractToHandlesType
    ): HandleContractPair[] {
      const pairs: HandleContractPair[] = [];
      for (let i = 0; i < contracts.length; ++i) {
        const contract = contracts[i];
        _assert(contract in map);
        const h = map[contract];
        for (let j = 0; j < h.length; ++j) {
          pairs.push({ contractAddress: contract, handle: h[j] });
        }
      }
      return pairs;
    }

    const operations = findMinimalSignatureSet(decryptionSignatures, contracts);
    if (!operations || operations.signatures.length === 0) {
      return;
    }

    for (let i = 0; i < operations.signatures.length; ++i) {
      const op = operations.signatures[i];

      const pairs = computeHandleContractPairs(
        op.contracts,
        contractsToHandles
      );

      const uncachedPairs: StringHandleContractPair[] = filterUncachedPairs(
        pairs,
        cacheRef.current
      );
      const finalPairs: StringHandleContractPair[] = filterInflightDecryptions(
        uncachedPairs,
        inflightDecryptionsRef.current
      );
      if (finalPairs.length === 0) {
        return;
      }

      updateHandleStatus(finalPairs, "decrypting");

      const promise = instance.userDecrypt(
        finalPairs,
        op.signature.privateKey,
        op.signature.publicKey,
        op.signature.signature,
        op.signature.contractAddresses,
        op.signature.userAddress,
        op.signature.startTimestamp,
        op.signature.durationDays
      );

      // const promise = debugUserDecript(
      //   finalPairs,
      //   op.signature.privateKey,
      //   op.signature.publicKey,
      //   op.signature.signature,
      //   op.signature.contractAddresses,
      //   op.signature.userAddress,
      //   op.signature.startTimestamp,
      //   op.signature.durationDays
      // );

      // Save promise to inflight cache
      addInflightDecryptions(
        finalPairs,
        promise,
        inflightDecryptionsRef.current
      );

      // Setup promise
      promise
        .then((res: DecryptedResults) => {
          console.log("userDecrypt() completed!");
          const merged: DecryptedResults = {
            ...cacheRef.current,
            ...res,
          };
          cacheRef.current = merged;
          updateHandleResult(merged);
          // remove Set of pairs from runningDecryptions
          removeInflightDecryptions(finalPairs, inflightDecryptionsRef.current);
          updateHandleStatus(finalPairs, "decrypted");
        })
        .catch((e) => {
          console.error(e);
          updateHandleStatus(finalPairs, "error");
          updateHandleError(
            finalPairs,
            new Error("FhevmDecryptionError", { cause: e })
          );
          // remove Set of pairs from runningDecryptions
          removeInflightDecryptions(finalPairs, inflightDecryptionsRef.current);
        });
    }
  }, [contracts, decryptionSignatures, contractsToHandles, instance]);

  return {
    decryptHandle: stableDecrypt,
    getResult,
    getError,
    getStatus,
    clear: stableClear,
    canDecrypt
  };
}

// function debugUserDecript(
//   handles: StringHandleContractPair[],
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   privateKey: string,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   publicKey: string,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   signature: string,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   contractAddresses: string[],
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   userAddress: string,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   startTimestamp: string | number,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   durationDays: string | number
// ): Promise<DecryptedResults> {
//   const res: DecryptedResults = {};
//   for (let i = 0; i < handles.length; ++i) {
//     res[handles[i].handle] = BigInt(123 + i);
//   }
//   const ok = !true;
//   return new Promise((resolve, reject) => {
//     setTimeout(() => { 
//       if (ok) {
//         return resolve(res);
//       } else {
//         return reject(new Error("BLA!"));
//       }
//     }  , 2000);
//   });
// }
