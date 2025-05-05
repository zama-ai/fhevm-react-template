/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SEPOLIA_RPC_URL: `http${string}`;
  readonly VITE_AUCTION_FACTORY_CONTRACT_ADDRESS: `0x${string}`;
  readonly VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS: `0x${string}`;
  readonly VITE_AUCTION_TOKEN_CONTRACT_ADDRESS: `0x${string}`;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// interface Window {
//   ethereum: import('ethers').Eip1193Provider & {
//     on: (event: string, cb: (param: unknown) => unknown) => void;
//   };
// }

interface Window {
  ethereum: import('ethers').Eip1193Provider & {
    on: (event: string, cb: (param: any) => any) => void;
  };
  fhevmjs: import('fhevmjs');
  fhevmjsInitialized: boolean;
}
