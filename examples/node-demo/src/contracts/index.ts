// Import ABIs
import FHECounterABI from './abis/FHECounter.json'
import FHEVotingABI from './abis/FHEVoting.json'
import FHEBankABI from './abis/FHEBank.json'

// Import addresses and types
import { CONTRACT_ADDRESSES, type ContractName } from './addresses'

// Export all contract ABIs and addresses
export { CONTRACT_ADDRESSES, type ContractName } from './addresses'

// Export ABIs
export const CONTRACT_ABIS = {
  FHECounter: FHECounterABI,
  FHEVoting: FHEVotingABI,
  FHEBank: FHEBankABI,
} as const

// Helper function to get contract config
export function getContractConfig(contractName: ContractName) {
  return {
    address: CONTRACT_ADDRESSES[contractName],
    abi: CONTRACT_ABIS[contractName],
  }
}
