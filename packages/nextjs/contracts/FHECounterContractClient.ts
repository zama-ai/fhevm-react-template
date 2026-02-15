import deployedContracts from "./deployedContracts";
import { ContractClientBase } from "@bizjs/chainkit-evm";
import { type Address, type Chain, type Hash, type Hex, type WalletClient } from "viem";

const abi = deployedContracts[31337].FHECounter.abi;

export type FHECounterContractClientOptions = {
  contractAddress: string;
  chain: Chain;
  endppoint?: string;
  walletClient?: WalletClient | undefined;
};

export class FHECounterContractClient extends ContractClientBase<typeof abi> {
  constructor(options: FHECounterContractClientOptions) {
    super({
      abi,
      chain: options.chain,
      contractAddress: options.contractAddress as Address,
      endpoint: options.endppoint,
      walletClient: options.walletClient,
    });
  }

  setWalletClient(walletClient: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).walletClient = walletClient;
  }

  async decrement(handle: Hex, inputProof: Hex) {
    const hash = await this.simulateAndWriteContract({
      functionName: "decrement",
      args: [handle, inputProof],
    });
    return hash;
  }

  async increment(handle: Hex, inputProof: Hex) {
    const hash = await this.simulateAndWriteContract({
      functionName: "increment",
      args: [handle, inputProof],
    });
    return hash;
  }

  async getCount() {
    const value = await this.readContract({
      functionName: "getCount",
    });
    return value as Hex;
  }

  async protocolId() {
    const value = await this.readContract({
      functionName: "protocolId",
    });
    return Number(value);
  }

  async waitForTransaction(hash: Hash) {
    return await this.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });
  }
}
