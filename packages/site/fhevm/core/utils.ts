import { isAddress, toBeHex, toBigInt } from "ethers";
import type { BigNumberish } from "ethers";

export function _assert(
  condition: unknown,
  message?: string
): asserts condition {
  if (!condition) {
    throw new Error(
      message ? `Assertion failed: ${message}` : `Assertion failed`
    );
  }
}

export function asNonEmpty<T>(array: T[]): [T, ...T[]] {
  if (array.length === 0) throw new Error("Expected non-empty array");
  return array as [T, ...T[]];
}

export function isArrayOfAddresses(
  value: unknown
): value is [`0x${string}`, ...`0x${string}`[]] {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return false;
  }
  for (let i = 0; i < value.length; ++i) {
    if (!isAddress(value[i])) {
      return false;
    }
  }
  return true;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toBytes32Str(value: BigNumberish | Uint8Array): `0x${string}` {
  return toBeHex(toBigInt(value), 32) as `0x${string}`;
}

export function toBytesStr(value: BigNumberish | Uint8Array): `0x${string}` {
  return toBeHex(toBigInt(value)) as `0x${string}`;
}
