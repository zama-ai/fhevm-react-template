// Contract addresses for deployed FHEVM contracts on Sepolia

declare const process: {
  env: {
    COUNTER_CONTRACT_ADDRESS?: string;
    VOTING_CONTRACT_ADDRESS?: string;
    BANK_CONTRACT_ADDRESS?: string;
  };
};

export const CONTRACT_ADDRESSES = {
  FHECounter: (typeof process !== 'undefined' && process.env.COUNTER_CONTRACT_ADDRESS) ? process.env.COUNTER_CONTRACT_ADDRESS : '0x6dd89f22f09B3Ce06c6A743C8088A98b0DF522a2',
  FHEVoting: (typeof process !== 'undefined' && process.env.VOTING_CONTRACT_ADDRESS) ? process.env.VOTING_CONTRACT_ADDRESS : '0x686B8f74662749d82359B8170a84717d92Caa9cc',
  FHEBank: (typeof process !== 'undefined' && process.env.BANK_CONTRACT_ADDRESS) ? process.env.BANK_CONTRACT_ADDRESS : '0xba0A99f5227d95cc785cbED6ec7e793316afD759',
} as const

export type ContractName = keyof typeof CONTRACT_ADDRESSES
