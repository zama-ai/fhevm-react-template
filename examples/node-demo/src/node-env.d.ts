/// <reference types="node" />

declare global {
  var process: NodeJS.Process;
  var global: typeof globalThis;
  var Buffer: typeof Buffer;
  var __dirname: string;
  var __filename: string;
  
  namespace NodeJS {
    interface ProcessEnv {
      COUNTER_CONTRACT_ADDRESS?: string
      VOTING_CONTRACT_ADDRESS?: string
      BANK_CONTRACT_ADDRESS?: string
    }
  }
}

export {}
