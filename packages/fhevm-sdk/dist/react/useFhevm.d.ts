import type { FhevmInstance } from "../fhevmTypes.js";
export type FhevmGoState = "idle" | "loading" | "ready" | "error";
export declare function useFhevm(parameters: {
    provider: string | any | undefined;
    chainId: number | undefined;
    enabled?: boolean;
    initialMockChains?: Readonly<Record<number, string>>;
}): {
    instance: FhevmInstance | undefined;
    refresh: () => void;
    error: Error | undefined;
    status: FhevmGoState;
};
