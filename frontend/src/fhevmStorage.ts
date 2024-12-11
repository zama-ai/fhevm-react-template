import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PublicParamsDB extends DBSchema {
  publicKeyStore: {
    key: string;
    value: {
      acl: string;
      value: { publicKeyId: string; publicKey: Uint8Array };
    };
  };
  paramsStore: {
    key: string;
    value: {
      acl: string;
      value: { publicParamsId: string; publicParams: Uint8Array };
    };
  };
}

const dbPromise: Promise<IDBPDatabase<PublicParamsDB>> = openDB<PublicParamsDB>(
  'fhevm',
  1,
  {
    upgrade(db) {
      if (!db.objectStoreNames.contains('paramsStore')) {
        db.createObjectStore('paramsStore', { keyPath: 'acl' });
      }
      if (!db.objectStoreNames.contains('publicKeyStore')) {
        db.createObjectStore('publicKeyStore', { keyPath: 'acl' });
      }
    },
  },
);

export async function storePublicParams(
  acl: string,
  value: { publicParamsId: string; publicParams: Uint8Array },
): Promise<void> {
  const db = await dbPromise;
  await db.put('paramsStore', { acl, value });
  console.log(`Stored public params for: ${acl}`);
}

export async function getPublicParams(
  acl: string,
): Promise<{ publicParamsId: string; publicParams: Uint8Array } | null> {
  const db = await dbPromise;
  try {
    const result = await db.get('paramsStore', acl);
    return result ? result.value : null;
  } catch (e) {
    return null;
  }
}

export async function storePublicKey(
  acl: string,
  value: { publicKeyId: string; publicKey: Uint8Array },
): Promise<void> {
  const db = await dbPromise;
  await db.put('publicKeyStore', { acl, value });
  console.log(`Stored public key for: ${acl}`);
}

export async function getPublicKey(
  acl: string,
): Promise<{ publicKeyId: string; publicKey: Uint8Array } | null> {
  const db = await dbPromise;
  try {
    const result = await db.get('publicKeyStore', acl);
    return result ? result.value : null;
  } catch (e) {
    return null;
  }
}
