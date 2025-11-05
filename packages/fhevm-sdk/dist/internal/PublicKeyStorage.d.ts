type FhevmStoredPublicKey = {
    publicKeyId: string;
    publicKey: Uint8Array;
};
type FhevmStoredPublicParams = {
    publicParamsId: string;
    publicParams: Uint8Array;
};
type FhevmInstanceConfigPublicKey = {
    data: Uint8Array | null;
    id: string | null;
};
type FhevmInstanceConfigPublicParams = {
    "2048": {
        publicParamsId: string;
        publicParams: Uint8Array;
    };
};
export declare function publicKeyStorageGet(aclAddress: `0x${string}`): Promise<{
    publicKey?: FhevmInstanceConfigPublicKey;
    publicParams: FhevmInstanceConfigPublicParams | null;
}>;
export declare function publicKeyStorageSet(aclAddress: `0x${string}`, publicKey: FhevmStoredPublicKey | null, publicParams: FhevmStoredPublicParams | null): Promise<void>;
export {};
