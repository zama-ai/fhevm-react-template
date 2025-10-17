'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useCloakSDK, useCloakEncryption, useCloakDecryption, useCloakContract } from '@cloak-sdk/react'
import { Vote, CheckCircle, XCircle, Eye } from 'lucide-react'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'
import FHEVotingABI from '../contracts/abis/FHEVoting.json'
import { getWagmiClient } from '../app/wagmi-config'

const VOTING_ADDRESS = CONTRACT_ADDRESSES.FHEVoting

export function VotingDemo() {
  const { address } = useAccount()
  // Get wallet client from wagmi config
  const walletClient = getWagmiClient()
  const { sdk, isReady } = useCloakSDK({
    provider: walletClient,
    chainId: 11155111
  })
  
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null)
  const [encryptedVote, setEncryptedVote] = useState<any>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [votingResults, setVotingResults] = useState<any>(null)

  const { encrypt, error: encryptError } = useCloakEncryption({
    sdk,
    signer: walletClient as any,
    contractAddress: VOTING_ADDRESS as `0x${string}`
  })

  const { decrypt, generateSignature, isGeneratingSignature } = useCloakDecryption({
    sdk,
    signer: walletClient as any,
    contractAddress: VOTING_ADDRESS as `0x${string}`
  })

  const { callWithEncryptedParams, error: contractError } = useCloakContract({
    sdk,
    signer: walletClient as any,
    contractAddress: VOTING_ADDRESS as `0x${string}`,
    abi: FHEVotingABI.abi
  })

  const handleEncryptVote = async () => {
    if (!encrypt || selectedVote === null) return
    
    setIsEncrypting(true)
    try {
      const result = await encrypt(selectedVote, 'externalEbool')
      setEncryptedVote(result)
    } catch (error) {
      console.error('Encryption failed:', error)
    } finally {
      setIsEncrypting(false)
    }
  }

  const handleCastVote = async () => {
    if (!callWithEncryptedParams || !encryptedVote) return
    
    setIsVoting(true)
    try {
      const result = await callWithEncryptedParams('castVote', {
        handles: encryptedVote.handles,
        inputProof: encryptedVote.inputProof
      })
      
      console.log('Vote cast successfully:', result)
      
      setVotingResults({
        message: 'Vote cast successfully!',
        transactionHash: result?.hash || 'N/A'
      })
    } catch (error) {
      console.error('Voting failed:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleGenerateSignature = async () => {
    try {
      const signature = await generateSignature(30) 
      console.log('Generated signature:', signature)
    } catch (error) {
      console.error('Signature generation failed:', error)
    }
  }

  if (!isReady) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Vote className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Confidential Voting</h2>
        </div>
        <p className="text-gray-500">Initializing SDK...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Vote className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Confidential Voting</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Cast your vote on a proposal while keeping your choice completely private.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Vote
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedVote(true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                selectedVote === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => setSelectedVote(false)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                selectedVote === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>No</span>
            </button>
          </div>
        </div>

        {selectedVote !== null && (
          <button
            onClick={handleEncryptVote}
            disabled={isEncrypting}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isEncrypting ? 'Encrypting Vote...' : 'Encrypt Vote'}
          </button>
        )}

        {encryptedVote && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Encrypted Vote</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Handles: {encryptedVote.handles?.length || 0} items</div>
              <div>Input Proof: {encryptedVote.inputProof?.length || 0} bytes</div>
            </div>
          </div>
        )}

        {encryptedVote && (
          <button
            onClick={handleCastVote}
            disabled={isVoting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isVoting ? 'Casting Vote...' : 'Cast Vote'}
          </button>
        )}

        <button
          onClick={handleGenerateSignature}
          disabled={isGeneratingSignature}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isGeneratingSignature ? 'Generating...' : 'Generate Decryption Signature'}
        </button>

        {votingResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Voting Status</h3>
            <div className="space-y-1 text-sm text-green-700">
              <div>{votingResults.message}</div>
              {votingResults.transactionHash && (
                <div>Transaction: {votingResults.transactionHash}</div>
              )}
            </div>
          </div>
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
