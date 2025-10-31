import loadjs from 'loadjs';
import { SDK_CDN_URL } from './constants';
import { type FhevmInstance } from '@zama-fhe/relayer-sdk/web';
export type FhevmEnvironmentInitOptions = {
  /** sdk url, default: https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs */
  sdkUrl?: string;
};

export class FhevmEnvironment {
  private static _isFhevmInitialized = false;
  private static _fhevmInstance: FhevmInstance;
  static async init(options?: FhevmEnvironmentInitOptions) {
    if (this._isFhevmInitialized) {
      return true;
    }
    const sdkUrl = options?.sdkUrl || SDK_CDN_URL;
    try {
      if (!loadjs.isDefined('relayer-sdk-js')) {
        await loadjs(sdkUrl, 'relayer-sdk-js', { async: true, returnPromise: true });
        await (window as any).relayerSDK.initSDK();
      }
      this._isFhevmInitialized = true;
      return true;
    } catch (e) {
      throw new Error(`Failed to load FHEVM SDK from ${sdkUrl}. Please check the URL or your network connection.`, {
        cause: e,
      });
    }
  }

  static isFhevmInitialized(): boolean {
    return this._isFhevmInitialized;
  }

  static async getFhevmInstance(options: { walletClient?: any }) {
    if (this._fhevmInstance) {
      return this._fhevmInstance;
    }
    if (!this.isFhevmInitialized()) {
      throw new Error('FHEVM SDK is not initialized. Please call FhevmEnvironment.init() first.');
    }

    if (!options.walletClient) {
      throw new Error('Wallet client is required to create an FHEVM instance.');
    }

    this._fhevmInstance = await (window as any).relayerSDK.createInstance({
      ...(window as any).relayerSDK.SepoliaConfig,
      network: options.walletClient,
    });
    console.log('FHEVM instance created:', this._fhevmInstance);
    return this._fhevmInstance;
  }
}
