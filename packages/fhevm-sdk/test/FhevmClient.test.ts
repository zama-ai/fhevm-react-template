import { describe, it, expect, beforeEach, vi } from "vitest";
import { FhevmClient, createFhevmClient, FhevmError } from "../src/core";

describe("FhevmClient", () => {
  describe("constructor", () => {
    it("should create a client instance", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
        mockChains: { 31337: "http://localhost:8545" },
      });

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(FhevmClient);
    });

    it("should initialize with idle status", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
      });

      expect(client.getStatus()).toBe("idle");
      expect(client.isReady()).toBe(false);
    });
  });

  describe("getStatus", () => {
    it("should return current status", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
      });

      expect(client.getStatus()).toBe("idle");
    });
  });

  describe("isReady", () => {
    it("should return false when not initialized", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
      });

      expect(client.isReady()).toBe(false);
    });
  });

  describe("getInstance", () => {
    it("should return undefined when not initialized", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
      });

      expect(client.getInstance()).toBeUndefined();
    });
  });

  describe("createEncryptedInput", () => {
    it("should throw error when not initialized", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
      });

      expect(() => {
        client.createEncryptedInput("0x1234567890123456789012345678901234567890", "0x1234567890123456789012345678901234567890");
      }).toThrow(FhevmError);

      try {
        client.createEncryptedInput("0x1234567890123456789012345678901234567890", "0x1234567890123456789012345678901234567890");
      } catch (error) {
        expect(error).toBeInstanceOf(FhevmError);
        expect((error as FhevmError).code).toBe("NOT_INITIALIZED");
      }
    });
  });

  describe("abort", () => {
    it("should not throw when called", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
      });

      expect(() => client.abort()).not.toThrow();
    });
  });

  describe("dispose", () => {
    it("should reset client to idle state", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
      });

      client.dispose();

      expect(client.getStatus()).toBe("idle");
      expect(client.getInstance()).toBeUndefined();
      expect(client.isReady()).toBe(false);
    });
  });

  describe("FhevmError", () => {
    it("should create error with code and message", () => {
      const error = new FhevmError("TEST_ERROR", "Test error message");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FhevmError);
      expect(error.code).toBe("TEST_ERROR");
      expect(error.message).toBe("Test error message");
      expect(error.name).toBe("FhevmError");
    });

    it("should create error with suggestion", () => {
      const error = new FhevmError(
        "TEST_ERROR",
        "Test error message",
        "Try this solution"
      );

      expect(error.suggestion).toBe("Try this solution");
    });

    it("should format error message with suggestion", () => {
      const error = new FhevmError(
        "TEST_ERROR",
        "Test error message",
        "Try this solution"
      );

      const formatted = error.toString();
      expect(formatted).toContain("FhevmError");
      expect(formatted).toContain("TEST_ERROR");
      expect(formatted).toContain("Test error message");
      expect(formatted).toContain("💡 Suggestion");
      expect(formatted).toContain("Try this solution");
    });

    it("should format error message without suggestion", () => {
      const error = new FhevmError("TEST_ERROR", "Test error message");

      const formatted = error.toString();
      expect(formatted).toContain("FhevmError");
      expect(formatted).toContain("TEST_ERROR");
      expect(formatted).toContain("Test error message");
      expect(formatted).not.toContain("💡 Suggestion");
    });
  });
});

describe("createFhevmClient", () => {
  it("should be a function", () => {
    expect(typeof createFhevmClient).toBe("function");
  });

  it("should return a promise", () => {
    const mockProvider = "http://localhost:8545";
    const result = createFhevmClient({
      provider: mockProvider,
      mockChains: { 31337: "http://localhost:8545" },
    });

    expect(result).toBeInstanceOf(Promise);
    
    // Clean up - abort the initialization
    result.then(client => client.abort()).catch(() => {});
  });
});

