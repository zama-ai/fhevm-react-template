import { GenericStringStorage } from "./storage/GenericStringStorage";
import { EIP712Type, FhevmDecryptionSignatureType, FhevmInstance } from "./fhevmTypes";
import { ethers } from "ethers";
export declare class FhevmDecryptionSignature {
    #private;
    private constructor();
    get privateKey(): string;
    get publicKey(): string;
    get signature(): string;
    get contractAddresses(): `0x${string}`[];
    get startTimestamp(): number;
    get durationDays(): number;
    get userAddress(): `0x${string}`;
    static checkIs(s: unknown): s is FhevmDecryptionSignatureType;
    toJSON(): {
        publicKey: string;
        privateKey: string;
        signature: string;
        startTimestamp: number;
        durationDays: number;
        userAddress: `0x${string}`;
        contractAddresses: `0x${string}`[];
        eip712: EIP712Type;
    };
    static fromJSON(json: unknown): FhevmDecryptionSignature;
    equals(s: FhevmDecryptionSignatureType): boolean;
    isValid(): boolean;
    saveToGenericStringStorage(storage: GenericStringStorage, instance: FhevmInstance, withPublicKey: boolean): Promise<void>;
    static loadFromGenericStringStorage(storage: GenericStringStorage, instance: FhevmInstance, contractAddresses: string[], userAddress: string, publicKey?: string): Promise<FhevmDecryptionSignature | null>;
    static new(instance: FhevmInstance, contractAddresses: string[], publicKey: string, privateKey: string, signer: ethers.Signer): Promise<FhevmDecryptionSignature | null>;
    static loadOrSign(instance: FhevmInstance, contractAddresses: string[], signer: ethers.Signer, storage: GenericStringStorage, keyPair?: {
        publicKey: string;
        privateKey: string;
    }): Promise<FhevmDecryptionSignature | null>;
}
