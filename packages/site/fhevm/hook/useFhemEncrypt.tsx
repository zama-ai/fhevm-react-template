import { useFhevm } from "@/fhevm-react/useFhevm";
import { useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "ethers";
import { FhevmInstance } from "../core/fhevmTypes";
import { toBytes32Str, toBytesStr } from "../core/utils";
import { useAsyncSymbolGuard } from "../core/useAsyncSymbolGuard";

export type FhevmEncryptionStatus =
  | "idle"
  | "encrypting"
  | "encrypted"
  | "error";

export type FhevmEboolTypeName = "ebool";
export type FhevmEaddressTypeName = "eaddress";
export type FhevmEuintTypeName =
  | "euint8"
  | "euint16"
  | "euint32"
  | "euint64"
  | "euint128"
  | "euint256";

export type FhevmTypeName =
  | FhevmEboolTypeName
  | FhevmEaddressTypeName
  | FhevmEuintTypeName;

export type FhevmInputValue =
  | { type: "ebool"; value: boolean }
  | { type: FhevmEuintTypeName; value: bigint | number }
  | { type: FhevmEaddressTypeName; value: `0x${string}` };

export type FhevmEncryptionResult = {
  handles: `0x${string}`[];
  inputProof: `0x${string}`;
};
export interface FhevmEncryptionState {
  encryptAsync: (parameters: {
    contractAddress: string;
    values: FhevmInputValue[];
  }) => Promise<FhevmEncryptionResult | undefined>;
  encrypt: (parameters: {
    contractAddress: string;
    values: FhevmInputValue[];
  }) => void;
  canEncrypt: boolean;
  status: FhevmEncryptionStatus;
  error: Error | undefined;
  result: FhevmEncryptionResult | undefined;
}

function _assertUint(v: unknown): asserts v is bigint | number {
  if (typeof v !== "number" && typeof v !== "bigint") {
    throw new TypeError(`Invalid uint input value`);
  }
}
function _assertBoolean(v: unknown): asserts v is boolean {
  if (typeof v !== "boolean") {
    throw new TypeError(`Invalid boolean input value`);
  }
}
function _assertString(v: unknown): asserts v is string {
  if (typeof v !== "string") {
    throw new TypeError(`Invalid string input value`);
  }
}

async function _encrypt(parameters: {
  instance: FhevmInstance;
  contractAddress: string;
  userAddress: string;
  values: FhevmInputValue[];
  options?: {
    apiKey?: string;
  };
}): Promise<FhevmEncryptionResult> {
  const { instance, contractAddress, userAddress, values, options } =
    parameters;
  const input = instance.createEncryptedInput(contractAddress, userAddress);

  for (const inputValue of values) {
    switch (inputValue.type) {
      case "ebool":
        _assertBoolean(inputValue.value);
        input.addBool(inputValue.value);
        break;
      case "euint8":
        _assertUint(inputValue.value);
        input.add8(inputValue.value);
        break;
      case "euint16":
        _assertUint(inputValue.value);
        input.add16(inputValue.value);
        break;
      case "euint32":
        _assertUint(inputValue.value);
        input.add32(inputValue.value);
        break;
      case "euint64":
        _assertUint(inputValue.value);
        input.add64(inputValue.value);
        break;
      case "euint128":
        _assertUint(inputValue.value);
        input.add128(inputValue.value);
        break;
      case "euint256":
        _assertUint(inputValue.value);
        input.add256(inputValue.value);
        break;
      case "eaddress":
        _assertString(inputValue.value);
        input.addAddress(inputValue.value);
        break;
      default:
        throw new TypeError(`Unknown input type`);
    }
  }

  return input.encrypt(options).then((result) => {
    return {
      handles: result.handles.map(toBytes32Str),
      inputProof: toBytesStr(result.inputProof),
    };
  });
}

export function useFhevmEncrypt(): FhevmEncryptionState {
  const { instance } = useFhevm();
  const { address: userAddress } = useAccount();
  const [status, setStatus] = useState<FhevmEncryptionStatus>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);
  const [result, setResult] = useState<FhevmEncryptionResult | undefined>(
    undefined
  );
  const guard = useAsyncSymbolGuard();

  const encryptAsync = useCallback(
    async (parameters: {
      contractAddress: string;
      values: FhevmInputValue[];
    }): Promise<FhevmEncryptionResult | undefined> => {
      const { contractAddress, values } = parameters;

      if (
        !instance ||
        !userAddress ||
        values.length === 0 ||
        !isAddress(contractAddress)
      ) {
        return undefined;
      }

      const result = await _encrypt({
        instance,
        contractAddress: parameters.contractAddress,
        userAddress,
        values: parameters.values,
      });

      return result;
    },
    [instance, userAddress]
  );

  const stableEncryptAsync = useMemo(() => encryptAsync, [encryptAsync]);

  const encrypt = useCallback(
    async (parameters: {
      contractAddress: string;
      values: FhevmInputValue[];
    }): Promise<FhevmEncryptionResult | undefined> => {
      if (!instance || !userAddress || parameters.values.length === 0) {
        return undefined;
      }

      const lock = guard.tryLock();
      if (!lock) {
        return undefined;
      }

      setStatus("encrypting");
      setResult(undefined);
      setError(undefined);

      const run = async () => {
        try {
          if (lock.invalid()) {
            return;
          }

          const res = await _encrypt({
            instance,
            contractAddress: parameters.contractAddress,
            userAddress,
            values: parameters.values,
          });

          if (lock.invalid()) {
            return;
          }

          setStatus("encrypted");
          setResult(res);
          setError(undefined);
        } catch (e) {
          if (lock.invalid()) {
            return;
          }

          setStatus("error");
          setResult(undefined);
          setError(
            e instanceof Error
              ? e
              : new Error("FhevmDecryptError", { cause: e })
          );
          throw e;
        } finally {
          lock.release();
        }
      };

      run();
    },
    [instance, userAddress, guard]
  );

  const stableEncrypt = useMemo(() => encrypt, [encrypt]);

  const canEncrypt = useMemo<boolean>((): boolean => {
    return !!userAddress && !!instance;
  }, [instance, userAddress]);

  return {
    encryptAsync: stableEncryptAsync,
    encrypt: stableEncrypt,
    canEncrypt,
    status,
    error,
    result,
  };
}
