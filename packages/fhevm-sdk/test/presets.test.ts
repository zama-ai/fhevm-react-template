import { describe, it, expect } from "vitest";
import {
  getNetworkPreset,
  hasNetworkPreset,
  getAvailableNetworks,
  LOCALHOST_PRESET,
  SEPOLIA_PRESET,
} from "../src/core/presets";

describe("Network Presets", () => {
  describe("LOCALHOST_PRESET", () => {
    it("should have correct configuration", () => {
      expect(LOCALHOST_PRESET.name).toBe("localhost");
      expect(LOCALHOST_PRESET.chainId).toBe(31337);
      expect(LOCALHOST_PRESET.rpcUrl).toBe("http://localhost:8545");
      expect(LOCALHOST_PRESET.mockChains).toEqual({
        31337: "http://localhost:8545",
      });
    });
  });

  describe("SEPOLIA_PRESET", () => {
    it("should have correct configuration", () => {
      expect(SEPOLIA_PRESET.name).toBe("sepolia");
      expect(SEPOLIA_PRESET.chainId).toBe(11155111);
      expect(SEPOLIA_PRESET.rpcUrl).toContain("sepolia");
    });
  });

  describe("getNetworkPreset", () => {
    it("should return localhost preset", () => {
      const preset = getNetworkPreset("localhost");
      expect(preset).toEqual(LOCALHOST_PRESET);
    });

    it("should return sepolia preset", () => {
      const preset = getNetworkPreset("sepolia");
      expect(preset).toEqual(SEPOLIA_PRESET);
    });

    it("should be case insensitive", () => {
      const preset1 = getNetworkPreset("LOCALHOST");
      const preset2 = getNetworkPreset("Localhost");
      const preset3 = getNetworkPreset("localhost");

      expect(preset1).toEqual(LOCALHOST_PRESET);
      expect(preset2).toEqual(LOCALHOST_PRESET);
      expect(preset3).toEqual(LOCALHOST_PRESET);
    });

    it("should throw error for unknown preset", () => {
      expect(() => getNetworkPreset("unknown")).toThrow();
      expect(() => getNetworkPreset("unknown")).toThrow("not found");
    });

    it("should list available presets in error message", () => {
      try {
        getNetworkPreset("unknown");
      } catch (error) {
        expect((error as Error).message).toContain("localhost");
        expect((error as Error).message).toContain("sepolia");
      }
    });
  });

  describe("hasNetworkPreset", () => {
    it("should return true for existing presets", () => {
      expect(hasNetworkPreset("localhost")).toBe(true);
      expect(hasNetworkPreset("sepolia")).toBe(true);
    });

    it("should return false for non-existing presets", () => {
      expect(hasNetworkPreset("unknown")).toBe(false);
      expect(hasNetworkPreset("mainnet")).toBe(false);
    });

    it("should be case insensitive", () => {
      expect(hasNetworkPreset("LOCALHOST")).toBe(true);
      expect(hasNetworkPreset("Localhost")).toBe(true);
      expect(hasNetworkPreset("SEPOLIA")).toBe(true);
    });
  });

  describe("getAvailableNetworks", () => {
    it("should return array of network names", () => {
      const networks = getAvailableNetworks();
      expect(Array.isArray(networks)).toBe(true);
      expect(networks.length).toBeGreaterThan(0);
    });

    it("should include localhost and sepolia", () => {
      const networks = getAvailableNetworks();
      expect(networks).toContain("localhost");
      expect(networks).toContain("sepolia");
    });
  });
});

