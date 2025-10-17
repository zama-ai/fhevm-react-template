'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { useCloakSDK, useCloakEncryption, useCloakContract } from '@cloak-sdk/react'
import { ethers } from 'ethers'
import { Plus, Minus, Shield, Eye } from 'lucide-react'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'
import FHECounterABI from '../contracts/abis/FHECounter.json'
import { getWagmiClient } from '../app/wagmi-config'

const COUNTER_ADDRESS = CONTRACT_ADDRESSES.FHECounter

export function CounterDemo() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined)
  
  useEffect(() => {
    if (walletClient) {
      const provider = new ethers.BrowserProvider(walletClient.transport)
      provider.getSigner().then(setSigner)
    } else {
      setSigner(undefined)
    }
  }, [walletClient])
  
  const { sdk, isReady } = useCloakSDK({
    provider: getWagmiClient(),
    chainId: 11155111
  })
  
  const [count, setCount] = useState(0)
  const [encryptedCount, setEncryptedCount] = useState<any>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isCalling, setIsCalling] = useState(false)

  const { encrypt, error: encryptError } = useCloakEncryption({
    sdk,
    signer: signer,
    contractAddress: COUNTER_ADDRESS as `0x${string}`
  })

  const { callWithEncryptedParams, error: contractError } = useCloakContract({
    sdk,
    signer: signer,
    contractAddress: COUNTER_ADDRESS as `0x${string}`,
    abi: FHECounterABI.abi
  })

  const handleEncrypt = async () => {
    if (!encrypt) return
    
    setIsEncrypting(true)
    try {
      const result = await encrypt(count, 'externalEuint32')
      setEncryptedCount(result)
    } catch (error) {
      console.error('Encryption failed:', error)
    } finally {
      setIsEncrypting(false)
    }
  }

  const handleIncrement = async () => {
    if (!callWithEncryptedParams || !encryptedCount) return
    
    setIsCalling(true)
    try {
      const result = await callWithEncryptedParams('increment', {
        handles: encryptedCount.handles,
        inputProof: encryptedCount.inputProof
      })
      console.log('Contract call result:', result)
    } catch (error) {
      console.error('Contract call failed:', error)
    } finally {
      setIsCalling(false)
    }
  }

  if (!isReady) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Confidential Counter</h2>
        </div>
        <p className="text-gray-500">Initializing SDK...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Confidential Counter</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Encrypt your counter value and interact with the smart contract while keeping your data private.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Counter Value
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCount(Math.max(0, count - 1))}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={() => setCount(count + 1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleEncrypt}
          disabled={isEncrypting}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
        </button>

        {encryptedCount && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Encrypted Data</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Handles: {encryptedCount.handles?.length || 0} items</div>
              <div>Input Proof: {encryptedCount.inputProof?.length || 0} bytes</div>
            </div>
          </div>
        )}

        {encryptedCount && (
          <button
            onClick={handleIncrement}
            disabled={isCalling}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCalling ? 'Calling Contract...' : 'Increment on Contract'}
          </button>
        )}

        {(encryptError || contractError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              {encryptError?.message || contractError?.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
