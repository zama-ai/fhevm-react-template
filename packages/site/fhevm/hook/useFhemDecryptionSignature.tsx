import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAddress } from "ethers";
import { useFhevm } from "@/fhevm-react/useFhevm";
import {
  equalsArray,
  loadFromStorage,
  saveToStorage,
} from "../core/FhevmDecryptionSignature";
import { EIP712, FhevmDecryptionSignature } from "../core/fhevmTypes";
import { Storage, useAccount, useSignTypedData } from "wagmi";
import { _assert, asNonEmpty } from "../core/utils";
import * as Guard from "../core/guard";

function useLatest<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

type FhevmDecryptionSignatureStatus = "idle" | "error" | "signing" | "signed";
type NonEmptyFhevmDecryptionSignatures = [
  FhevmDecryptionSignature,
  ...FhevmDecryptionSignature[],
];

type FhevmDecryptionInput = FhevmDecryptionSignature & {
  signId: number;
};

export interface FhevmDecryptionSignatureState {
  status: FhevmDecryptionSignatureStatus;
  error: Error | undefined;
  decryptionSignatures:
    | [FhevmDecryptionSignature, ...FhevmDecryptionSignature[]]
    | undefined;
  signKeypair: (
    contractAddresses: `0x${string}` | [`0x${string}`, ...`0x${string}`[]]
  ) => void;
  canSign: boolean;
}

function _timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

export function useFhevmDecryptionSignature(parameters: {
  storage: Storage;
}): FhevmDecryptionSignatureState {
  const [status, setStatus] = useState<FhevmDecryptionSignatureStatus>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);
  const [decryptionSignatures, setDecryptionSignatures] = useState<
    NonEmptyFhevmDecryptionSignatures | undefined
  >(undefined);
  const { address: userAddress } = useAccount();
  const { instance, chainId: instanceChainId } = useFhevm();

  const {
    data: signature,
    signTypedData,
    error: signError,
    status: signStatus,
  } = useSignTypedData();

  const signingInput = useRef<FhevmDecryptionInput | null>(null);

  const requestRef = useRef<Guard.GuardType>({ in: false, id: 0, v: 0 });
  const responseRef = useRef<Guard.GuardType>({ in: false, id: 0, v: 0 });

  const latestUserAddress = useLatest(userAddress);
  const latestInstanceChainId = useLatest(instanceChainId);
  const latestInstance = useLatest(instance);

  const canSign = useMemo<boolean>((): boolean => {
    // console.log(
    //   `canSign= status:${status} request.in=${requestRef.current?.in} response.in=${responseRef.current?.in} !signingInput.current=${!signingInput.current} !!instance=${!!instance}`
    // );
    return (
      (status === "idle" || status === "error" || status === "signed") &&
      !requestRef.current?.in &&
      !responseRef.current?.in &&
      !signingInput.current &&
      !!instance
    );
  }, [instance, status]);

  const setDecryptionSignaturesIfChanged = useCallback(
    (next: NonEmptyFhevmDecryptionSignatures | undefined) => {
      setDecryptionSignatures((prev) => {
        if (equalsArray(prev, next)) {
          return prev;
        }
        return next; // change → update state
      });
    },
    []
  );

  const signKeypair = useCallback(
    (
      contractAddresses: `0x${string}` | [`0x${string}`, ...`0x${string}`[]]
    ) => {
      _assert(requestRef.current.id === responseRef.current.id);

      if (requestRef.current.in || responseRef.current.in) {
        return;
      }

      if (isAddress(contractAddresses)) {
        contractAddresses = [contractAddresses];
      }
      if (!Array.isArray(contractAddresses)) {
        throw new TypeError("Invalid argument: 'contractAddesses'");
      }
      if (contractAddresses.length === 0) {
        throw new TypeError("Invalid argument: empty array");
      }
      for (let i = 0; i < contractAddresses.length; ++i) {
        if (!isAddress(contractAddresses[i])) {
          throw new TypeError(
            `Invalid argument: ${contractAddresses[i]}  is not a valid address`
          );
        }
      }

      const cbContractAddresses = contractAddresses;
      const cbUserAddress = userAddress;
      const cbStorage = parameters.storage;
      const cbInstanceChainId = instanceChainId;
      const cbInstance = instance;

      const request = new Guard.Writer(requestRef, true);
      const response = new Guard.Reader(responseRef, request.id);

      function exitSign() {
        response.delete();
        request.exit();
      }

      function idle() {
        setStatus("idle");
        setDecryptionSignaturesIfChanged(undefined);
        setError(undefined);
      }

      function signing() {
        setStatus("signing");
        setDecryptionSignaturesIfChanged(undefined);
        setError(undefined);
      }

      function signed(
        ds: [FhevmDecryptionSignature, ...FhevmDecryptionSignature[]]
      ) {
        setStatus("signed");
        setDecryptionSignaturesIfChanged(ds);
        setError(undefined);
      }

      // the Metamask UI is visible, waiting for approval
      // signingInput will be nullified by the sign op reply
      // signingInput.current !== null means waiting for reply
      if (signingInput.current) {
        exitSign();
        return;
      }

      if (
        !isAddress(cbUserAddress) ||
        !cbInstance ||
        !cbInstanceChainId
      ) {
        exitSign();
        return;
      }

      signing();

      const run = async () => {
        function isStale(): boolean {
          return (
            latestUserAddress.current !== cbUserAddress &&
            latestInstanceChainId.current === cbInstanceChainId &&
            latestInstance.current === cbInstance
          );
        }
        // During the async delay, the userAddress or the contractAddress have changed
        if (isStale()) {
          if (!response.in) {
            idle();
          }

          //exit callback
          exitSign();
          return;
        }

        const cached = await loadFromStorage(
          {
            contractAddresses: cbContractAddresses,
            userAddress: cbUserAddress,
            chainId: cbInstanceChainId,
          },
          cbStorage
        );

        // During the async delay, the userAddress or the contractAddress have changed
        if (isStale()) {
          if (!response.in) {
            idle();
          }

          //exit callback
          exitSign();
          return;
        }

        if (cached.length === cbContractAddresses.length && cached.length > 0) {
          if (!response.in) {
            signed(cached as NonEmptyFhevmDecryptionSignatures);
          }

          //exit callback
          exitSign();
          return;
        }

        if (response.in) {
          //exit callback
          exitSign();
          return;
        }

        const startTimestamp = _timestampNow();
        const durationDays = 365;

        // Setup the signId first (even if we dont have the eip712 yet)
        signingInput.current = {
          publicKey: "0x",
          privateKey: "0x",
          eip712: {},
          startTimestamp,
          durationDays,
          contractAddress: cbContractAddresses,
          userAddress: cbUserAddress,
          chainId: cbInstanceChainId,
          signId: request.id,
          signature: "0x",
        } as unknown as FhevmDecryptionInput;

        const { publicKey, privateKey } = instance.generateKeypair();

        const eip712 = instance.createEIP712(
          publicKey,
          contractAddresses,
          startTimestamp,
          durationDays
        ) as EIP712;

        if (response.in) {
          //exit callback
          exitSign();
          return;
        }

        signingInput.current = {
          publicKey,
          privateKey,
          eip712,
          startTimestamp,
          durationDays,
          contractAddresses: cbContractAddresses,
          userAddress: cbUserAddress,
          chainId: cbInstanceChainId,
          signId: request.id,
          signature: "0x",
        };

        signTypedData(eip712);

        // exit callback
        exitSign();
      };

      run();
    },
    [
      parameters.storage,
      userAddress,
      latestInstanceChainId,
      latestUserAddress,
      latestInstance,
      instanceChainId,
      instance,
      setDecryptionSignaturesIfChanged,
      signTypedData,
    ]
  );

  const stableSignKeypair = useMemo(() => signKeypair, [signKeypair]);

  // Signature response
  useEffect(() => {
    _assert(requestRef.current.id === responseRef.current.id);

    // Not waiting for response
    if (!signingInput.current) {
      return;
    }

    if (requestRef.current.in || responseRef.current.in) {
      return;
    }

    const eStorage = parameters.storage;

    if (signStatus !== "success" && signStatus !== "error") {
      _assert(
        !signature,
        `Internal Error, unexpected signature value. State is '${signStatus}' while signature has been computed!`
      );
      return;
    }

    const response = new Guard.Writer(responseRef, false /* keep id */);

    function signed(ds: NonEmptyFhevmDecryptionSignatures) {
      setStatus("signed");
      setDecryptionSignaturesIfChanged(ds);
      setError(undefined);
    }

    function error(e: Error) {
      setDecryptionSignaturesIfChanged(undefined);
      setStatus("error");
      setError(e);
    }

    function exitSignResponse() {
      signingInput.current = null;
      response.exit();
    }

    try {
      if (signStatus === "error") {
        error(signError);
        return;
      }

      if (!signature) {
        _assert(
          false,
          "Internal Error, unexpected signature value. State is 'success' while signature is null!"
        );
      }

      // Save even if contractAddres, userAddress etc have changed in the meantime
      const {
        publicKey,
        privateKey,
        startTimestamp,
        durationDays,
        contractAddresses,
        userAddress,
        eip712,
        chainId,
      } = signingInput.current;

      const decryptionSig: FhevmDecryptionSignature = {
        publicKey,
        privateKey,
        startTimestamp,
        durationDays,
        signature,
        userAddress,
        contractAddresses,
        chainId,
        eip712,
      };

      // Fire-and-forget async save operation.
      // We do not await the result, as failure to persist the keypair is non-critical.
      // If saving fails, we simply won’t have a cached version later — which is acceptable.
      saveToStorage(decryptionSig, eStorage);

      const sigs: NonEmptyFhevmDecryptionSignatures = asNonEmpty(
        decryptionSig.contractAddresses.map(() => decryptionSig)
      );

      signed(sigs);
    } finally {
      exitSignResponse();
    }
  }, [
    signature,
    signStatus,
    signError,
    parameters.storage,
    setDecryptionSignaturesIfChanged,
  ]);

  return {
    status,
    error,
    decryptionSignatures,
    signKeypair: stableSignKeypair,
    canSign,
  };
}
