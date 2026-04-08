import type { GenericSigner, EIP712TypedData, Hex, TransactionReceipt } from "@zama-fhe/sdk";
import type { Config } from "wagmi";
import {
  getAccount,
  getBlock,
  getChainId,
  readContract,
  signTypedData,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

/**
 * Custom WagmiSigner that implements GenericSigner using wagmi/actions.
 * This replaces `@zama-fhe/react-sdk/wagmi`'s WagmiSigner which uses
 * `watchConnection` (not available in all wagmi 2.x versions).
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
    const { EIP712Domain: _, ...sigTypes } = typedData.types;
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
}
