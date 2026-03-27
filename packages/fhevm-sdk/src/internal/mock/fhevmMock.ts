//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAYS USE DYNAMIC IMPORT FOR THIS FILE TO AVOID INCLUDING THE ENTIRE
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider, Contract, hexlify } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import { FhevmInstance } from "../../fhevmTypes";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ERC-5267 eip712Domain() ABI - returns the EIP712 domain info
const EIP712_DOMAIN_ABI = [
  "function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)"
];

/**
 * Query a contract's EIP712 domain using ERC-5267 standard
 */
async function getEip712Domain(provider: JsonRpcProvider, contractAddress: string): Promise<{
  chainId: number;
  verifyingContract: string;
}> {
  const contract = new Contract(contractAddress, EIP712_DOMAIN_ABI, provider);
  const domain = await contract.eip712Domain();
  const chainId = Number(domain[3]);
  const verifyingContract = domain[4] as string;
  return { chainId, verifyingContract };
}

/**
 * Wraps a MockFhevmInstance (old relayer-sdk API) to expose the new @fhevm/sdk API
 * so the React hooks can call encrypt(), decrypt(), createDecryptPermit(), etc.
 */
function adaptMockToNewApi(mock: MockFhevmInstance): FhevmInstance {
  const extraData = "0x00";

  const adapted = {
    // Proxy everything from the mock
    ...mock,
    uid: `mock-${mock.chainId}`,
    chain: {} as any,
    runtime: {} as any,
    ready: Promise.resolve() as any,
    init: () => Promise.resolve() as any,
    extend: () => adapted as any,

    // ── encrypt() ──────────────────────────────────────────────────────
    async encrypt(params: {
      contractAddress: string;
      userAddress: string;
      values: Array<{ type: string; value: any }>;
    }) {
      const input = mock.createEncryptedInput(params.contractAddress, params.userAddress);

      for (const v of params.values) {
        switch (v.type) {
          case "bool": input.addBool(v.value); break;
          case "uint8": input.add8(v.value); break;
          case "uint16": input.add16(v.value); break;
          case "uint32": input.add32(v.value); break;
          case "uint64": input.add64(v.value); break;
          case "uint128": input.add128(v.value); break;
          case "uint256": input.add256(v.value); break;
          case "address": input.addAddress(v.value); break;
          default: throw new Error(`Unknown encrypt type: ${v.type}`);
        }
      }

      const encrypted = await input.encrypt();

      // Map old format to new format
      const encryptedInputs = encrypted.handles.map((handle: Uint8Array, index: number) => {
        const hex = "0x" + bytesToHex(handle);
        const fheType = "e" + (params.values[index]?.type ?? "uint64");
        return { bytes32Hex: hex, fheType, index };
      });

      return {
        encryptedInputs,
        inputProof: "0x" + bytesToHex(encrypted.inputProof),
      };
    },

    // ── readPublicValue() ──────────────────────────────────────────────
    async readPublicValue(handles: any[]) {
      const handleStrings = handles.map((h: any) =>
        typeof h === "string" ? h : h.bytes32Hex,
      );
      const result = await mock.publicDecrypt(handleStrings);
      const values = Object.entries(result).map(([_handle, value]) => ({
        value,
        fheType: "euint64" as const,
      }));
      return { values };
    },

    // ── generateE2eTransportKeyPair() ──────────────────────────────────
    async generateE2eTransportKeyPair() {
      const keypair = mock.generateKeypair();
      return {
        async getTkmsPublicKeyHex() {
          return keypair.publicKey;
        },
        async serialize() {
          return keypair.privateKey;
        },
        // Internal: keep raw keypair for decrypt
        _publicKey: keypair.publicKey,
        _privateKey: keypair.privateKey,
      };
    },

    // ── loadE2eTransportKeyPair() ───────────────────────���──────────────
    async loadE2eTransportKeyPair(params: { tkmsPrivateKeyBytes: any }) {
      const privateKey = typeof params.tkmsPrivateKeyBytes === "string"
        ? params.tkmsPrivateKeyBytes
        : bytesToHex(new Uint8Array(params.tkmsPrivateKeyBytes));
      return {
        async getTkmsPublicKeyHex() {
          // Can't recover public key from private in mock — return empty
          return "";
        },
        async serialize() {
          return privateKey;
        },
        _privateKey: privateKey,
      };
    },

    // ── createDecryptPermit() ──────────────────────────────────────────
    async createDecryptPermit(params: {
      e2eTransportPublicKey: string;
      contractAddresses: readonly string[];
      startTimestamp: number;
      durationDays: number;
      onBehalfOf?: string;
    }) {
      const eip712 = mock.createEIP712(
        params.e2eTransportPublicKey,
        [...params.contractAddresses],
        params.startTimestamp,
        params.durationDays,
      );

      // ethers v6 signTypedData requires EIP712Domain to be excluded from types
      const { EIP712Domain: _, ...typesWithoutDomain } = eip712.types as any;

      return {
        domain: eip712.domain,
        types: typesWithoutDomain,
        message: eip712.message,
        primaryType: params.onBehalfOf
          ? "DelegatedUserDecryptRequestVerification"
          : "UserDecryptRequestVerification",
      };
    },

    // ── decrypt() ──────────────────────────────────────────────────────
    async decrypt(params: {
      e2eTransportKeyPair: any;
      encryptedValues: Array<{ encrypted: any; contractAddress: string }>;
      signedPermit: any;
    }) {
      const { signedPermit, e2eTransportKeyPair } = params;
      const handleContractPairs = params.encryptedValues.map((ev) => ({
        handle: typeof ev.encrypted === "string" ? ev.encrypted : ev.encrypted.bytes32Hex,
        contractAddress: ev.contractAddress,
      }));

      const results = await mock.userDecrypt(
        handleContractPairs,
        e2eTransportKeyPair._privateKey || "",
        signedPermit.permit
          ? await (async () => {
              // Extract public key from permit message
              return signedPermit.permit.message?.publicKey || "";
            })()
          : "",
        signedPermit.signature || "",
        signedPermit.permit?.message?.contractAddresses || [],
        signedPermit.signer || "",
        Number(signedPermit.permit?.message?.startTimestamp || 0),
        Number(signedPermit.permit?.message?.durationDays || 0),
      );

      // Convert Record<handle, value> to DecryptedFhevmHandle[]
      return handleContractPairs.map((hcp) => ({
        value: results[hcp.handle],
        fheType: "euint64" as const,
        handle: hcp.handle,
      }));
    },

    // ── getExtraData() ───────────────────────────────────���─────────────
    async getExtraData() {
      return extraData;
    },

    // ── fetchGlobalFhePkeParams() ──────────────────────────────────────
    async fetchGlobalFhePkeParams() {
      return {};
    },
  };

  return adapted as unknown as FhevmInstance;
}

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  const provider = new JsonRpcProvider(parameters.rpcUrl);

  // Query the KMSVerifier and InputVerifier contracts for their EIP712 domains
  const [kmsVerifierDomain, inputVerifierDomain] = await Promise.all([
    getEip712Domain(provider, parameters.metadata.KMSVerifierAddress),
    getEip712Domain(provider, parameters.metadata.InputVerifierAddress),
  ]);

  const instance = await MockFhevmInstance.create(provider, provider, {
    aclContractAddress: parameters.metadata.ACLAddress,
    chainId: parameters.chainId,
    gatewayChainId: kmsVerifierDomain.chainId,
    inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
    kmsContractAddress: parameters.metadata.KMSVerifierAddress,
    verifyingContractAddressDecryption: kmsVerifierDomain.verifyingContract as `0x${string}`,
    verifyingContractAddressInputVerification: inputVerifierDomain.verifyingContract as `0x${string}`,
  }, {
    kmsVerifierProperties: {},
    inputVerifierProperties: {},
  });

  return adaptMockToNewApi(instance);
};
