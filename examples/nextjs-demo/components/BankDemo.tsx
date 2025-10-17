'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useCloakSDK, useCloakEncryption, useCloakDecryption, useCloakContract } from '@cloak-sdk/react'
import { Banknote, ArrowUpDown, Eye, Lock } from 'lucide-react'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'
import FHEBankABI from '../contracts/abis/FHEBank.json'
import { getWagmiClient } from '../app/wagmi-config'

const BANK_ADDRESS = CONTRACT_ADDRESSES.FHEBank

export function BankDemo() {
  const { address } = useAccount()
  // Get wallet client from wagmi config
  const walletClient = getWagmiClient()
  const { sdk, isReady } = useCloakSDK({
    provider: walletClient,
    chainId: 11155111
  })
  
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [encryptedAmount, setEncryptedAmount] = useState<any>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [operation, setOperation] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

  const { encrypt, error: encryptError } = useCloakEncryption({
    sdk,
    signer: walletClient as any,
    contractAddress: BANK_ADDRESS as `0x${string}`
  })

  const { decrypt, generateSignature } = useCloakDecryption({
    sdk,
    signer: walletClient as any,
    contractAddress: BANK_ADDRESS as `0x${string}`
  })

  const { callWithEncryptedParams, error: contractError } = useCloakContract({
    sdk,
    signer: walletClient as any,
    contractAddress: BANK_ADDRESS as `0x${string}`,
    abi: FHEBankABI.abi
  })

  const handleEncryptAmount = async () => {
    if (!encrypt || !amount) return
    
    setIsEncrypting(true)
    try {
      const result = await encrypt(BigInt(amount), 'externalEuint256')
      setEncryptedAmount(result)
    } catch (error) {
      console.error('Encryption failed:', error)
    } finally {
      setIsEncrypting(false)
    }
  }

  const handleDeposit = async () => {
    if (!callWithEncryptedParams || !encryptedAmount) return
    
    setIsProcessing(true)
    setOperation('deposit')
    try {
      // Call the actual smart contract with encrypted amount
      const result = await callWithEncryptedParams('deposit', {
        handles: encryptedAmount.handles,
        inputProof: encryptedAmount.inputProof
      })
      
      console.log('Deposit successful:', result)
      
      // Update local balance (in a real app, you'd fetch from contract)
      setBalance(prev => (prev || 0) + parseInt(amount))
      setAmount('')
      setEncryptedAmount(null)
    } catch (error) {
      console.error('Deposit failed:', error)
    } finally {
      setIsProcessing(false)
      setOperation(null)
    }
  }

  const handleWithdraw = async () => {
    if (!callWithEncryptedParams || !encryptedAmount) return
    
    setIsProcessing(true)
    setOperation('withdraw')
    try {
      // Call the actual smart contract with encrypted amount
      const result = await callWithEncryptedParams('withdraw', {
        handles: encryptedAmount.handles,
        inputProof: encryptedAmount.inputProof
      })
      
      console.log('Withdrawal successful:', result)
      
      // Update local balance (in a real app, you'd fetch from contract)
      setBalance(prev => Math.max(0, (prev || 0) - parseInt(amount)))
      setAmount('')
      setEncryptedAmount(null)
    } catch (error) {
      console.error('Withdrawal failed:', error)
    } finally {
      setIsProcessing(false)
      setOperation(null)
    }
  }

  const handleTransfer = async () => {
    if (!callWithEncryptedParams || !encryptedAmount || !recipient) return
    
    setIsProcessing(true)
    setOperation('transfer')
    try {
      // Call the actual smart contract with encrypted amount and recipient
      const result = await callWithEncryptedParams('transfer', {
        handles: encryptedAmount.handles,
        inputProof: encryptedAmount.inputProof
      })
      
      console.log('Transfer successful:', result)
      
      // Update local balance (in a real app, you'd fetch from contract)
      setBalance(prev => Math.max(0, (prev || 0) - parseInt(amount)))
      setAmount('')
      setRecipient('')
      setEncryptedAmount(null)
    } catch (error) {
      console.error('Transfer failed:', error)
    } finally {
      setIsProcessing(false)
      setOperation(null)
    }
  }

  if (!isReady) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Banknote className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Confidential Banking</h2>
        </div>
        <p className="text-gray-500">Initializing SDK...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Banknote className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Confidential Banking</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Manage your encrypted balance with private deposits, withdrawals, and transfers.
      </p>

      {/* Balance Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Lock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Your Balance</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {balance !== null ? `${balance} ETH` : 'Loading...'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (ETH)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Encrypt Amount */}
        {amount && (
          <button
            onClick={handleEncryptAmount}
            disabled={isEncrypting}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isEncrypting ? 'Encrypting...' : 'Encrypt Amount'}
          </button>
        )}

        {/* Encrypted Amount Display */}
        {encryptedAmount && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Encrypted Amount</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Handles: {encryptedAmount.handles?.length || 0} items</div>
              <div>Input Proof: {encryptedAmount.inputProof?.length || 0} bytes</div>
            </div>
          </div>
        )}

        {/* Operations */}
        {encryptedAmount && (
          <div className="space-y-3">
            <button
              onClick={handleDeposit}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing && operation === 'deposit' ? 'Processing...' : 'Deposit'}
            </button>

            <button
              onClick={handleWithdraw}
              disabled={isProcessing}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing && operation === 'withdraw' ? 'Processing...' : 'Withdraw'}
            </button>

            {/* Transfer Section */}
            <div className="border-t pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer to Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-3"
              />
              <button
                onClick={handleTransfer}
                disabled={isProcessing || !recipient}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing && operation === 'transfer' ? 'Processing...' : 'Transfer'}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
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
