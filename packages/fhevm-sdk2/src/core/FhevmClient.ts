import { type EIP712, type FhevmInstance, type RelayerEncryptedInput } from '@zama-fhe/relayer-sdk/bundle';
import { Address, TypedDataDomain, WalletClient } from 'viem';
import { FhevmEnvironment } from './FhevmEnvironment';

export type FhevmClientInitOptions = {
  contractAddress: Address;
  durationDays: number;
  walletClient: WalletClient;
  sdkUrl?: string;
};

export class FhevmClient {
  private ins!: FhevmInstance;
  private kp!: { publicKey: string; privateKey: string };
  private initArgs!: { timestamp: number; durationDays: number };
  private eip712!: EIP712;
  private initOptions!: FhevmClientInitOptions;

  async init(options: FhevmClientInitOptions) {
    await FhevmEnvironment.init({ sdkUrl: options.sdkUrl });

    this.initOptions = options;
    this.ins = await (window as any).relayerSDK.createInstance({
      ...(window as any).relayerSDK.SepoliaConfig,
      network: options.walletClient,
    });
    this.kp = this.ins.generateKeypair();
    const ts = Math.floor(Date.now() / 1000);
    this.initArgs = { timestamp: ts, durationDays: options.durationDays };

    this.eip712 = this.ins.createEIP712(
      this.kp.publicKey,
      [options.contractAddress],
      this.initArgs.timestamp,
      this.initArgs.durationDays
    );
  }

  async userDecrypt<T extends bigint | boolean | string>(handle: string) {
    this._checkInitStatus();

    const signature = await this._requestEIP712Signature(this.eip712);
    const { privateKey, publicKey } = this.kp;

    const { walletClient, contractAddress } = this.initOptions;
    const r = await this.ins!.userDecrypt(
      [{ handle, contractAddress }],
      privateKey,
      publicKey,
      signature,
      [contractAddress],
      walletClient.account!.address,
      this.initArgs.timestamp,
      this.initArgs.durationDays
    );
    return r[handle] as T;
  }

  async userEncrypt(inputFn: (input: RelayerEncryptedInput) => void) {
    this._checkInitStatus();

    const { walletClient, contractAddress } = this.initOptions;
    const encryptedInput = this.ins!.createEncryptedInput(contractAddress, walletClient.account!.address);
    // Call the input function to add data to the encrypted input
    inputFn(encryptedInput);
    return encryptedInput.encrypt();
  }

  async publicDecrypt(handles: string[]) {
    this._checkInitStatus();
    return await this.ins!.publicDecrypt(handles);
  }

  private _checkInitStatus() {
    if (!this.ins) {
      throw new Error('FhevmClient is not initialized. Call init() first.');
    }
  }

  private async _requestEIP712Signature(eip712: EIP712) {
    const { walletClient } = this.initOptions;
    const signature = await walletClient.signTypedData({
      account: walletClient.account!.address,
      domain: eip712.domain as TypedDataDomain,
      types: eip712.types,
      primaryType: eip712.primaryType,
      message: eip712.message,
    });
    return signature;
  }
}
