//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAY USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider, Contract } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import { FhevmInstance } from "../../fhevmTypes";

// ERC-5267 eip712Domain() ABI - returns the EIP712 domain info
const EIP712_DOMAIN_ABI = [
  "function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)"
];

/**
 * Query a contract's EIP712 domain using ERC-5267 standard
 * The return value is a tuple accessed by index:
 * [0]: fields (bytes1)
 * [1]: name (string)
 * [2]: version (string)
 * [3]: chainId (uint256)
 * [4]: verifyingContract (address)
 * [5]: salt (bytes32)
 * [6]: extensions (uint256[])
 */
async function getEip712Domain(provider: JsonRpcProvider, contractAddress: string): Promise<{
  chainId: number;
  verifyingContract: string;
}> {
  const contract = new Contract(contractAddress, EIP712_DOMAIN_ABI, provider);
  const domain = await contract.eip712Domain();
  // Access by index as the return is a tuple
  const chainId = Number(domain[3]);
  const verifyingContract = domain[4] as string;
  console.log(`[fhevmMock] EIP712 domain for ${contractAddress}: chainId=${chainId}, verifyingContract=${verifyingContract}`);
  return {
    chainId,
    verifyingContract,
  };
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
  // This is necessary because these values differ between networks (Sepolia vs localhost)
  const [kmsVerifierDomain, inputVerifierDomain] = await Promise.all([
    getEip712Domain(provider, parameters.metadata.KMSVerifierAddress),
    getEip712Domain(provider, parameters.metadata.InputVerifierAddress),
  ]);

  console.log(`[fhevmMock] Creating MockFhevmInstance with config:`, {
    aclContractAddress: parameters.metadata.ACLAddress,
    chainId: parameters.chainId,
    gatewayChainId: kmsVerifierDomain.chainId,
    inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
    kmsContractAddress: parameters.metadata.KMSVerifierAddress,
    verifyingContractAddressDecryption: kmsVerifierDomain.verifyingContract,
    verifyingContractAddressInputVerification: inputVerifierDomain.verifyingContract,
  });

  const instance = await MockFhevmInstance.create(provider, provider, {
    aclContractAddress: parameters.metadata.ACLAddress,
    chainId: parameters.chainId,
    gatewayChainId: kmsVerifierDomain.chainId,
    inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
    kmsContractAddress: parameters.metadata.KMSVerifierAddress,
    verifyingContractAddressDecryption: kmsVerifierDomain.verifyingContract as `0x${string}`,
    verifyingContractAddressInputVerification: inputVerifierDomain.verifyingContract as `0x${string}`,
  }, {
    // Pass empty properties - the MockFhevmInstance will query the contracts directly
    kmsVerifierProperties: {},
    inputVerifierProperties: {},
  });
  return instance as unknown as FhevmInstance;
};
