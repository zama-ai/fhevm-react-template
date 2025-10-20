import { computed, ref, shallowRef, unref } from "vue";
import type { Ref } from "vue";
import { ethers } from "ethers";
import { FhevmDecryptionSignature } from "../FhevmDecryptionSignature.js";
import { GenericStringStorage } from "../storage/GenericStringStorage.js";
import type { FhevmInstance } from "../fhevmTypes.js";

export type FHEDecryptRequest = { handle: string; contractAddress: `0x${string}` };

type MaybeRef<T> = T | Ref<T>;

type DecryptResult = Record<string, string | bigint | boolean>;

export const useFHEDecrypt = (params: {
  instance: MaybeRef<FhevmInstance | undefined>;
  ethersSigner: MaybeRef<ethers.JsonRpcSigner | undefined>;
  fhevmDecryptionSignatureStorage: MaybeRef<GenericStringStorage>;
  chainId: MaybeRef<number | undefined>;
  requests: MaybeRef<readonly FHEDecryptRequest[] | undefined>;
}) => {
  const instanceRef = computed(() => unref(params.instance));
  const signerRef = computed(() => unref(params.ethersSigner));
  const storageRef = computed(() => unref(params.fhevmDecryptionSignatureStorage));
  const chainIdRef = computed(() => unref(params.chainId));
  const requestsRef = computed(() => unref(params.requests));

  const isDecrypting = ref(false);
  const message = ref("");
  const results = shallowRef<DecryptResult>({});
  const error = ref<string | null>(null);

  let isDecryptingGuard = false;
  const lastRequestsKey = ref("");

  const requestsKey = computed(() => {
    const requests = requestsRef.value;
    if (!requests || requests.length === 0) return "";

    const sorted = [...requests].sort((a, b) =>
      (a.handle + a.contractAddress).localeCompare(b.handle + b.contractAddress),
    );
    return JSON.stringify(sorted);
  });

  const canDecrypt = computed(() => {
    const instance = instanceRef.value;
    const signer = signerRef.value;
    const requests = requestsRef.value;
    return Boolean(instance && signer && requests && requests.length > 0 && !isDecrypting.value);
  });

  const decrypt = async () => {
    if (isDecryptingGuard) return;

    const instance = instanceRef.value;
    const signer = signerRef.value;
    const requests = requestsRef.value;
    const storage = storageRef.value;
    const chainId = chainIdRef.value;

    if (!instance || !signer || !requests || requests.length === 0) return;

    lastRequestsKey.value = requestsKey.value;

    isDecryptingGuard = true;
    isDecrypting.value = true;
    message.value = "Start decrypt";
    error.value = null;

    const isStale = () =>
      chainId !== chainIdRef.value || signer !== signerRef.value || requestsKey.value !== lastRequestsKey.value;

    try {
  const uniqueAddresses = Array.from(new Set(requests.map((r: FHEDecryptRequest) => r.contractAddress)));
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        uniqueAddresses as `0x${string}`[],
        signer,
        storage,
      );

      if (!sig) {
        message.value = "Unable to build FHEVM decryption signature";
        error.value = "SIGNATURE_ERROR: Failed to create decryption signature";
        return;
      }

      if (isStale()) {
        message.value = "Ignore FHEVM decryption";
        return;
      }

      message.value = "Call FHEVM userDecrypt...";

  const mutableReqs = requests.map((r: FHEDecryptRequest) => ({ handle: r.handle, contractAddress: r.contractAddress }));
      let decryptResult: DecryptResult = {};
      try {
        decryptResult = await instance.userDecrypt(
          mutableReqs,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays,
        );
      } catch (e) {
        const err = e as { name?: string; message?: string } | undefined;
        const code = err && err.name ? err.name : "DECRYPT_ERROR";
        const msg = err && err.message ? err.message : "Decryption failed";
        error.value = `${code}: ${msg}`;
        message.value = "FHEVM userDecrypt failed";
        return;
      }

      message.value = "FHEVM userDecrypt completed!";

      if (isStale()) {
        message.value = "Ignore FHEVM decryption";
        return;
      }

      results.value = decryptResult;
    } catch (e) {
      const err = e as { name?: string; message?: string } | undefined;
      const code = err && err.name ? err.name : "UNKNOWN_ERROR";
      const msg = err && err.message ? err.message : "Unknown error";
      error.value = `${code}: ${msg}`;
      message.value = "FHEVM decryption errored";
    } finally {
      isDecryptingGuard = false;
      isDecrypting.value = false;
      lastRequestsKey.value = requestsKey.value;
    }
  };

  const setMessage = (value: string) => {
    message.value = value;
  };

  const setError = (value: string | null) => {
    error.value = value;
  };

  return {
    canDecrypt,
    decrypt,
    isDecrypting,
    message,
    results,
    error,
    setMessage,
    setError,
  } as const;
};
