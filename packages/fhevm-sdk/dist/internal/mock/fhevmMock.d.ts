import { FhevmInstance } from "../../fhevmTypes";
export declare const fhevmMockCreateInstance: (parameters: {
    rpcUrl: string;
    chainId: number;
    metadata: {
        ACLAddress: `0x${string}`;
        InputVerifierAddress: `0x${string}`;
        KMSVerifierAddress: `0x${string}`;
    };
}) => Promise<FhevmInstance>;
