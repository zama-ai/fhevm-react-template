import { GenericStringStorage } from "./storage/GenericStringStorage";
import type { FhevmInstance } from "./fhevmTypes";
import { ethers } from "ethers";
import { createSignedPermit } from "@fhevm/sdk/ethers";

function _timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Cached decryption session — bundles an E2E transport key pair
 * with a signed permit so the user only signs once per session.
 */
export type CachedDecryptSession = {
  readonly serializedKeyPair: string;
  readonly publicKey: string;
  readonly signature: string;
  readonly signer: string;
  readonly permit: any;
  readonly startTimestamp: number;
  readonly durationDays: number;
  readonly contractAddresses: readonly string[];
};

function isCachedDecryptSession(s: unknown): s is CachedDecryptSession {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  return (
    typeof o.serializedKeyPair === "string" &&
    typeof o.publicKey === "string" &&
    typeof o.signature === "string" &&
    typeof o.signer === "string" &&
    typeof o.startTimestamp === "number" &&
    typeof o.durationDays === "number" &&
    Array.isArray(o.contractAddresses) &&
    o.permit !== undefined
  );
}

function isSessionValid(session: CachedDecryptSession): boolean {
  return _timestampNow() < session.startTimestamp + session.durationDays * 24 * 60 * 60;
}

function storageKey(contractAddresses: string[], userAddress: string): string {
  const sorted = [...contractAddresses].sort();
  return `fhevm-session:${userAddress}:${sorted.join(",")}`;
}

/**
 * Load a cached session from storage, or create a new one by:
 * 1. Generating an E2E transport key pair
 * 2. Creating a decrypt permit (async, auto-fetches extraData)
 * 3. Signing the permit with the user's wallet
 * 4. Bundling into a SignedPermit via createSignedPermit()
 */
export async function loadOrCreateDecryptSession(
  instance: FhevmInstance,
  contractAddresses: string[],
  signer: ethers.JsonRpcSigner,
  storage: GenericStringStorage,
): Promise<CachedDecryptSession | null> {
  const userAddress = await signer.getAddress();
  const key = storageKey(contractAddresses, userAddress);

  // Try loading from cache
  try {
    const cached = await storage.getItem(key);
    if (cached) {
      const session = typeof cached === "string" ? JSON.parse(cached) : cached;
      if (isCachedDecryptSession(session) && isSessionValid(session)) {
        return session;
      }
    }
  } catch {
    // ignore cache errors
  }

  // Create a new session
  try {
    // 1. Generate E2E transport key pair
    const keyPair = await instance.generateE2eTransportKeyPair();
    const serializedKeyPair = await keyPair.serialize();
    const publicKey = await keyPair.getTkmsPublicKeyHex();

    const startTimestamp = _timestampNow();
    const durationDays = 365;

    // 2. Create decrypt permit (async — auto-fetches extraData)
    const permit = await instance.createDecryptPermit({
      e2eTransportPublicKey: publicKey,
      contractAddresses: contractAddresses as `0x${string}`[],
      startTimestamp,
      durationDays,
    });

    // 3. Sign the permit
    // ethers v6 signTypedData requires EIP712Domain to be excluded from types
    const { EIP712Domain: _, ...typesForSigning } = permit.types as any;
    const signature = await signer.signTypedData(
      permit.domain as any,
      typesForSigning,
      permit.message,
    );

    const session: CachedDecryptSession = {
      serializedKeyPair,
      publicKey,
      signature,
      signer: userAddress,
      permit,
      startTimestamp,
      durationDays,
      contractAddresses,
    };

    // 4. Cache for reuse
    try {
      await storage.setItem(key, JSON.stringify(session));
    } catch {
      // ignore storage errors
    }

    return session;
  } catch (err) {
    console.error("[loadOrCreateDecryptSession] Failed to create session:", err);
    return null;
  }
}

/**
 * Build a SignedPermit from a cached session, ready for client.decrypt().
 */
export function buildSignedPermit(session: CachedDecryptSession) {
  return createSignedPermit(
    session.permit,
    session.signature as any,
    session.signer,
  );
}
