import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { StorageAdapter } from "../types";

interface PublicKeyDB extends DBSchema {
  publicKeys: {
    key: string;
    value: {
      publicKey: string;
      publicParams: string;
    };
  };
}

class IndexedDBStorage implements StorageAdapter {
  private db: IDBPDatabase<PublicKeyDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<PublicKeyDB>("fhevm-public-keys", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("publicKeys")) {
          db.createObjectStore("publicKeys");
        }
      },
    });
  }

  async get(key: string): Promise<string | null> {
    await this.init();
    if (!this.db) return null;

    try {
      const result = await this.db.get("publicKeys", key);
      return result ? JSON.stringify(result) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      const parsed = JSON.parse(value);
      await this.db.put("publicKeys", parsed, key);
    } catch {
      // If parsing fails, store as string
      await this.db.put("publicKeys", { publicKey: value, publicParams: "" }, key);
    }
  }

  async remove(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    await this.db.delete("publicKeys", key);
  }
}

class MemoryStorage implements StorageAdapter {
  private storage = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }
}

export class CloakStorage {
  private adapter: StorageAdapter;

  constructor(adapter?: StorageAdapter) {
    this.adapter = adapter || this.getDefaultAdapter();
  }

  private getDefaultAdapter(): StorageAdapter {
    if (typeof window === "undefined") {
      return new MemoryStorage();
    }

    // Try IndexedDB first, fallback to localStorage, then memory
    try {
      if ("indexedDB" in window) {
        return new IndexedDBStorage();
      }
    } catch {
      // IndexedDB not available
    }

    try {
      if ("localStorage" in window) {
        return new LocalStorageAdapter();
      }
    } catch {
      // localStorage not available
    }

    return new MemoryStorage();
  }

  async get(key: string): Promise<string | null> {
    return this.adapter.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    return this.adapter.set(key, value);
  }

  async remove(key: string): Promise<void> {
    return this.adapter.remove(key);
  }

  async getPublicKey(aclAddress: string): Promise<{ publicKey: string; publicParams: string } | null> {
    const data = await this.get(`publicKey_${aclAddress}`);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async setPublicKey(aclAddress: string, publicKey: string, publicParams: string): Promise<void> {
    const data = JSON.stringify({ publicKey, publicParams });
    await this.set(`publicKey_${aclAddress}`, data);
  }

  async removePublicKey(aclAddress: string): Promise<void> {
    await this.remove(`publicKey_${aclAddress}`);
  }
}

// Legacy functions for compatibility with existing FHEVM code
export async function publicKeyStorageGet(aclAddress: string): Promise<{ publicKey: string; publicParams: string }> {
  const storage = new CloakStorage();
  const result = await storage.getPublicKey(aclAddress);
  
  if (!result) {
    // Return default values if not found
    return {
      publicKey: "",
      publicParams: "",
    };
  }
  
  return result;
}

export async function publicKeyStorageSet(
  aclAddress: string,
  publicKey: string,
  publicParams: string
): Promise<void> {
  const storage = new CloakStorage();
  await storage.setPublicKey(aclAddress, publicKey, publicParams);
}
