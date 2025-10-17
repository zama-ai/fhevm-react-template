Installation



AppKit provides seamless integration with multiple blockchain ecosystems. . It supports Wagmi and Ethers v6 on Ethereum, @solana/web3.js on Solana, as well as Bitcoin and other networks. AppKit Core with Universal Provider library, enable compatibility across any blockchain protocol.
These steps are specific to Next.js app router. For other React frameworks read the React documentation.
​
Installation
If you prefer referring to a video tutorial for this, please click here.
Setting up from scratch? → Try out the AppKit CLI templates or the AI-assisted setup.
​
Custom Installation
Wagmi
Ethers v5
Ethers
Solana
Bitcoin
Others networks (AppKit Core)

npm

Yarn

Bun

pnpm

Copy
pnpm add @reown/appkit @reown/appkit-adapter-wagmi wagmi viem @tanstack/react-query
​
Cloud Configuration
Create a new project on Reown Dashboard at https://dashboard.reown.com and obtain a new project ID.
Don’t have a project ID?
Head over to Reown Dashboard and create a new project now!
Get started
​
Implementation
Wagmi
Ethers v5
Ethers
Solana
Bitcoin
Others networks (AppKit Core)
wagmi Example
Check the Next wagmi example
For a quick integration, you can use the createAppKit function with a unified configuration. This automatically applies the predefined configurations for different adapters like Wagmi, Ethers, or Solana, so you no longer need to manually configure each one individually. Simply pass the common parameters such as projectId, chains, metadata, etc., and the function will handle the adapter-specific configurations under the hood.
This includes WalletConnect, Coinbase and Injected connectors, and the Blockchain API as a transport
​
Wagmi config
Create a new file for your Wagmi configuration, since we are going to be calling this function on the client and the server it cannot live inside a file with the ‘use client’ directive.
For this example we will create a file called config/index.tsx outside our app directory and set up the following configuration

Copy
import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [mainnet, arbitrum]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
​
Importing networks
Reown AppKit use Viem networks under the hood, which provide a wide variety of networks for EVM chains. You can find all the networks supported by Viem within the @reown/appkit/networks path.

Copy
import { createAppKit } from '@reown/appkit'
import { mainnet, arbitrum, base, scroll, polygon } from '@reown/appkit/networks'
Looking to add a custom network? Check out the custom networks section.
​
SSR and Hydration
:::info
Using cookies is completely optional and by default Wagmi will use localStorage instead if the storage param is not defined.
The ssr flag will delay the hydration of Wagmi’s store to avoid hydration mismatch errors.
AppKit doesn’t fully support the ssr flag. :::

​
Context Provider
Let’s create now a context provider that will wrap our application and initialized AppKit (createAppKit needs to be called inside a Next Client Component file).
In this example we will create a file called context/index.tsx outside our app directory and set up the following configuration

Copy
'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: 'appkit-example',
  description: 'AppKit Example',
  url: 'https://appkitexampleapp.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
​
Layout
Next, in our app/layout.tsx file, we will import our ContextProvider component and call the Wagmi’s function cookieToInitialState.
The initialState returned by cookieToInitialState, contains the optimistic values that will populate the Wagmi’s store both on the server and client.

Copy
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

import { headers } from 'next/headers' // added
import ContextProvider from '@/context'

export const metadata: Metadata = {
  title: 'AppKit Example App',
  description: 'Powered by Reown'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {

  const headersObj = await headers();
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}
​
Trigger the modal
Wagmi
Ethers v5
Ethers
Solana
Bitcoin
Others networks (AppKit Core)
To open AppKit you can use our web component or build your own button with AppKit hooks. In this example we are going to use the <appkit-button> component.
Web components are global html elements that don’t require importing.

Copy
export default function ConnectButton() {
  return <appkit-button />
}
Learn more about the AppKit web components here
​
Smart Contract Interaction
Wagmi
Ethers
Solana
Wagmi hooks can help us interact with wallets and smart contracts:

Copy
import { useReadContract } from "wagmi";
import { USDTAbi } from "../abi/USDTAbi";

const USDTAddress = "0x...";

function App() {
  const result = useReadContract({
    abi: USDTAbi,
    address: USDTAddress,
    functionName: "totalSupply",
  });
}
Read more about Wagmi hooks for smart contract interaction here.
​
Extra configuration