'use client'

import { wagmiAdapter, wagmiConfig, projectId } from './wagmi-config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { sepolia } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { CloakProvider } from '@cloak-sdk/react'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const metadata = {
  name: 'Cloak SDK Demo',
  description: 'Confidential dApps Demo with FHEVM',
  url: 'https://cloak-sdk.dev', 
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata: metadata,
  features: {
    analytics: true 
  }
})

export function Providers({ children, cookies }: { children: ReactNode; cookies?: string | null }) {
  const initialState = cookieToInitialState(wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <CloakProvider 
          provider={wagmiConfig.getClient()}
          chainId={parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')} 
        >
          {children}
        </CloakProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
