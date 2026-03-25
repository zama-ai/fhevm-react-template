"use client";

import { useCallback, useMemo } from "react";
import type { FhevmInstance } from "../fhevmTypes.js";
import { ethers } from "ethers";
import type { VerifiedInputProof } from "@fhevm/sdk/ethers";

export type EncryptResult = {
  handles: readonly string[];
  inputProof: string;
};

// Map external encrypted integer type to FHE type string
export const getEncryptionType = (internalType: string): "bool" | "uint8" | "uint16" | "uint32" | "uint64" | "uint128" | "uint256" | "address" => {
  switch (internalType) {
    case "externalEbool":
      return "bool";
    case "externalEuint8":
      return "uint8";
    case "externalEuint16":
      return "uint16";
    case "externalEuint32":
      return "uint32";
    case "externalEuint64":
      return "uint64";
    case "externalEuint128":
      return "uint128";
    case "externalEuint256":
      return "uint256";
    case "externalEaddress":
      return "address";
    default:
      console.warn(`Unknown internalType: ${internalType}, defaulting to uint64`);
      return "uint64";
  }
};

// Convert value to 0x-prefixed hex string
export const toHex = (value: string): `0x${string}` => {
  return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
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
        return toHex(raw as string);
      case "uint256":
        return BigInt(raw as string);
      case "address":
      case "string":
        return raw;
      case "bool":
        return Boolean(raw);
      default:
        console.warn(`Unknown ABI param type ${input.type}; passing as hex`);
        return toHex(raw as string);
    }
  });
};

export type EncryptValue = {
  readonly type: "bool" | "uint8" | "uint16" | "uint32" | "uint64" | "uint128" | "uint256" | "address";
  readonly value: number | bigint | boolean | string;
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
    async (values: EncryptValue[]): Promise<EncryptResult | undefined> => {
      if (!instance || !ethersSigner || !contractAddress) return undefined;

      const userAddress = await ethersSigner.getAddress();

      // Use the new SDK's encrypt method
      const proof = await instance.encrypt({
        contractAddress,
        userAddress,
        values: values as any,
        extraData: "0x00",
      });

      // Convert to the expected EncryptResult format
      return {
        handles: proof.externalHandles.map(h => h.bytes32Hex),
        inputProof: proof.bytesHex,
      };
    },
    [instance, ethersSigner, contractAddress],
  );

  return {
    canEncrypt,
    encryptWith,
  } as const;
};