'use client'

import { useCloakSDK } from '@cloak-sdk/react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { getWagmiClient } from '../app/wagmi-config'

export function SDKStatus() {
  const { status, error, chainInfo, isReady } = useCloakSDK({
    provider: getWagmiClient(),
    chainId: 11155111
  })

  const getStatusIcon = () => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Loader2 className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'SDK Ready'
      case 'error':
        return 'SDK Error'
      case 'loading':
        return 'Initializing SDK...'
      default:
        return 'SDK Idle'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">SDK Status</h2>
      
      <div className="space-y-4">
        <div className={`flex items-center space-x-3 p-3 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>

        {chainInfo && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Network Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Chain ID: {chainInfo.chainId}</div>
              {chainInfo.name && <div>Network: {chainInfo.name}</div>}
              {chainInfo.rpcUrl && <div>RPC: {chainInfo.rpcUrl}</div>}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">Error Details</h3>
            <p className="text-sm text-red-700">{error.message}</p>
            {error.code && (
              <p className="text-xs text-red-600 mt-1">Code: {error.code}</p>
            )}
          </div>
        )}

        {isReady && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Ready for Use</h3>
            <p className="text-sm text-green-700">
              The Cloak SDK is ready! You can now use encryption, decryption, and contract interactions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
