// Contract addresses for deployed FHEVM contracts on Sepolia
export const CONTRACT_ADDRESSES = {
  FHECounter: import.meta.env.VITE_COUNTER_CONTRACT_ADDRESS || '0x6dd89f22f09B3Ce06c6A743C8088A98b0DF522a2',
  FHEVoting: import.meta.env.VITE_VOTING_CONTRACT_ADDRESS || '0x686B8f74662749d82359B8170a84717d92Caa9cc',
  FHEBank: import.meta.env.VITE_BANK_CONTRACT_ADDRESS || '0xba0A99f5227d95cc785cbED6ec7e793316afD759',
} as const

export type ContractName = keyof typeof CONTRACT_ADDRESSES
