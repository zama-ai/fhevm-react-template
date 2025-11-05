export interface GenericStringStorage {
    getItem(key: string): string | Promise<string | null> | null;
    setItem(key: string, value: string): void | Promise<void>;
    removeItem(key: string): void | Promise<void>;
}
export declare class GenericStringInMemoryStorage implements GenericStringStorage {
    #private;
    getItem(key: string): string | Promise<string | null> | null;
    setItem(key: string, value: string): void | Promise<void>;
    removeItem(key: string): void | Promise<void>;
}
