// Universal FHEVM Relayer Core
// Framework-agnostic core module

import { RelayerSDKLoader } from '../src/internal/RelayerSDKLoader';

export class FHEVMRelayer {
  private loader: RelayerSDKLoader;
  private isReady: boolean = false;

  constructor(trace?: (msg: string) => void) {
    this.loader = new RelayerSDKLoader({ trace });
  }

  async init() {
    await this.loader.load();
    this.isReady = true;
  }

  getSDK() {
    if (!this.isReady) throw new Error('Relayer SDK not loaded!');
    // @ts-ignore
    return window.relayerSDK;
  }
}

// Usage:
// const relayer = new FHEVMRelayer();
// await relayer.init();
// const sdk = relayer.getSDK();
