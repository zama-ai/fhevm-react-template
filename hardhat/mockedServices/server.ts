import { toBufferBE } from "bigint-buffer";
import cors from "cors";
import crypto from "crypto";
import { JsonRpcProvider, Wallet, ethers } from "ethers";
import express, { Request, Response } from "express";
import { Keccak } from "sha3";

import {
  ACL_ADDRESS,
  INPUTVERIFIER_ADDRESS,
  KMSVERIFIER_ADDRESS,
  PRIVATE_KEY_COPROCESSOR_ACCOUNT,
  PRIVATE_KEY_KMS_SIGNER,
} from "../test/constants";
import { initGateway } from "./asyncDecrypt";
import { awaitCoprocessor, getClearText, insertSQL } from "./coprocessorUtils";

const provider = new JsonRpcProvider("http://127.0.0.1:8545");

enum Types {
  ebool = 0,
  euint4,
  euint8,
  euint16,
  euint32,
  euint64,
  euint128,
  eaddress,
  euint256,
  ebytes64,
  ebytes128,
  ebytes256,
}

interface ApiSuccessResponse {
  status: "success";
  result: string;
}

interface ApiErrorResponse {
  status: "error";
  message: string;
}

function numberToHex(num: number) {
  const hex = num.toString(16);
  return hex.length % 2 ? "0" + hex : hex;
}

function uint8ArrayToHexString(uint8Array: Uint8Array) {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

app.post("/get-clear-text", async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { handle } = req.body;

    if (!handle || typeof handle !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Handle must be provided as a string",
      });
    }

    let bigintHandle: bigint;
    try {
      bigintHandle = BigInt(handle);
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: "Invalid bigint format",
      });
    }

    await awaitCoprocessor();
    const result = await getClearText(bigintHandle);

    res.json({
      status: "success",
      result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      status: "error",
      message: errorMessage,
    });
  }
});

export const ENCRYPTION_TYPES = {
  2: 0,
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

type EncryptionKey = keyof typeof ENCRYPTION_TYPES;

interface EncryptRequest {
  values: string[];
  bits: EncryptionKey[];
}

interface EncryptResponse {
  status: "success" | "error";
  handles?: Uint8Array[];
  inputProof?: string;
  message?: string;
}

async function encrypt(
  values: bigint[],
  bits: EncryptionKey[],
  userAddress: string,
  contractAddress: string,
): Promise<{ handles: string[]; inputProof: string }> {
  let encrypted = Buffer.alloc(0);

  bits.map((v, i) => {
    encrypted = Buffer.concat([encrypted, createUintToUint8ArrayFunction(v)(values[i])]);
  });

  const encryptedArray = new Uint8Array(encrypted);
  const hash = new Keccak(256).update(Buffer.from(encryptedArray)).digest();

  const handles = bits.map((v, i) => {
    const dataWithIndex = new Uint8Array(hash.length + 1);
    dataWithIndex.set(hash, 0);
    dataWithIndex.set([i], hash.length);
    const finalHash = new Keccak(256).update(Buffer.from(dataWithIndex)).digest();
    const dataInput = new Uint8Array(32);
    dataInput.set(finalHash, 0);
    dataInput.set([i, ENCRYPTION_TYPES[v], 0], 29);
    return dataInput;
  });
  let inputProof = "0x" + numberToHex(handles.length); // for coprocessor : numHandles + numSignersKMS + hashCT + list_handles + signatureCopro + signatureKMSSigners (total len : 1+1+32+NUM_HANDLES*32+65+65*numSignersKMS)
  const numSigners = 1; // @note: only 1 signer in mocked mode for the moment
  inputProof += numberToHex(numSigners);
  inputProof += hash.toString("hex");

  const listHandlesStr = handles.map((i) => uint8ArrayToHexString(i));
  listHandlesStr.map((handle) => (inputProof += handle));
  const listHandles = listHandlesStr.map((i) => BigInt("0x" + i));
  const sigCoproc = await computeInputSignatureCopro(
    "0x" + hash.toString("hex"),
    listHandles,
    userAddress,
    contractAddress,
  );
  inputProof += sigCoproc.slice(2);

  const signaturesKMS = await computeInputSignaturesKMS("0x" + hash.toString("hex"), userAddress, contractAddress);
  signaturesKMS.map((sigKMS) => (inputProof += sigKMS.slice(2)));
  listHandlesStr.map((handle, i) => insertSQL("0x" + handle, values[i]));
  return {
    handles: listHandlesStr.map((i) => "0x" + i),
    inputProof,
  };
}

app.post("/encrypt", async (req: Request<{}, {}, EncryptRequest>, res: Response<EncryptResponse>) => {
  try {
    const { values, bits, userAddress, contractAddress } = req.body;

    const bigintValues: bigint[] = [];

    for (const value of values) {
      bigintValues.push(BigInt(value));
    }
    const result = await encrypt(bigintValues, bits, userAddress, contractAddress);

    res.json({
      status: "success",
      handles: result.handles,
      inputProof: result.inputProof,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      status: "error",
      message: errorMessage,
    });
  }
});

function createUintToUint8ArrayFunction(numBits: number) {
  const numBytes = Math.ceil(numBits / 8);
  return function (uint: number | bigint | boolean) {
    const buffer = toBufferBE(BigInt(uint), numBytes);

    // concatenate 32 random bytes at the end of buffer to simulate encryption noise
    const randomBytes = crypto.randomBytes(32);
    const combinedBuffer = Buffer.concat([buffer, randomBytes]);

    let byteBuffer;
    let totalBuffer;

    switch (numBits) {
      case 2: // ebool takes 2 bits
        byteBuffer = Buffer.from([Types.ebool]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 4:
        byteBuffer = Buffer.from([Types.euint4]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 8:
        byteBuffer = Buffer.from([Types.euint8]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 16:
        byteBuffer = Buffer.from([Types.euint16]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 32:
        byteBuffer = Buffer.from([Types.euint32]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 64:
        byteBuffer = Buffer.from([Types.euint64]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 128:
        byteBuffer = Buffer.from([Types.euint128]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 160:
        byteBuffer = Buffer.from([Types.eaddress]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 256:
        byteBuffer = Buffer.from([Types.euint256]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 512:
        byteBuffer = Buffer.from([Types.ebytes64]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 1024:
        byteBuffer = Buffer.from([Types.ebytes128]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      case 2048:
        byteBuffer = Buffer.from([Types.ebytes256]);
        totalBuffer = Buffer.concat([byteBuffer, combinedBuffer]);
        break;
      default:
        throw Error("Non-supported numBits");
    }

    return totalBuffer;
  };
}

async function computeInputSignatureCopro(
  hash: string,
  handlesList: bigint[],
  userAddress: string,
  contractAddress: string,
): Promise<string> {
  const privKeySigner = PRIVATE_KEY_COPROCESSOR_ACCOUNT;
  const coprocSigner = new Wallet(privKeySigner).connect(provider);
  const signature = await coprocSign(hash, handlesList, userAddress, contractAddress, coprocSigner);
  return signature;
}

async function computeInputSignaturesKMS(
  hash: string,
  userAddress: string,
  contractAddress: string,
): Promise<string[]> {
  const signatures: string[] = [];
  const numSigners = 1; // @note: only 1 KMS signer in mocked mode for now
  for (let idx = 0; idx < numSigners; idx++) {
    const privKeySigner = PRIVATE_KEY_KMS_SIGNER;
    const kmsSigner = new ethers.Wallet(privKeySigner).connect(provider);
    const signature = await kmsSign(hash, userAddress, contractAddress, kmsSigner);
    signatures.push(signature);
  }
  return signatures;
}

async function coprocSign(
  hashOfCiphertext: string,
  handlesList: bigint[],
  userAddress: string,
  contractAddress: string,
  signer: Wallet,
): Promise<string> {
  const inputAdd = INPUTVERIFIER_ADDRESS;
  const chainId = 31337;
  const aclAdd = ACL_ADDRESS;

  const domain = {
    name: "InputVerifier",
    version: "1",
    chainId: chainId,
    verifyingContract: inputAdd,
  };

  const types = {
    CiphertextVerificationForCopro: [
      {
        name: "aclAddress",
        type: "address",
      },
      {
        name: "hashOfCiphertext",
        type: "bytes32",
      },
      {
        name: "handlesList",
        type: "uint256[]",
      },
      {
        name: "userAddress",
        type: "address",
      },
      {
        name: "contractAddress",
        type: "address",
      },
    ],
  };
  const message = {
    aclAddress: aclAdd,
    hashOfCiphertext: hashOfCiphertext,
    handlesList: handlesList,
    userAddress: userAddress,
    contractAddress: contractAddress,
  };

  const signature = await signer.signTypedData(domain, types, message);
  const sigRSV = ethers.Signature.from(signature);
  const v = 27 + sigRSV.yParity;
  const r = sigRSV.r;
  const s = sigRSV.s;

  const result = r + s.substring(2) + v.toString(16);
  return result;
}

async function kmsSign(
  hashOfCiphertext: string,
  userAddress: string,
  contractAddress: string,
  signer: Wallet,
): Promise<string> {
  const kmsVerifierAdd = KMSVERIFIER_ADDRESS;
  const chainId = 31337;
  const aclAdd = ACL_ADDRESS;

  const domain = {
    name: "KMSVerifier",
    version: "1",
    chainId: chainId,
    verifyingContract: kmsVerifierAdd,
  };

  const types = {
    CiphertextVerificationForKMS: [
      {
        name: "aclAddress",
        type: "address",
      },
      {
        name: "hashOfCiphertext",
        type: "bytes32",
      },
      {
        name: "userAddress",
        type: "address",
      },
      {
        name: "contractAddress",
        type: "address",
      },
    ],
  };
  const message = {
    aclAddress: aclAdd,
    hashOfCiphertext: hashOfCiphertext,
    userAddress: userAddress,
    contractAddress: contractAddress,
  };

  const signature = await signer.signTypedData(domain, types, message);
  const sigRSV = ethers.Signature.from(signature);
  const v = 27 + sigRSV.yParity;
  const r = sigRSV.r;
  const s = sigRSV.s;

  const result = r + s.substring(2) + v.toString(16);
  return result;
}

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  await initGateway();
});
