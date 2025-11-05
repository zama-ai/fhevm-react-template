import { FhevmWindowType } from "./fhevmTypes";
type TraceType = (message?: unknown, ...optionalParams: unknown[]) => void;
export declare class RelayerSDKLoader {
    private _trace?;
    constructor(options: {
        trace?: TraceType;
    });
    isLoaded(): boolean;
    load(): Promise<void>;
}
export declare function isFhevmWindowType(win: unknown, trace?: TraceType): win is FhevmWindowType;
export {};
