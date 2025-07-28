import { isAddress, toBeHex, toBigInt } from "ethers";
import {
  DecryptedResults,
  FhevmDecryptionSignature,
  HandleContractPair,
  StringHandleContractPair,
} from "./fhevmTypes";
import { createStorage, Storage } from "wagmi";

function checkIs(s: unknown): s is FhevmDecryptionSignature {
  if (!s || typeof s !== "object") {
    return false;
  }
  if (!("publicKey" in s && typeof s.publicKey === "string")) {
    return false;
  }
  if (!("privateKey" in s && typeof s.privateKey === "string")) {
    return false;
  }
  if (!("signature" in s && typeof s.signature === "string")) {
    return false;
  }
  if (!("startTimestamp" in s && typeof s.startTimestamp === "number")) {
    return false;
  }
  if (!("durationDays" in s && typeof s.durationDays === "number")) {
    return false;
  }
  if (!("contractAddresses" in s && Array.isArray(s.contractAddresses))) {
    return false;
  }
  for (let i = 0; i < s.contractAddresses.length; ++i) {
    if (typeof s.contractAddresses[i] !== "string") return false;
    if (!s.contractAddresses[i].startsWith("0x")) return false;
  }
  if (
    !(
      "userAddress" in s &&
      typeof s.userAddress === "string" &&
      s.userAddress.startsWith("0x")
    )
  ) {
    return false;
  }
  if (!("chainId" in s && typeof s.chainId === "number")) {
    return false;
  }
  if (!("eip712" in s && typeof s.eip712 === "object")) {
    return false;
  }
  return true;
}

export function equalsArray(
  a1: FhevmDecryptionSignature[] | null | undefined,
  a2: FhevmDecryptionSignature[] | null | undefined
): boolean {
  if (a1 === a2) {
    return true;
  }
  if (!a1) {
    return !a2;
  }
  if (!a2 || a1.length !== a2.length) {
    return false;
  }
  for (let i = 0; i < a1.length; ++i) {
    if (!equals(a1[i], a2[i])) return false;
  }
  return true;
}

export function equals(
  s1: FhevmDecryptionSignature | null | undefined,
  s2: FhevmDecryptionSignature | null | undefined
): boolean {
  if (s1 === s2) {
    return true;
  }
  if (!s1 && !s2) {
    return true;
  }
  if (!s1) {
    return false;
  }

  if (s1.contractAddresses !== s2?.contractAddresses) {
    if (s1.contractAddresses.length !== s2?.contractAddresses.length)
      return false;
    for (let i = 0; i < s1.contractAddresses.length; i++) {
      if (s1.contractAddresses[i] !== s2.contractAddresses[i]) return false;
    }
  }

  if (
    s1.publicKey === s2?.publicKey &&
    s1.privateKey === s2?.privateKey &&
    s1.signature === s2?.signature &&
    s1.startTimestamp === s2?.startTimestamp &&
    s1.durationDays === s2?.durationDays &&
    s1.userAddress === s2?.userAddress &&
    s1.chainId === s2?.chainId
  ) {
    return true;
  }
  return false;
}

function _timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

export type FhevmDecryptionSignatures = {
  [key: string]: {
    [key: string]: {
      [key: number]: FhevmDecryptionSignature;
    };
  };
};

type StorageKeyObjectType = {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  chainId: number;
};

// Never save signatures in a storage!
const _inMemoryDecryptionSignatures: FhevmDecryptionSignatures = {};

function _storeInMemory(
  storageKeyObject: StorageKeyObjectType,
  decryptionSignature: FhevmDecryptionSignature
) {
  if (
    !isAddress(storageKeyObject.contractAddress) ||
    !isAddress(storageKeyObject.userAddress) ||
    !Number.isInteger(storageKeyObject.chainId)
  ) {
    return;
  }

  if (!_inMemoryDecryptionSignatures[storageKeyObject.userAddress]) {
    _inMemoryDecryptionSignatures[storageKeyObject.userAddress] = {};
  }

  if (
    !_inMemoryDecryptionSignatures[storageKeyObject.userAddress][
      storageKeyObject.contractAddress
    ]
  ) {
    _inMemoryDecryptionSignatures[storageKeyObject.userAddress][
      storageKeyObject.contractAddress
    ] = {};
  }

  _inMemoryDecryptionSignatures[storageKeyObject.userAddress][
    storageKeyObject.contractAddress
  ][storageKeyObject.chainId] = decryptionSignature;
}

function _loadFromMemory(
  storageKeyObject: StorageKeyObjectType
): FhevmDecryptionSignature | null {
  if (
    !isAddress(storageKeyObject.contractAddress) ||
    !isAddress(storageKeyObject.userAddress) ||
    !Number.isInteger(storageKeyObject.chainId)
  ) {
    console.error("Invalid parameters!!!");
    return null;
  }

  const kps =
    _inMemoryDecryptionSignatures[storageKeyObject.userAddress]?.[
      storageKeyObject.contractAddress
    ]?.[storageKeyObject.chainId];

  if (!kps) {
    console.error("Decryption signature is not stored in memory");
    return null;
  }

  if (!checkIs(kps)) {
    console.error("Invalid decryption signature object.");
    return null;
  }

  if (_timestampNow() >= kps.startTimestamp + kps.durationDays * 24 * 60 * 60) {
    delete _inMemoryDecryptionSignatures[storageKeyObject.userAddress][
      storageKeyObject.contractAddress
    ];
    return null;
  }

  return kps;
}

function _deleteFromMemory(storageKeyObject: StorageKeyObjectType) {
  const { userAddress, contractAddress, chainId } = storageKeyObject;

  if (
    _inMemoryDecryptionSignatures[userAddress]?.[contractAddress]?.[chainId]
  ) {
    delete _inMemoryDecryptionSignatures[userAddress]?.[contractAddress]?.[
      chainId
    ];
  }
  if (_inMemoryDecryptionSignatures[userAddress]?.[contractAddress]) {
    delete _inMemoryDecryptionSignatures[userAddress]?.[contractAddress];
  }
  delete _inMemoryDecryptionSignatures[userAddress];
}

function _storageKey(storageKeyObject: StorageKeyObjectType): string {
  return `${storageKeyObject.contractAddress}:${storageKeyObject.userAddress}:${storageKeyObject.chainId}`;
}

function _parseStorageKey(
  key: string,
  prefix: string
): StorageKeyObjectType | null {
  if (key.startsWith(prefix + ".")) {
    key = key.substring(prefix.length + 1);
  }
  const parts = key.split(":");

  if (parts.length !== 3) return null;

  const [contractAddress, userAddress, chainIdStr] = parts;

  if (!isAddress(userAddress) || !isAddress(contractAddress)) {
    return null;
  }

  const chainId = parseInt(chainIdStr);
  if (isNaN(chainId) || !Number.isInteger(chainId)) {
    return null;
  }

  return {
    userAddress: userAddress as `0x${string}`,
    contractAddress: contractAddress as `0x${string}`,
    chainId,
  };
}

export function createInMemoryStorage(): Storage {
  const _key = "fhevm.keypairsig";
  return createStorage({
    key: _key,
    storage: {
      async getItem(name) {
        const storageKeyObject: StorageKeyObjectType | null = _parseStorageKey(
          name,
          _key
        );

        if (!storageKeyObject) {
          console.error(`Invalid storage key: ${name}`);
          return;
        }

        const result = _loadFromMemory(storageKeyObject);
        return result ? JSON.stringify(result) : null;
      },
      async setItem(name, value) {
        const storageKeyObject: StorageKeyObjectType | null = _parseStorageKey(
          name,
          _key
        );

        if (!storageKeyObject) {
          console.error(`Invalid storage key: ${name}`);
          return;
        }

        let v = JSON.parse(value);
        if (typeof v === "string") {
          v = JSON.parse(v);
        }

        if (!checkIs(v)) {
          console.error(
            `Invalid storage value: deserialized value is not an FhevmDecryptionSignature`
          );
          return;
        }

        try {
          if (
            storageKeyObject.userAddress !== v.userAddress ||
            !v.contractAddresses.includes(storageKeyObject.contractAddress) ||
            storageKeyObject.chainId !== v.chainId
          ) {
            console.error(
              `Invalid storage, (userAddress,contractAddres,chainId) tupple mismatch.`
            );
            throw new Error();
          }

          _storeInMemory(storageKeyObject, v);
        } catch {
          // invalid JSON
        }
      },
      async removeItem(name) {
        const storageKeyObject: StorageKeyObjectType | null = _parseStorageKey(
          name,
          _key
        );
        if (!storageKeyObject) {
          console.error(`Invalid storage key: ${name}`);
          return;
        }

        _deleteFromMemory(storageKeyObject);
      },
    },
  });
}

export async function loadFromStorage(
  parameters: {
    contractAddresses: `0x${string}`[];
    userAddress: `0x${string}`;
    chainId: number;
  },
  storage: Storage
): Promise<FhevmDecryptionSignature[]> {
  const promises = parameters.contractAddresses.map(
    (contractAddress: `0x${string}`) => {
      return _loadSingleFromStorage(
        {
          contractAddress,
          userAddress: parameters.userAddress,
          chainId: parameters.chainId,
        },
        storage
      );
    }
  );

  return (await Promise.all(promises)).filter((result) => result !== null);
}

async function _loadSingleFromStorage(
  storageKeyObject: StorageKeyObjectType,
  storage: Storage
): Promise<FhevmDecryptionSignature | null> {
  try {
    if (
      !storageKeyObject ||
      !isAddress(storageKeyObject.contractAddress) ||
      !isAddress(storageKeyObject.userAddress) ||
      !Number.isInteger(storageKeyObject.chainId)
    ) {
      console.error(`Could not load signature: invalid arguments`);
      return null;
    }

    const key = _storageKey(storageKeyObject as StorageKeyObjectType);
    const result = await storage.getItem(key);

    if (!result) {
      console.error(`Could not load signature! key=${key}`);
      return null;
    }

    let kps: FhevmDecryptionSignature;
    if (typeof result === "object") {
      kps = result as FhevmDecryptionSignature;
    } else if (typeof result === "string") {
      kps = JSON.parse(result);
    } else {
      console.error(
        `Could not load signature! key=${key}, unexpected result type.`
      );
      return null;
    }

    if (!kps) {
      return null;
    }

    if (
      _timestampNow() >=
      kps.startTimestamp + kps.durationDays * 24 * 60 * 60
    ) {
      console.error(`signature expired! key=${key}`);
      return null;
    }

    console.log(`signature loaded! key=${key}`);

    return kps;
  } catch {
    console.error(`loadFromStorage failed!`);
    return null;
  }
}

export async function saveToStorage(
  decryptionSignature: FhevmDecryptionSignature,
  storage: Storage
) {
  try {
    const value = JSON.stringify(decryptionSignature);
    const promises = decryptionSignature.contractAddresses.map(
      (ca: `0x${string}`) => {
        const key = _storageKey({
          contractAddress: ca,
          userAddress: decryptionSignature.userAddress,
          chainId: decryptionSignature.chainId,
        });
        return storage.setItem(key, value);
      }
    );
    await Promise.all(promises);
    console.log(
      `signature saved! contracts=${decryptionSignature.contractAddresses.length}`
    );
  } catch {
    console.error("saveToStorage FAILED!");
    //
  }
}

export async function deleteFromStorage(
  storageKeyObject: StorageKeyObjectType,
  storage: Storage
) {
  try {
    const key = _storageKey(storageKeyObject);
    await storage.removeItem(key);
  } catch {
    //
  }
}

export function uniqueContracts(pairs: HandleContractPair[]): `0x${string}`[] {
  const uniqueSet = new Set<`0x${string}`>();
  for (const pair of pairs) {
    uniqueSet.add(pair.contractAddress as `0x${string}`);
  }
  return Array.from(uniqueSet);
}

export function handleToString(handle: Uint8Array | string): `0x${string}` {
  if (typeof handle === "string") {
    if (handle.startsWith("0x")) {
      return handle as `0x${string}`;
    }
    return ("0x" + handle) as `0x${string}`;
  }
  return toBeHex(toBigInt(handle), 32) as `0x${string}`;
}

export function filterUncachedPairs(
  pairs: HandleContractPair[],
  cache: DecryptedResults | undefined | null
): StringHandleContractPair[] {
  const strPairs: { handle: string; contractAddress: string }[] = pairs.map(
    (p) => {
      return {
        handle: handleToString(p.handle),
        contractAddress: p.contractAddress,
      };
    }
  );
  if (!cache) {
    return strPairs;
  }
  return strPairs.filter(
    (p) => !Object.hasOwnProperty.call(cache, handleToString(p.handle))
  );
}

export function groupHandlesByContract(
  pairs: HandleContractPair[]
): Record<string, (Uint8Array | string)[]> {
  if (pairs.length === 0) {
    return {};
  }
  if (pairs.length === 1) {
    const { contractAddress, handle } = pairs[0];
    return {
      [contractAddress]: [handle],
    };
  }

  const temp: Record<string, Set<Uint8Array | string>> = {};

  for (const { contractAddress, handle } of pairs) {
    if (!temp[contractAddress]) {
      temp[contractAddress] = new Set();
    }
    temp[contractAddress].add(handle);
  }

  const result: Record<string, (Uint8Array | string)[]> = {};
  for (const [contractAddress, handlesSet] of Object.entries(temp)) {
    result[contractAddress] = Array.from(handlesSet);
  }

  return result;
}

export function findMinimalSignatureSet(
  signatures: FhevmDecryptionSignature[],
  targetContracts: `0x${string}`[]
): {
  signatures: {
    signature: FhevmDecryptionSignature;
    contracts: `0x${string}`[];
  }[];
  contractsToSignature: Record<`0x${string}`, FhevmDecryptionSignature>;
} | null {
  const remainingContracts = new Set(targetContracts);
  const selectedSignatures: {
    signature: FhevmDecryptionSignature;
    contracts: `0x${string}`[];
  }[] = [];

  const contractsToSignature: Record<`0x${string}`, FhevmDecryptionSignature> =
    {};
  while (remainingContracts.size > 0) {
    // Find signature that covers the most uncovered contracts
    let bestSignature: FhevmDecryptionSignature | undefined;
    let bestCovered = 0;
    let bestCoveredContracts: `0x${string}`[] | undefined;

    for (const sig of signatures) {
      const coveredContracts = sig.contractAddresses.filter((addr) =>
        remainingContracts.has(addr)
      );
      const covered = coveredContracts.length;

      if (covered > bestCovered) {
        bestCovered = covered;
        bestSignature = sig;
        bestCoveredContracts = coveredContracts;
      }
    }

    if (!bestSignature || !bestCoveredContracts) {
      return null;
    }

    selectedSignatures.push({
      signature: bestSignature,
      contracts: bestCoveredContracts,
    });

    for (const addr of bestSignature.contractAddresses) {
      remainingContracts.delete(addr);
      contractsToSignature[addr] = bestSignature;
    }
  }

  return { signatures: selectedSignatures, contractsToSignature };
}
