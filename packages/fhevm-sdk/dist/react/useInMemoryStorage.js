import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { GenericStringInMemoryStorage } from "../storage/GenericStringStorage";
const InMemoryStorageContext = createContext(undefined);
export const useInMemoryStorage = () => {
    const context = useContext(InMemoryStorageContext);
    if (!context) {
        throw new Error("useInMemoryStorage must be used within a InMemoryStorageProvider");
    }
    return context;
};
export const InMemoryStorageProvider = ({ children }) => {
    const [storage] = useState(new GenericStringInMemoryStorage());
    return _jsx(InMemoryStorageContext.Provider, { value: { storage }, children: children });
};
