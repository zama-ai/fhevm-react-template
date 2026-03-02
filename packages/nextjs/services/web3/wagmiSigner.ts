import type { GenericSigner, EIP712TypedData, Hex, TransactionReceipt, ContractCallConfig } from "@zama-fhe/react-sdk";
import type { Config } from "wagmi";
import {
  getAccount,
  getChainId,
  readContract,
  signTypedData,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

/**
 * Custom WagmiSigner that implements GenericSigner using wagmi/actions.
 * This replaces `@zama-fhe/react-sdk/wagmi`'s WagmiSigner which uses
 * `getConnection` (not available in wagmi 2.16.x).
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

  async writeContract<C extends ContractCallConfig>(config: C): Promise<Hex> {
    return writeContract(this.config, config as any);
  }

  async readContract<T = unknown, C extends ContractCallConfig = ContractCallConfig>(config: C): Promise<T> {
    return readContract(this.config, config as any) as Promise<T>;
  }

  async waitForTransactionReceipt(hash: Hex): Promise<TransactionReceipt> {
    return (await waitForTransactionReceipt(this.config, { hash })) as unknown as TransactionReceipt;
  }
}
