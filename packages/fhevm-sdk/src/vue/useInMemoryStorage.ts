import { inject, provide } from "vue";
import type { InjectionKey } from "vue";
import { GenericStringInMemoryStorage, GenericStringStorage } from "../storage/GenericStringStorage.js";

interface UseInMemoryStorageState {
  storage: GenericStringStorage;
}

const InMemoryStorageSymbol: InjectionKey<UseInMemoryStorageState> = Symbol("fhevm-sdk:InMemoryStorage");

export const provideInMemoryStorage = (storage?: GenericStringStorage): UseInMemoryStorageState => {
  const storageInstance = storage ?? new GenericStringInMemoryStorage();
  const state: UseInMemoryStorageState = { storage: storageInstance };
  provide(InMemoryStorageSymbol, state);
  return state;
};

export const useInMemoryStorage = (): UseInMemoryStorageState => {
  const context = inject(InMemoryStorageSymbol, null);
  if (!context) {
    throw new Error("useInMemoryStorage must be used after calling provideInMemoryStorage in the current component setup");
  }
  return context;
};

export const createInMemoryStorage = () => new GenericStringInMemoryStorage();
