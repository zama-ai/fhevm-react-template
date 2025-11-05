"use client";
import { useCallback, useMemo } from "react";
// Map external encrypted integer type to RelayerEncryptedInput builder method
export const getEncryptionMethod = (internalType) => {
    switch (internalType) {
        case "externalEbool":
            return "addBool";
        case "externalEuint8":
            return "add8";
        case "externalEuint16":
            return "add16";
        case "externalEuint32":
            return "add32";
        case "externalEuint64":
            return "add64";
        case "externalEuint128":
            return "add128";
        case "externalEuint256":
            return "add256";
        case "externalEaddress":
            return "addAddress";
        default:
            console.warn(`Unknown internalType: ${internalType}, defaulting to add64`);
            return "add64";
    }
};
// Convert Uint8Array or hex-like string to 0x-prefixed hex string
export const toHex = (value) => {
    if (typeof value === "string") {
        return (value.startsWith("0x") ? value : `0x${value}`);
    }
    // value is Uint8Array
    return ("0x" + Buffer.from(value).toString("hex"));
};
// Build contract params from EncryptResult and ABI for a given function
export const buildParamsFromAbi = (enc, abi, functionName) => {
    const fn = abi.find((item) => item.type === "function" && item.name === functionName);
    if (!fn)
        throw new Error(`Function ABI not found for ${functionName}`);
    return fn.inputs.map((input, index) => {
        const raw = index === 0 ? enc.handles[0] : enc.inputProof;
        switch (input.type) {
            case "bytes32":
            case "bytes":
                return toHex(raw);
            case "uint256":
                return BigInt(raw);
            case "address":
            case "string":
                return raw;
            case "bool":
                return Boolean(raw);
            default:
                console.warn(`Unknown ABI param type ${input.type}; passing as hex`);
                return toHex(raw);
        }
    });
};
export const useFHEEncryption = (params) => {
    const { instance, ethersSigner, contractAddress } = params;
    const canEncrypt = useMemo(() => Boolean(instance && ethersSigner && contractAddress), [instance, ethersSigner, contractAddress]);
    const encryptWith = useCallback(async (buildFn) => {
        if (!instance || !ethersSigner || !contractAddress)
            return undefined;
        const userAddress = await ethersSigner.getAddress();
        const input = instance.createEncryptedInput(contractAddress, userAddress);
        buildFn(input);
        const enc = await input.encrypt();
        return enc;
    }, [instance, ethersSigner, contractAddress]);
    return {
        canEncrypt,
        encryptWith,
    };
};
