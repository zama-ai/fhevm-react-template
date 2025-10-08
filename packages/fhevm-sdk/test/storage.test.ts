import { describe, it, expect } from "vitest";
import { GenericStringInMemoryStorage } from "../src/storage/GenericStringStorage";

describe("GenericStringInMemoryStorage", () => {
  it("sets/gets/removes values", async () => {
    const s = new GenericStringInMemoryStorage();
    s.setItem("k", "v");
    expect(s.getItem("k")).toBe("v");
    s.removeItem("k");
    expect(s.getItem("k")).toBe(null);
  });
});

