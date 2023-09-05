/// <reference types="vite/client" />

interface Window {
  ethereum: import('ethers').Eip1193Provider & { on: (event: string, cb: (param: any) => any) => void };
}
