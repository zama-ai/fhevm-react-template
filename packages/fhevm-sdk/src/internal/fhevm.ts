import { isAddress, type Eip1193Provider, JsonRpcProvider } from "ethers";
import type { FhevmInstance } from "../fhevmTypes.js";
import { createFhevmClient } from "@fhevm/sdk/ethers";
import { sepolia as sepoliaChain } from "@fhevm/sdk/chains";

export class FhevmReactError extends Error {
  code: string;
  constructor(code: string, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = "FhevmReactError";
  }
}

function throwFhevmError(
  code: string,
  message?: string,
  cause?: unknown
): never {
  throw new FhevmReactError(code, message, cause ? { cause } : undefined);
}

function checkIsAddress(a: unknown): a is `0x${string}` {
  if (typeof a !== "string") {
    return false;
  }
  if (!isAddress(a)) {
    return false;
  }
  return true;
}

export class FhevmAbortError extends Error {
  constructor(message = "FHEVM operation was cancelled") {
    super(message);
    this.name = "FhevmAbortError";
  }
}

type FhevmRelayerStatusType =
  | "sdk-initializing"
  | "sdk-initialized"
  | "creating"
  | "ready";

async function getChainId(
  providerOrUrl: Eip1193Provider | string
): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const provider = new JsonRpcProvider(providerOrUrl);
    const chainId = Number((await provider.getNetwork()).chainId);
    provider.destroy();
    return chainId;
  }
  const chainId = await providerOrUrl.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}

async function getWeb3Client(rpcUrl: string): Promise<string> {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("web3_clientVersion", []);
    return version;
  } catch (e) {
    throwFhevmError(
      "WEB3_CLIENTVERSION_ERROR",
      `The URL ${rpcUrl} is not a Web3 node or is not reachable. Please check the endpoint.`,
      e
    );
  } finally {
    rpc.destroy();
  }
}

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  const version = await getWeb3Client(rpcUrl);
  if (
    typeof version !== "string" ||
    !version.toLowerCase().includes("hardhat")
  ) {
    // Not a Hardhat Node
    return undefined;
  }
  try {
    const metadata = await getFHEVMRelayerMetadata(rpcUrl);
    if (!metadata || typeof metadata !== "object") {
      return undefined;
    }
    if (
      !(
        "ACLAddress" in metadata &&
        typeof metadata.ACLAddress === "string" &&
        metadata.ACLAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "InputVerifierAddress" in metadata &&
        typeof metadata.InputVerifierAddress === "string" &&
        metadata.InputVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "KMSVerifierAddress" in metadata &&
        typeof metadata.KMSVerifierAddress === "string" &&
        metadata.KMSVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    return metadata as { ACLAddress: `0x${string}`; InputVerifierAddress: `0x${string}`; KMSVerifierAddress: `0x${string}`; };
  } catch {
    // Not a FHEVM Hardhat Node
    return undefined;
  }
}

async function getFHEVMRelayerMetadata(rpcUrl: string): Promise<unknown> {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("fhevm_relayer_metadata", []);
    return version;
  } catch (e) {
    throwFhevmError(
      "FHEVM_RELAYER_METADATA_ERROR",
      `The URL ${rpcUrl} is not a FHEVM Hardhat node or is not reachable. Please check the endpoint.`,
      e
    );
  } finally {
    rpc.destroy();
  }
}

type MockResolveResult = { isMock: true; chainId: number; rpcUrl: string };
type GenericResolveResult = { isMock: false; chainId: number; rpcUrl?: string };
type ResolveResult = MockResolveResult | GenericResolveResult;

async function resolve(
  providerOrUrl: Eip1193Provider | string,
  mockChains?: Record<number, string>
): Promise<ResolveResult> {
  // Resolve chainId
  const chainId = await getChainId(providerOrUrl);

  // Resolve rpc url
  let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;

  const _mockChains: Record<number, string> = {
    31337: "http://localhost:8545",
    ...(mockChains ?? {}),
  };

  // Help Typescript solver here:
  if (Object.hasOwn(_mockChains, chainId)) {
    if (!rpcUrl) {
      rpcUrl = _mockChains[chainId];
    }

    return { isMock: true, chainId, rpcUrl };
  }

  return { isMock: false, chainId, rpcUrl };
}

export const createFhevmInstance = async (parameters: {
  provider: Eip1193Provider | string;
  mockChains?: Record<number, string>;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance> => {
  const throwIfAborted = (): void => {
    if (signal.aborted) throw new FhevmAbortError();
  };

  const {
    signal,
    provider: providerOrUrl,
    mockChains,
    onStatusChange,
  } = parameters;

  const notify = (status: FhevmRelayerStatusType): void => {
    if (onStatusChange) onStatusChange(status);
  };

  // Resolve chainId
  const { isMock, rpcUrl, chainId } = await resolve(providerOrUrl, mockChains);

  if (isMock) {
    // Throws an error if cannot connect or url does not refer to a Web3 client
    const fhevmRelayerMetadata =
      await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);

    if (fhevmRelayerMetadata) {
      // fhevmRelayerMetadata is defined, which means rpcUrl refers to a FHEVM Hardhat Node
      notify("creating");

      //////////////////////////////////////////////////////////////////////////
      //
      // WARNING!!
      // ALWAYS USE DYNAMIC IMPORT TO AVOID INCLUDING THE ENTIRE FHEVM MOCK LIB
      // IN THE FINAL PRODUCTION BUNDLE!!
      //
      //////////////////////////////////////////////////////////////////////////
      const fhevmMock = await import("./mock/fhevmMock.js");
      const mockInstance = await fhevmMock.fhevmMockCreateInstance({
        rpcUrl,
        chainId,
        metadata: fhevmRelayerMetadata,
      });

      throwIfAborted();

      return mockInstance;
    }
  }

  throwIfAborted();

  notify("sdk-initializing");

  // Create ethers provider
  let ethersProvider: JsonRpcProvider;
  if (typeof providerOrUrl === "string") {
    ethersProvider = new JsonRpcProvider(providerOrUrl);
  } else {
    // Convert EIP-1193 provider to ethers provider
    ethersProvider = new JsonRpcProvider(providerOrUrl as any);
  }

  throwIfAborted();
  notify("sdk-initialized");

  // Create FHEVM client using the new SDK
  notify("creating");

  // For Sepolia (chainId 11155111), use the sepolia chain config
  // For other chains, you may need to define custom chain configs
  const fhevmClient = createFhevmClient({
    chain: sepoliaChain,
    provider: ethersProvider,
  });

  // Initialize the client (loads WASM modules)
  await fhevmClient.init();

  throwIfAborted();
  notify("ready");

  // Wrap the client to match the FhevmInstance interface expected by the React hooks
  return fhevmClient as unknown as FhevmInstance;
};
