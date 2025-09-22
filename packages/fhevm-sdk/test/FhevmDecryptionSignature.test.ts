import { describe, it, expect } from "vitest";
import { FhevmDecryptionSignature } from "../src/FhevmDecryptionSignature";

describe("FhevmDecryptionSignature", () => {
  it("checkIs guards shape", () => {
    // @ts-expect-error invalid type
    expect(FhevmDecryptionSignature.checkIs({})).toBe(false);
  });
});

