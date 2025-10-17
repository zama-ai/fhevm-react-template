/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_COUNTER_CONTRACT_ADDRESS?: string
    readonly VITE_VOTING_CONTRACT_ADDRESS?: string
    readonly VITE_BANK_CONTRACT_ADDRESS?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
