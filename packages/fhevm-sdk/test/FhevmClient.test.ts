import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FhevmClient } from "../src/core/FhevmClient";

// Mock the createFhevmInstance function
vi.mock("../src/internal/fhevm", () => ({
  createFhevmInstance: vi.fn(),
}));

import { createFhevmInstance } from "../src/internal/fhevm";

describe("FhevmClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create a client with default enabled=true", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      expect(client).toBeDefined();
      expect(client.getStatus()).toBe("idle");
      expect(client.getInstance()).toBeNull();
      expect(client.getError()).toBeNull();
    });

    it("should accept disabled config", () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
        enabled: false,
      });

      expect(client).toBeDefined();
      expect(client.getStatus()).toBe("idle");
    });
  });

  describe("initialize", () => {
    it("should initialize successfully", async () => {
      const mockInstance = { id: "mock-instance" };
      vi.mocked(createFhevmInstance).mockResolvedValue(mockInstance as any);

      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      const instance = await client.initialize();

      expect(instance).toBe(mockInstance);
      expect(client.getStatus()).toBe("ready");
      expect(client.getInstance()).toBe(mockInstance);
      expect(client.getError()).toBeNull();
      expect(client.isReady()).toBe(true);
    });

    it("should handle initialization errors", async () => {
      const mockError = new Error("Initialization failed");
      vi.mocked(createFhevmInstance).mockRejectedValue(mockError);

      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      await expect(client.initialize()).rejects.toThrow("Initialization failed");

      expect(client.getStatus()).toBe("error");
      expect(client.getInstance()).toBeNull();
      expect(client.getError()).toBe(mockError);
      expect(client.isReady()).toBe(false);
    });

    it("should throw error if disabled", async () => {
      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
        enabled: false,
      });

      await expect(client.initialize()).rejects.toThrow("FhevmClient is disabled");
    });

    it("should cancel previous initialization when called multiple times", async () => {
      let resolveCount = 0;
      vi.mocked(createFhevmInstance).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolveCount++;
              resolve({ id: `instance-${resolveCount}` } as any);
            }, 100);
          })
      );

      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      // Start first initialization
      const promise1 = client.initialize();

      // Start second initialization (should cancel first)
      const promise2 = client.initialize();

      // First should be cancelled
      await expect(promise1).rejects.toThrow("cancelled");

      // Second should succeed
      const instance = await promise2;
      expect(instance).toBeDefined();
      expect(client.isReady()).toBe(true);
    });

    it("should update status to loading during initialization", async () => {
      const statusChanges: string[] = [];

      vi.mocked(createFhevmInstance).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ id: "mock-instance" } as any);
            }, 50);
          })
      );

      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      client.on("statusChange", (status) => {
        statusChanges.push(status);
      });

      await client.initialize();

      expect(statusChanges).toContain("loading");
      expect(statusChanges).toContain("ready");
      expect(client.isLoading()).toBe(false);
    });
  });

  describe("event handlers", () => {
    it("should emit statusChange events", async () => {
      const mockInstance = { id: "mock-instance" };
      vi.mocked(createFhevmInstance).mockResolvedValue(mockInstance as any);

      const statusChanges: string[] = [];
      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      client.on("statusChange", (status) => {
        statusChanges.push(status);
      });

      await client.initialize();

      expect(statusChanges).toEqual(["loading", "ready"]);
    });

    it("should emit error events", async () => {
      const mockError = new Error("Test error");
      vi.mocked(createFhevmInstance).mockRejectedValue(mockError);

      const errors: Error[] = [];
      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      client.on("error", (error) => {
        errors.push(error);
      });

      await expect(client.initialize()).rejects.toThrow();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe(mockError);
    });

    it("should allow removing event handlers", async () => {
      const mockInstance = { id: "mock-instance" };
      vi.mocked(createFhevmInstance).mockResolvedValue(mockInstance as any);

      const statusChanges: string[] = [];
      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      const handler = (status: string) => {
        statusChanges.push(status);
      };

      client.on("statusChange", handler);
      client.off("statusChange", handler);

      await client.initialize();

      expect(statusChanges).toHaveLength(0);
    });
  });

  describe("updateConfig", () => {
    it("should update config and re-initialize", async () => {
      const mockInstance1 = { id: "instance-1" };
      const mockInstance2 = { id: "instance-2" };
      vi.mocked(createFhevmInstance)
        .mockResolvedValueOnce(mockInstance1 as any)
        .mockResolvedValueOnce(mockInstance2 as any);

      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      await client.initialize();
      expect(client.getInstance()).toBe(mockInstance1);

      await client.updateConfig({
        chainId: 11155111,
      });

      expect(client.getInstance()).toBe(mockInstance2);
    });
  });

  describe("refresh", () => {
    it("should re-initialize with same config", async () => {
      const mockInstance1 = { id: "instance-1" };
      const mockInstance2 = { id: "instance-2" };
      vi.mocked(createFhevmInstance)
        .mockResolvedValueOnce(mockInstance1 as any)
        .mockResolvedValueOnce(mockInstance2 as any);

      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      await client.initialize();
      expect(client.getInstance()).toBe(mockInstance1);

      await client.refresh();
      expect(client.getInstance()).toBe(mockInstance2);
    });
  });

  describe("destroy", () => {
    it("should clean up all resources", async () => {
      const mockInstance = { id: "mock-instance" };
      vi.mocked(createFhevmInstance).mockResolvedValue(mockInstance as any);

      const statusChanges: string[] = [];
      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      client.on("statusChange", (status) => {
        statusChanges.push(status);
      });

      await client.initialize();
      expect(client.getInstance()).toBe(mockInstance);
      expect(client.getStatus()).toBe("ready");

      client.destroy();

      expect(client.getInstance()).toBeNull();
      expect(client.getStatus()).toBe("idle");
      expect(client.getError()).toBeNull();

      // Event handlers should be cleared
      const initialLength = statusChanges.length;
      await client.initialize().catch(() => {});
      expect(statusChanges.length).toBe(initialLength); // No new events
    });

    it("should cancel ongoing initialization", async () => {
      vi.mocked(createFhevmInstance).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ id: "instance" } as any);
            }, 100);
          })
      );

      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      const promise = client.initialize();
      client.destroy();

      await expect(promise).rejects.toThrow("cancelled");
    });
  });

  describe("getters", () => {
    it("should return correct status values", async () => {
      const mockInstance = { id: "mock-instance" };
      vi.mocked(createFhevmInstance).mockResolvedValue(mockInstance as any);

      const client = new FhevmClient({
        provider: "http://localhost:8545",
        chainId: 31337,
      });

      expect(client.getStatus()).toBe("idle");
      expect(client.isLoading()).toBe(false);
      expect(client.isReady()).toBe(false);

      const promise = client.initialize();
      expect(client.isLoading()).toBe(true);

      await promise;
      expect(client.getStatus()).toBe("ready");
      expect(client.isLoading()).toBe(false);
      expect(client.isReady()).toBe(true);
    });
  });
});

