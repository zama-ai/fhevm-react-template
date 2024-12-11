import { ProviderWrapper } from "hardhat/plugins";
import type { EIP1193Provider, RequestArguments } from "hardhat/types";

interface Test {
  request: EIP1193Provider["request"];
}

class CustomProvider extends ProviderWrapper implements Test {
  public lastBlockSnapshot: number;
  public lastCounterRand: number;
  public lastBlockSnapshotForDecrypt: number;

  constructor(protected readonly _wrappedProvider: EIP1193Provider) {
    super(_wrappedProvider);
    this.lastBlockSnapshot = 0; // Initialize the variable
    this.lastCounterRand = 0;
    this.lastBlockSnapshotForDecrypt = 0;
  }

  async request(args: RequestArguments): ReturnType<EIP1193Provider["request"]> {
    if (args.method === "evm_revert") {
      const result = await this._wrappedProvider.request(args);
      const blockNumberHex = (await this._wrappedProvider.request({ method: "eth_blockNumber" })) as string;
      this.lastBlockSnapshot = parseInt(blockNumberHex);
      this.lastBlockSnapshotForDecrypt = parseInt(blockNumberHex);

      const callData = {
        to: "0x000000000000000000000000000000000000005d",
        data: "0x1f20d85c",
      };
      this.lastCounterRand = (await this._wrappedProvider.request({
        method: "eth_call",
        params: [callData, "latest"],
      })) as number;
      return result;
    }
    if (args.method === "get_lastBlockSnapshot") {
      return [this.lastBlockSnapshot, this.lastCounterRand];
    }
    if (args.method === "get_lastBlockSnapshotForDecrypt") {
      return this.lastBlockSnapshotForDecrypt;
    }
    if (args.method === "set_lastBlockSnapshot") {
      this.lastBlockSnapshot = Array.isArray(args.params!) && args.params[0];
      return this.lastBlockSnapshot;
    }
    if (args.method === "set_lastBlockSnapshotForDecrypt") {
      this.lastBlockSnapshotForDecrypt = Array.isArray(args.params!) && args.params[0];
      return this.lastBlockSnapshotForDecrypt;
    }
    const result = this._wrappedProvider.request(args);
    return result;
  }
}

export default CustomProvider;
