import { describe, it, expect } from "vitest";
import {
  FhevmError,
  ErrorCodes,
  createError,
  isFhevmError,
  isErrorCode,
  formatError,
} from "../src/core/errors";

describe("Error Utilities", () => {
  describe("FhevmError", () => {
    it("should create error with code and message", () => {
      const error = new FhevmError("TEST_CODE", "Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.message).toBe("Test message");
      expect(error.name).toBe("FhevmError");
    });

    it("should create error with suggestion", () => {
      const error = new FhevmError(
        "TEST_CODE",
        "Test message",
        "Try this solution"
      );
      expect(error.suggestion).toBe("Try this solution");
    });

    it("should format error with toString", () => {
      const error = new FhevmError("TEST_CODE", "Test message");
      const str = error.toString();
      expect(str).toContain("FhevmError");
      expect(str).toContain("TEST_CODE");
      expect(str).toContain("Test message");
    });

    it("should include suggestion in toString", () => {
      const error = new FhevmError(
        "TEST_CODE",
        "Test message",
        "Try this solution"
      );
      const str = error.toString();
      expect(str).toContain("💡 Suggestion: Try this solution");
    });
  });

  describe("ErrorCodes", () => {
    it("should have NOT_INITIALIZED code", () => {
      expect(ErrorCodes.NOT_INITIALIZED).toBe("NOT_INITIALIZED");
    });

    it("should have INITIALIZATION_FAILED code", () => {
      expect(ErrorCodes.INITIALIZATION_FAILED).toBe("INITIALIZATION_FAILED");
    });

    it("should have INVALID_PROVIDER code", () => {
      expect(ErrorCodes.INVALID_PROVIDER).toBe("INVALID_PROVIDER");
    });

    it("should have ENCRYPTION_FAILED code", () => {
      expect(ErrorCodes.ENCRYPTION_FAILED).toBe("ENCRYPTION_FAILED");
    });
  });

  describe("createError", () => {
    it("should create error with automatic suggestion", () => {
      const error = createError(
        ErrorCodes.NOT_INITIALIZED,
        "Client not initialized"
      );
      expect(error.code).toBe(ErrorCodes.NOT_INITIALIZED);
      expect(error.message).toBe("Client not initialized");
      expect(error.suggestion).toBeDefined();
      expect(error.suggestion).toContain("initialize");
    });

    it("should use custom suggestion when provided", () => {
      const error = createError(
        ErrorCodes.NOT_INITIALIZED,
        "Client not initialized",
        "Custom suggestion"
      );
      expect(error.suggestion).toBe("Custom suggestion");
    });

    it("should include cause when provided", () => {
      const cause = new Error("Original error");
      const error = createError(
        ErrorCodes.NETWORK_ERROR,
        "Network failed",
        undefined,
        cause
      );
      expect(error.cause).toBe(cause);
    });
  });

  describe("isFhevmError", () => {
    it("should return true for FhevmError", () => {
      const error = new FhevmError("TEST", "Test");
      expect(isFhevmError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test");
      expect(isFhevmError(error)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isFhevmError("string")).toBe(false);
      expect(isFhevmError(123)).toBe(false);
      expect(isFhevmError(null)).toBe(false);
      expect(isFhevmError(undefined)).toBe(false);
    });
  });

  describe("isErrorCode", () => {
    it("should return true for matching error code", () => {
      const error = new FhevmError(ErrorCodes.NOT_INITIALIZED, "Test");
      expect(isErrorCode(error, ErrorCodes.NOT_INITIALIZED)).toBe(true);
    });

    it("should return false for non-matching error code", () => {
      const error = new FhevmError(ErrorCodes.NOT_INITIALIZED, "Test");
      expect(isErrorCode(error, ErrorCodes.NETWORK_ERROR)).toBe(false);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test");
      expect(isErrorCode(error, ErrorCodes.NOT_INITIALIZED)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isErrorCode("string", ErrorCodes.NOT_INITIALIZED)).toBe(false);
    });
  });

  describe("formatError", () => {
    it("should format FhevmError with toString", () => {
      const error = new FhevmError("TEST", "Test message", "Suggestion");
      const formatted = formatError(error);
      expect(formatted).toContain("FhevmError");
      expect(formatted).toContain("TEST");
      expect(formatted).toContain("Test message");
      expect(formatted).toContain("💡 Suggestion");
    });

    it("should format regular Error", () => {
      const error = new Error("Test message");
      const formatted = formatError(error);
      expect(formatted).toContain("Error");
      expect(formatted).toContain("Test message");
    });

    it("should format non-error values", () => {
      expect(formatError("string error")).toBe("string error");
      expect(formatError(123)).toBe("123");
    });
  });
});

