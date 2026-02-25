import { openDB, DBSchema, IDBPDatabase } from "idb";

type FhevmStoredPublicKey = {
  publicKeyId: string;
  publicKey: Uint8Array;
};

type FhevmStoredPublicParams = {
  publicParamsId: string;
  publicParams: Uint8Array;
};

interface PublicParamsDB extends DBSchema {
  publicKeyStore: {
    key: string;
    value: {
      acl: `0x${string}`;
      value: FhevmStoredPublicKey;
    };
  };
  paramsStore: {
    key: string;
    value: {
      acl: `0x${string}`;
      value: FhevmStoredPublicParams;
    };
  };
}

let __dbPromise: Promise<IDBPDatabase<PublicParamsDB>> | undefined = undefined;

async function _getDB(): Promise<IDBPDatabase<PublicParamsDB> | undefined> {
  if (__dbPromise) {
    return __dbPromise;
  }
  if (typeof window === "undefined") {
    return undefined;
  }
  __dbPromise = openDB<PublicParamsDB>("fhevm", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("paramsStore")) {
        db.createObjectStore("paramsStore", { keyPath: "acl" });
      }
      if (!db.objectStoreNames.contains("publicKeyStore")) {
        db.createObjectStore("publicKeyStore", { keyPath: "acl" });
      }
    },
  });
  return __dbPromise;
}

// Types that match @zama-fhe/relayer-sdk v0.4 FhevmPkeConfigType
type FhevmPublicKeyType = {
  data: Uint8Array;
  id: string;
};

type FhevmPkeCrsType = {
  publicParams: Uint8Array;
  publicParamsId: string;
};

type FhevmPkeCrsByCapacityType = {
  2048: FhevmPkeCrsType;
};

function assertFhevmStoredPublicKey(
  value: unknown
): asserts value is FhevmStoredPublicKey | null {
  if (typeof value !== "object") {
    throw new Error(`FhevmStoredPublicKey must be an object`);
  }
  if (value === null) {
    return;
  }
  if (!("publicKeyId" in value)) {
    throw new Error(`FhevmStoredPublicKey.publicKeyId does not exist`);
  }
  if (typeof value.publicKeyId !== "string") {
    throw new Error(`FhevmStoredPublicKey.publicKeyId must be a string`);
  }
  if (!("publicKey" in value)) {
    throw new Error(`FhevmStoredPublicKey.publicKey does not exist`);
  }
  if (!(value.publicKey instanceof Uint8Array)) {
    throw new Error(`FhevmStoredPublicKey.publicKey must be a Uint8Array`);
  }
}

function assertFhevmStoredPublicParams(
  value: unknown
): asserts value is FhevmStoredPublicParams | null {
  if (typeof value !== "object") {
    throw new Error(`FhevmStoredPublicParams must be an object`);
  }
  if (value === null) {
    return;
  }
  if (!("publicParamsId" in value)) {
    throw new Error(`FhevmStoredPublicParams.publicParamsId does not exist`);
  }
  if (typeof value.publicParamsId !== "string") {
    throw new Error(`FhevmStoredPublicParams.publicParamsId must be a string`);
  }
  if (!("publicParams" in value)) {
    throw new Error(`FhevmStoredPublicParams.publicParams does not exist`);
  }
  if (!(value.publicParams instanceof Uint8Array)) {
    throw new Error(
      `FhevmStoredPublicParams.publicParams must be a Uint8Array`
    );
  }
}

export async function publicKeyStorageGet(aclAddress: `0x${string}`): Promise<{
  publicKey?: FhevmPublicKeyType;
  publicParams?: FhevmPkeCrsByCapacityType;
}> {
  const db = await _getDB();
  if (!db) {
    return {};
  }

  let storedPublicKey: FhevmStoredPublicKey | null = null;
  try {
    const pk = await db.get("publicKeyStore", aclAddress);
    if (pk?.value) {
      assertFhevmStoredPublicKey(pk.value);
      storedPublicKey = pk.value;
    }
  } catch {
    //
  }

  let storedPublicParams: FhevmStoredPublicParams | null = null;
  try {
    const pp = await db.get("paramsStore", aclAddress);
    if (pp?.value) {
      assertFhevmStoredPublicParams(pp.value);
      storedPublicParams = pp.value;
    }
  } catch {
    //
  }

  const result: {
    publicKey?: FhevmPublicKeyType;
    publicParams?: FhevmPkeCrsByCapacityType;
  } = {};

  if (storedPublicKey) {
    result.publicKey = {
      id: storedPublicKey.publicKeyId,
      data: storedPublicKey.publicKey,
    };
  }

  if (storedPublicParams) {
    result.publicParams = {
      2048: storedPublicParams,
    };
  }

  return result;
}

export async function publicKeyStorageSet(
  aclAddress: `0x${string}`,
  publicKey: FhevmStoredPublicKey | null,
  publicParams: FhevmStoredPublicParams | null
) {
  assertFhevmStoredPublicKey(publicKey);
  assertFhevmStoredPublicParams(publicParams);

  const db = await _getDB();
  if (!db) {
    return;
  }

  if (publicKey) {
    await db.put("publicKeyStore", { acl: aclAddress, value: publicKey });
  }

  if (publicParams) {
    await db.put("paramsStore", { acl: aclAddress, value: publicParams });
  }
}
