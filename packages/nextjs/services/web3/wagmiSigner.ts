import type { EIP712TypedData, GenericSigner, Hex, SignerLifecycleCallbacks, TransactionReceipt } from "@zama-fhe/sdk";
import type { Config } from "wagmi";
import {
  getAccount,
  getBlock,
  getChainId,
  readContract,
  signTypedData,
  waitForTransactionReceipt,
  watchAccount,
  writeContract,
} from "wagmi/actions";

/**
 * Wagmi-backed GenericSigner.
 *
 * Reimplements `@zama-fhe/react-sdk/wagmi`'s WagmiSigner locally because
 * @zama-fhe/react-sdk@3.0.0 (stable) imports `watchConnection` from
 * `wagmi/actions`, and wagmi only exports `watchAccount`. The upstream fix
 * is already in the alpha track (≥ 3.0.0-alpha.16 uses `watchAccount`);
 * delete this file and switch `DappWrapperWithProviders` back to
 * `import { WagmiSigner } from "@zama-fhe/react-sdk/wagmi"` once the fix
 * reaches a stable release.
 */
export class WagmiSigner implements GenericSigner {
  private config: Config;

  constructor(signerConfig: { config: Config }) {
    this.config = signerConfig.config;
  }

  async getChainId(): Promise<number> {
    return getChainId(this.config);
  }

  async getAddress(): Promise<`0x${string}`> {
    const account = getAccount(this.config);
    if (!account?.address) {
      throw new TypeError("Invalid address");
    }
    return account.address;
  }

  async signTypedData(typedData: EIP712TypedData): Promise<Hex> {
    // wagmi's signTypedData derives EIP712Domain from `domain`; passing it via
    // `types` triggers "Ambiguous primary type" — strip it here.
    const sigTypes = { ...typedData.types };
    delete (sigTypes as Record<string, unknown>).EIP712Domain;
    return signTypedData(this.config, {
      primaryType: Object.keys(sigTypes)[0]!,
      types: sigTypes,
      domain: typedData.domain as any,
      message: typedData.message as any,
    });
  }

  async writeContract(config: any): Promise<Hex> {
    return writeContract(this.config, config);
  }

  async readContract(config: any): Promise<any> {
    return readContract(this.config, config);
  }

  async waitForTransactionReceipt(hash: Hex): Promise<TransactionReceipt> {
    return (await waitForTransactionReceipt(this.config, { hash })) as unknown as TransactionReceipt;
  }

  async getBlockTimestamp(): Promise<bigint> {
    const block = await getBlock(this.config);
    return block.timestamp;
  }

  subscribe({ onDisconnect, onAccountChange, onChainChange }: SignerLifecycleCallbacks): () => void {
    return watchAccount(this.config, {
      onChange: (account, prevAccount) => {
        if (account.status === "disconnected" && prevAccount.status !== "disconnected") {
          onDisconnect?.();
        }
        if (account.address && prevAccount.address && account.address !== prevAccount.address) {
          onAccountChange?.(account.address);
        }
        if (account.chainId && account.chainId !== prevAccount.chainId) {
          onChainChange?.(account.chainId);
        }
      },
    });
  }
}
