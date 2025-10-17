import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [sepolia]

const storage = createStorage({
  storage: cookieStorage
})

export const wagmiAdapter = new WagmiAdapter({
  storage,
  ssr: true,
  projectId,
  networks
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

// Export a function to get the client to avoid circular dependencies
export const getWagmiClient = () => wagmiConfig.getClient()