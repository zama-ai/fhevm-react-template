import { ReactNode } from "react";
import { GenericStringStorage } from "../storage/GenericStringStorage";
interface UseInMemoryStorageState {
    storage: GenericStringStorage;
}
interface InMemoryStorageProviderProps {
    children: ReactNode;
}
export declare const useInMemoryStorage: () => UseInMemoryStorageState;
export declare const InMemoryStorageProvider: React.FC<InMemoryStorageProviderProps>;
export {};
