import { type EIP712, type FhevmInstance, type RelayerEncryptedInput } from '@zama-fhe/relayer-sdk/bundle';
import { Address, TypedDataDomain, WalletClient } from 'viem';
import { FhevmEnvironment } from './FhevmEnvironment';

export type FhevmClientInitOptions = {
  contractAddress: Address;
  durationDays: number;
  walletClient: WalletClient;
  sdkUrl?: string;
};

export type SignatureCacheItem = {
  kp: { publicKey: string; privateKey: string };
  contractAddresses: string[];
  userAddress: string;
  startTimestamp: number;
  durationDays: number;
  signature: string;
};

export class FhevmClient {
  private ins!: FhevmInstance;
  private durationDays!: number;
  private initOptions!: FhevmClientInitOptions;

  async init(options: FhevmClientInitOptions) {
    await FhevmEnvironment.init({ sdkUrl: options.sdkUrl });

    this.initOptions = options;
    this.ins = await (window as any).relayerSDK.createInstance({
      ...(window as any).relayerSDK.SepoliaConfig,
      network: options.walletClient,
    });

    this.durationDays = options.durationDays;
  }

  async userDecrypt<T extends bigint | boolean | string>(handle: string) {
    this._checkInitStatus();

    const { walletClient, contractAddress } = this.initOptions;
    const sigItem = await this._loadOrRequestEIP712Signature(contractAddress, walletClient, this.durationDays);

    const r = await this.ins!.userDecrypt(
      [{ handle, contractAddress }],
      sigItem.kp.privateKey,
      sigItem.kp.publicKey,
      sigItem.signature,
      sigItem.contractAddresses,
      sigItem.userAddress,
      sigItem.startTimestamp,
      sigItem.durationDays
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

  private async _loadOrRequestEIP712Signature(contractAddress: Address, wc: WalletClient, durationDays: number) {
    const userAddress = wc.account!.address;
    const cacheKey = `${contractAddress}_${userAddress}`;
    let cache = await this._getSignatureCacheItem(cacheKey);
    if (!cache) {
      const kp = this.ins.generateKeypair();
      const ts = Math.floor(Date.now() / 1000);
      const eip712 = this.ins.createEIP712(kp.publicKey, [contractAddress], ts, durationDays);
      const sig = await this._requestEIP712Signature(wc, eip712);
      cache = {
        kp,
        contractAddresses: [contractAddress],
        userAddress: userAddress,
        startTimestamp: ts,
        durationDays,
        signature: sig,
      };
      await this._saveToCache(cacheKey, cache);
    }
    return cache;
  }

  private async _getSignatureCacheItem(cacheKey: string): Promise<SignatureCacheItem | null> {
    try {
      const value = JSON.parse(localStorage.getItem(cacheKey) as string);
      const expiredAt = value.startTimestamp + value.durationDays * 3600 * 24;
      if (expiredAt < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return value;
    } catch {}
    return null;
  }

  private async _saveToCache(cacheKey: string, item: SignatureCacheItem) {
    localStorage.setItem(cacheKey, JSON.stringify(item));
  }

  private async _requestEIP712Signature(wc: WalletClient, eip712: EIP712) {
    const signature = await wc.signTypedData({
      account: wc.account!.address,
      domain: eip712.domain as TypedDataDomain,
      types: eip712.types,
      primaryType: eip712.primaryType,
      message: eip712.message,
    });
    return signature;
  }
}
