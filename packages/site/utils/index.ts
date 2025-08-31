import { toUtf8Bytes, hexlify } from "ethers";

/**
 * Convert string to array of bigints in 31-byte chunks.
 * Each chunk is less than 256 bits for FHE encryption.
 */
export function stringToBigInts(str: string): bigint[] {
  const bytes = toUtf8Bytes(str);
  const chunks: bigint[] = [];

  for (let i = 0; i < bytes.length; i += 31) {
    const chunk = bytes.slice(i, i + 31);
    const hex = hexlify(chunk).substring(2);
    chunks.push(BigInt("0x" + hex));
  }

  return chunks;
}

/**
 * Convert bigint back to string.
 */
export function bigIntToString(bn: bigint): string {
  let hex = bn.toString(16);
  if (hex.length % 2 !== 0) hex = "0" + hex;
  return Buffer.from(hex, "hex").toString("utf8");
}

/**
 * Convert Unix timestamp (seconds) to UTC string.
 */
export function parseUnixToUTC(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}
