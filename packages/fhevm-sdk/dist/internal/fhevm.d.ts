import { FhevmInstance } from "../fhevmTypes";
export declare class FhevmReactError extends Error {
    code: string;
    constructor(code: string, message?: string, options?: ErrorOptions);
}
export declare class FhevmAbortError extends Error {
    constructor(message?: string);
}
type FhevmRelayerStatusType = "sdk-loading" | "sdk-loaded" | "sdk-initializing" | "sdk-initialized" | "creating";
export declare function createFhevmInstance(parameters: {
    provider: any | string;
    mockChains?: Record<number, string>;
    signal: AbortSignal;
    onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance>;
export {};
