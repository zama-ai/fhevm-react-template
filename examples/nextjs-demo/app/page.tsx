'use client'

import { useAccount } from 'wagmi'
import { Header } from '@/components/Header'
import { CounterDemo } from '@/components/CounterDemo'
import { VotingDemo } from '@/components/VotingDemo'
import { BankDemo } from '@/components/BankDemo'
import { SDKStatus } from '@/components/SDKStatus'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cloak SDK Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Experience confidential dApps with FHEVM encryption
          </p>
        </div>

        {!isConnected ? (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Click the <strong>"Connect Wallet"</strong> button in the header to connect your wallet and start using the Cloak SDK demo. This demo showcases confidential dApps with fully homomorphic encryption.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Framework-agnostic SDK</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>React hooks & components</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>CLI tools for deployment</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <SDKStatus />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CounterDemo />
              <VotingDemo />
            </div>
            
            <BankDemo />
          </div>
        )}
      </div>
    </main>
  )
}
