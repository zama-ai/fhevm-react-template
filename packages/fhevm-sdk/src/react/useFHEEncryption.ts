"use client";

import { useCallback, useMemo } from "react";
import { FhevmInstance } from "../fhevmTypes.js";
import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import { ethers } from "ethers";

export type EncryptResult = {
  handles: Uint8Array[];
  inputProof: Uint8Array;
};

// Map external encrypted integer type to RelayerEncryptedInput builder method
export const getEncryptionMethod = (internalType: string) => {
  switch (internalType) {
    case "externalEbool":
      return "addBool" as const;
    case "externalEuint8":
      return "add8" as const;
    case "externalEuint16":
      return "add16" as const;
    case "externalEuint32":
      return "add32" as const;
    case "externalEuint64":
      return "add64" as const;
    case "externalEuint128":
      return "add128" as const;
    case "externalEuint256":
      return "add256" as const;
    case "externalEaddress":
      return "addAddress" as const;
    default:
      console.warn(`Unknown internalType: ${internalType}, defaulting to add64`);
      return "add64" as const;
  }
};

// Convert Uint8Array or hex-like string to 0x-prefixed hex string
export const toHex = (value: Uint8Array | string): `0x${string}` => {
  if (typeof value === "string") {
    return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
  }
  // value is Uint8Array
  return ("0x" + Buffer.from(value).toString("hex")) as `0x${string}`;
};

// Build contract params from EncryptResult and ABI for a given function
export const buildParamsFromAbi = (enc: EncryptResult, abi: any[], functionName: string): any[] => {
  const fn = abi.find((item: any) => item.type === "function" && item.name === functionName);
  if (!fn) throw new Error(`Function ABI not found for ${functionName}`);

  return fn.inputs.map((input: any, index: number) => {
    const raw = index === 0 ? enc.handles[0] : enc.inputProof;
    switch (input.type) {
      case "bytes32":
      case "bytes":
        return toHex(raw);
      case "uint256":
        return BigInt(raw as unknown as string);
      case "address":
      case "string":
        return raw as unknown as string;
      case "bool":
        return Boolean(raw);
      default:
        console.warn(`Unknown ABI param type ${input.type}; passing as hex`);
        return toHex(raw);
    }
  });
};

export const useFHEEncryption = (params: {
  instance: FhevmInstance | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  contractAddress: `0x${string}` | undefined;
}) => {
  const { instance, ethersSigner, contractAddress } = params;

  const canEncrypt = useMemo(
    () => Boolean(instance && ethersSigner && contractAddress),
    [instance, ethersSigner, contractAddress],
  );

  const encryptWith = useCallback(
    async (buildFn: (builder: RelayerEncryptedInput) => void): Promise<EncryptResult | undefined> => {
      if (!instance || !ethersSigner || !contractAddress) return undefined;

      const userAddress = await ethersSigner.getAddress();
      const input = instance.createEncryptedInput(contractAddress, userAddress) as RelayerEncryptedInput;
      buildFn(input);
      const enc = await input.encrypt();
      return enc;
    },
    [instance, ethersSigner, contractAddress],
  );

  return {
    canEncrypt,
    encryptWith,
  } as const;
};