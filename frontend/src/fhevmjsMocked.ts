import { ethers, JsonRpcProvider } from 'ethers';
import { isAddress } from 'web3-validator';
import { toBigIntBE } from 'bigint-buffer';

export const reencryptRequestMocked = async (
  handle: bigint,
  privateKey: string,
  publicKey: string,
  signature: string,
  contractAddress: string,
  userAddress: string,
) => {
  // Signature checking:
  const domain = {
    name: 'Authorization token',
    version: '1',
    chainId: 31337,
    verifyingContract: contractAddress,
  };
  const types = {
    Reencrypt: [{ name: 'publicKey', type: 'bytes' }],
  };
  const value = {
    publicKey: `0x${publicKey}`,
  };
  const signerAddress = ethers.verifyTypedData(
    domain,
    types,
    value,
    `0x${signature}`,
  );
  const normalizedSignerAddress = ethers.getAddress(signerAddress);
  const normalizedUserAddress = ethers.getAddress(userAddress);
  if (normalizedSignerAddress !== normalizedUserAddress) {
    throw new Error('Invalid EIP-712 signature!');
  }

  // ACL checking
  const provider = new JsonRpcProvider('http://127.0.0.1:8545');
  const acl = new ethers.Contract(
    import.meta.env.VITE_ACL_ADDRESS,
    ['function persistAllowed(uint256,address) external view returns (bool)'],
    provider,
  );

  const userAllowed = await acl.persistAllowed(handle, userAddress);

  const contractAllowed = await acl.persistAllowed(handle, contractAddress);
  if (!userAllowed) {
    throw new Error('User is not authorized to reencrypt this handle!');
  }
  if (!contractAllowed) {
    throw new Error(
      'dApp contract is not authorized to reencrypt this handle!',
    );
  }
  if (userAddress === contractAddress) {
    throw new Error(
      'userAddress should not be equal to contractAddress when requesting reencryption!',
    );
  }
  return BigInt(await getClearText(handle));
};

const getClearText = async (handleBigInt: bigint): Promise<string> => {
  const handle = handleBigInt.toString();
  const { status, result, message } = await fetch(
    'http://localhost:3000/get-clear-text',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle }),
    },
  ).then((res) => res.json());

  if (status === 'error') throw new Error(message);
  return result;
};

const ENCRYPTION_TYPES = {
  2: 0, // ebool takes 2 bits
  4: 1,
  8: 2,
  16: 3,
  32: 4,
  64: 5,
  128: 6,
  160: 7,
  256: 8,
  512: 9,
  1024: 10,
  2048: 11,
};

const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);

function bytesToBigInt(byteArray: Uint8Array): bigint {
  if (!byteArray || byteArray?.length === 0) {
    return BigInt(0);
  }
  const buffer = Buffer.from(byteArray);
  const result = toBigIntBE(buffer);
  return result;
}

const checkEncryptedValue = (value: number | bigint, bits: number) => {
  if (value == null) throw new Error('Missing value');
  let limit;
  if (bits >= 8) {
    limit = BigInt(
      `0x${new Array(bits / 8).fill(null).reduce((v) => `${v}ff`, '')}`,
    );
  } else {
    limit = BigInt(2 ** bits - 1);
  }
  if (typeof value !== 'number' && typeof value !== 'bigint')
    throw new Error('Value must be a number or a bigint.');
  if (value > limit) {
    throw new Error(
      `The value exceeds the limit for ${bits}bits integer (${limit.toString()}).`,
    );
  }
};

export const createEncryptedInputMocked = (
  contractAddress: string,
  userAddress: string,
) => {
  if (!isAddress(contractAddress)) {
    throw new Error('Contract address is not a valid address.');
  }

  if (!isAddress(userAddress)) {
    throw new Error('User address is not a valid address.');
  }

  const values: bigint[] = [];
  const bits: (keyof typeof ENCRYPTION_TYPES)[] = [];
  return {
    addBool(value: boolean | number | bigint) {
      if (value == null) throw new Error('Missing value');
      if (
        typeof value !== 'boolean' &&
        typeof value !== 'number' &&
        typeof value !== 'bigint'
      )
        throw new Error('The value must be a boolean, a number or a bigint.');
      if (
        (typeof value !== 'bigint' || typeof value !== 'number') &&
        Number(value) > 1
      )
        throw new Error('The value must be 1 or 0.');
      values.push(BigInt(value));
      bits.push(2); // ebool takes 2 bits instead of one: only exception in TFHE-rs
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    add4(value: number | bigint) {
      checkEncryptedValue(value, 4);
      values.push(BigInt(value));
      bits.push(4);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    add8(value: number | bigint) {
      checkEncryptedValue(value, 8);
      values.push(BigInt(value));
      bits.push(8);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    add16(value: number | bigint) {
      checkEncryptedValue(value, 16);
      values.push(BigInt(value));
      bits.push(16);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    add32(value: number | bigint) {
      checkEncryptedValue(value, 32);
      values.push(BigInt(value));
      bits.push(32);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    add64(value: number | bigint) {
      checkEncryptedValue(value, 64);
      values.push(BigInt(value));
      bits.push(64);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    add128(value: number | bigint) {
      checkEncryptedValue(value, 128);
      values.push(BigInt(value));
      bits.push(128);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    addAddress(value: string) {
      if (!isAddress(value)) {
        throw new Error('The value must be a valid address.');
      }
      values.push(BigInt(value));
      bits.push(160);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    add256(value: number | bigint) {
      checkEncryptedValue(value, 256);
      values.push(BigInt(value));
      bits.push(256);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    addBytes64(value: Uint8Array) {
      if (value.length !== 64)
        throw Error(
          'Uncorrect length of input Uint8Array, should be 64 for an ebytes64',
        );
      const bigIntValue = bytesToBigInt(value);
      checkEncryptedValue(bigIntValue, 512);
      values.push(bigIntValue);
      bits.push(512);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    addBytes128(value: Uint8Array) {
      if (value.length !== 128)
        throw Error(
          'Uncorrect length of input Uint8Array, should be 128 for an ebytes128',
        );
      const bigIntValue = bytesToBigInt(value);
      checkEncryptedValue(bigIntValue, 1024);
      values.push(bigIntValue);
      bits.push(1024);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    addBytes256(value: Uint8Array) {
      if (value.length !== 256)
        throw Error(
          'Uncorrect length of input Uint8Array, should be 256 for an ebytes256',
        );
      const bigIntValue = bytesToBigInt(value);
      checkEncryptedValue(bigIntValue, 2048);
      values.push(bigIntValue);
      bits.push(2048);
      if (sum(bits) > 2048)
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      if (bits.length > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
      return this;
    },
    getValues() {
      return values;
    },
    getBits() {
      return bits;
    },
    resetValues() {
      values.length = 0;
      bits.length = 0;
      return this;
    },
    async encrypt() {
      const res = await encryptValues(
        values,
        bits,
        userAddress,
        contractAddress,
      );

      return res;
    },
  };
};

const encryptValues = async (
  values: bigint[],
  bits: (keyof typeof ENCRYPTION_TYPES)[],
  userAddress: string,
  contractAddress: string,
): Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }> => {
  const response = await fetch('http://localhost:3000/encrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      values: values.map((v) => v.toString()),
      bits,
      userAddress,
      contractAddress,
    }),
  });

  const data = await response.json();
  if (data.status === 'error') throw new Error(data.message);

  return {
    handles: data.handles.map((h) => ethers.getBytes(h)),
    inputProof: ethers.getBytes(data.inputProof),
  };
};
