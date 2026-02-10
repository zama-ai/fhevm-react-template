import { GenericStringStorage } from "./storage/GenericStringStorage";
import { EIP712Type, FhevmDecryptionSignatureType, FhevmInstance } from "./fhevmTypes";
import { ethers } from "ethers";

function isAddress(value: string): value is `0x${string}` {
  return ethers.isAddress(value);
}

function isAddressArray(v: unknown): v is `0x${string}`[] {
  return Array.isArray(v) && v.every(x => isAddress(x));
}

function hasEIP712Shape(e: unknown): e is EIP712Type {
  if (!e || typeof e !== "object") return false;
  const o = e as Record<string, unknown>;
  return (
    typeof o.domain === "object" &&
    o.domain !== null &&
    typeof o.primaryType === "string" &&
    "message" in o &&
    typeof o.types === "object" &&
    o.types !== null
  );
}

function _timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

class FhevmDecryptionSignatureStorageKey {
  #contractAddresses: `0x${string}`[];
  #userAddress: `0x${string}`;
  #publicKey: string | undefined;
  #key: string;

  constructor(
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    userAddress: `0x${string}`,
    publicKey?: string,
  ) {
    const sortedContractAddresses = contractAddresses.sort();

    const emptyEIP712 = instance.createEIP712(publicKey ?? ethers.ZeroAddress, sortedContractAddresses, 0, 0);

    try {
      const hash = ethers.TypedDataEncoder.hash(
        emptyEIP712.domain,
        { UserDecryptRequestVerification: emptyEIP712.types.UserDecryptRequestVerification },
        emptyEIP712.message,
      );

      this.#contractAddresses = sortedContractAddresses;
      this.#userAddress = userAddress;

      this.#key = `${userAddress}:${hash}`;
    } catch (e) {
      throw e as any;
    }
  }

  get key(): string {
    return this.#key;
  }
}

export class FhevmDecryptionSignature {
  #publicKey: string;
  #privateKey: string;
  #signature: string;
  #startTimestamp: number;
  #durationDays: number;
  #userAddress: `0x${string}`;
  #contractAddresses: `0x${string}`[];
  #eip712: EIP712Type;

  private constructor(parameters: FhevmDecryptionSignatureType) {
    if (!FhevmDecryptionSignature.checkIs(parameters)) {
      throw new TypeError("Invalid FhevmDecryptionSignatureType");
    }
    this.#publicKey = parameters.publicKey;
    this.#privateKey = parameters.privateKey;
    this.#signature = parameters.signature;
    this.#startTimestamp = parameters.startTimestamp;
    this.#durationDays = parameters.durationDays;
    this.#userAddress = parameters.userAddress;
    this.#contractAddresses = parameters.contractAddresses;
    this.#eip712 = parameters.eip712;
  }

  public get privateKey() {
    return this.#privateKey;
  }

  public get publicKey() {
    return this.#publicKey;
  }

  public get signature() {
    return this.#signature;
  }

  public get contractAddresses() {
    return this.#contractAddresses;
  }

  public get startTimestamp() {
    return this.#startTimestamp;
  }

  public get durationDays() {
    return this.#durationDays;
  }

  public get userAddress() {
    return this.#userAddress;
  }

  static checkIs(s: unknown): s is FhevmDecryptionSignatureType {
    if (!s || typeof s !== "object") return false;
    const o = s as Record<string, unknown>;
    const checks: [key: string, pred: (v: unknown) => boolean][] = [
      ["publicKey", (v): v is string => typeof v === "string"],
      ["privateKey", (v): v is string => typeof v === "string"],
      ["signature", (v): v is string => typeof v === "string"],
      ["startTimestamp", (v): v is number => typeof v === "number"],
      ["durationDays", (v): v is number => typeof v === "number"],
      ["userAddress", (v): v is `0x${string}` => typeof v === "string" && isAddress(v)],
      ["contractAddresses", isAddressArray],
      ["eip712", hasEIP712Shape],
    ];
    return checks.every(([key, pred]) => key in o && pred(o[key]));
  }

  toJSON() {
    return {
      publicKey: this.#publicKey,
      privateKey: this.#privateKey,
      signature: this.#signature,
      startTimestamp: this.#startTimestamp,
      durationDays: this.#durationDays,
      userAddress: this.#userAddress,
      contractAddresses: this.#contractAddresses,
      eip712: this.#eip712,
    };
  }

  static fromJSON(json: unknown) {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return new FhevmDecryptionSignature(data as any);
  }

  equals(s: FhevmDecryptionSignatureType) {
    return s.signature === this.#signature;
  }

  isValid(): boolean {
    return _timestampNow() < this.#startTimestamp + this.#durationDays * 24 * 60 * 60;
  }

  async saveToGenericStringStorage(storage: GenericStringStorage, instance: FhevmInstance, withPublicKey: boolean) {
    try {
      const value = JSON.stringify(this);

      const storageKey = new FhevmDecryptionSignatureStorageKey(
        instance,
        this.#contractAddresses,
        this.#userAddress,
        withPublicKey ? this.#publicKey : undefined,
      );
      await storage.setItem(storageKey.key, value);
    } catch {
      // ignore
    }
  }

  static async loadFromGenericStringStorage(
    storage: GenericStringStorage,
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    userAddress: `0x${string}`,
    publicKey?: string,
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const storageKey = new FhevmDecryptionSignatureStorageKey(instance, contractAddresses, userAddress, publicKey);

      const result = await storage.getItem(storageKey.key);

      if (!result) {
        return null;
      }

      try {
        const kps = FhevmDecryptionSignature.fromJSON(result);
        if (!kps.isValid()) {
          return null;
        }

        return kps;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  static async new(
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    publicKey: string,
    privateKey: string,
    signer: ethers.JsonRpcSigner,
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const userAddress = (await signer.getAddress()) as `0x${string}`;
      const startTimestamp = _timestampNow();
      const durationDays = 365;
      const eip712 = (instance as any).createEIP712(publicKey, contractAddresses, startTimestamp, durationDays);
      const signature = await (signer as any).signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );
      return new FhevmDecryptionSignature({
        publicKey,
        privateKey,
        contractAddresses,
        startTimestamp,
        durationDays,
        signature,
        eip712: eip712 as EIP712Type,
        userAddress,
      });
    } catch {
      return null;
    }
  }

  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    signer: ethers.JsonRpcSigner,
    storage: GenericStringStorage,
    keyPair?: { publicKey: string; privateKey: string },
  ): Promise<FhevmDecryptionSignature | null> {
    const userAddress = (await signer.getAddress()) as `0x${string}`;

    const cached: FhevmDecryptionSignature | null = await FhevmDecryptionSignature.loadFromGenericStringStorage(
      storage,
      instance,
      contractAddresses,
      userAddress,
      keyPair?.publicKey,
    );

    if (cached) {
      return cached;
    }

    const { publicKey, privateKey } = keyPair ?? (instance as any).generateKeypair();

    const sig = await FhevmDecryptionSignature.new(instance, contractAddresses, publicKey, privateKey, signer);

    if (!sig) {
      return null;
    }

    await sig.saveToGenericStringStorage(storage, instance, Boolean(keyPair?.publicKey));

    return sig;
  }
}
