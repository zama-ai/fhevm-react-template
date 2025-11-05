import { FhevmInstance } from "../fhevmTypes.js";
import { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";
import { ethers } from "ethers";
export type EncryptResult = {
    handles: Uint8Array[];
    inputProof: Uint8Array;
};
export declare const getEncryptionMethod: (internalType: string) => "addBool" | "add8" | "add16" | "add32" | "add64" | "add128" | "add256" | "addAddress";
export declare const toHex: (value: Uint8Array | string) => `0x${string}`;
export declare const buildParamsFromAbi: (enc: EncryptResult, abi: any[], functionName: string) => any[];
export declare const useFHEEncryption: (params: {
    instance: FhevmInstance | undefined;
    ethersSigner: ethers.Signer | undefined;
    contractAddress: `0x${string}` | undefined;
}) => {
    readonly canEncrypt: boolean;
    readonly encryptWith: (buildFn: (builder: RelayerEncryptedInput) => void) => Promise<EncryptResult | undefined>;
};
