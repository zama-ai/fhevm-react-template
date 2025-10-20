import { describe, it, expect, vi } from "vitest";
import { createApp, defineComponent, h } from "vue";
import type { Signer } from "ethers";
import { provideInMemoryStorage, useInMemoryStorage, useFHEEncryption } from "../src/vue";

describe("vue exports", () => {
  it("provides and consumes in-memory storage", () => {
    const results: Array<string | null> = [];

    const Child = defineComponent({
      name: "ChildConsumer",
      setup() {
  const { storage } = useInMemoryStorage();
  results.push(storage.getItem("demo") as string | null);
        return () => null;
      },
    });

    const Parent = defineComponent({
      name: "ParentProvider",
      setup() {
        const { storage } = provideInMemoryStorage();
        storage.setItem("demo", "value");
        return () => h(Child);
      },
    });

    const app = createApp(Parent);
  const mountPoint = globalThis.document.createElement("div");
    app.mount(mountPoint);

    expect(results).toEqual(["value"]);

    app.unmount();
  });

  it("encryptWith delegates to provided instance", async () => {
    const encryptionResult = { handles: [new Uint8Array([1])], inputProof: new Uint8Array([2]) };
    const encryptMock = vi.fn(async () => encryptionResult);
    const createEncryptedInput = vi.fn(() => ({ encrypt: encryptMock }));

    const instance = {
      createEncryptedInput,
    } as unknown as { createEncryptedInput: (contractAddress: `0x${string}`, userAddress: string) => unknown };

    const signer = {
      getAddress: vi.fn(async () => "0x0000000000000000000000000000000000000001"),
    } as unknown as Signer;

    const { canEncrypt, encryptWith } = useFHEEncryption({
      instance,
      ethersSigner: signer,
      contractAddress: "0x0000000000000000000000000000000000000001",
    });

    expect(canEncrypt.value).toBe(true);

    const buildFn = vi.fn();
    const result = await encryptWith(buildFn);

    expect(buildFn).toHaveBeenCalledTimes(1);
    expect(encryptMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(encryptionResult);
  });
});
