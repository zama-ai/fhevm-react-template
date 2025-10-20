import { computed, unref } from "vue";
import type { Ref } from "vue";
import type { Signer } from "ethers";
import type { FhevmInstance } from "../fhevmTypes.js";
import type { EncryptResult } from "../internal/encryptionUtils.js";

export { buildParamsFromAbi, getEncryptionMethod, toHex } from "../internal/encryptionUtils.js";
export type { EncryptResult } from "../internal/encryptionUtils.js";

type MaybeRef<T> = T | Ref<T>;

type RelayerEncryptedInputLike = {
  encrypt(): Promise<EncryptResult>;
};

export const useFHEEncryption = (params: {
  instance: MaybeRef<FhevmInstance | undefined>;
  ethersSigner: MaybeRef<Signer | undefined>;
  contractAddress: MaybeRef<`0x${string}` | undefined>;
}) => {
  const instanceRef = computed(() => unref(params.instance));
  const signerRef = computed(() => unref(params.ethersSigner));
  const contractAddressRef = computed(() => unref(params.contractAddress));

  const canEncrypt = computed(() => Boolean(instanceRef.value && signerRef.value && contractAddressRef.value));

  const encryptWith = async (
    buildFn: (builder: RelayerEncryptedInputLike) => void,
  ): Promise<EncryptResult | undefined> => {
    const instance = instanceRef.value;
    const signer = signerRef.value;
    const contractAddress = contractAddressRef.value;

    if (!instance || !signer || !contractAddress) return undefined;

    const userAddress = await signer.getAddress();
    const input = instance.createEncryptedInput(contractAddress, userAddress) as RelayerEncryptedInputLike;
    buildFn(input);
    const enc = await input.encrypt();
    return enc;
  };

  return {
    canEncrypt,
    encryptWith,
  } as const;
};
