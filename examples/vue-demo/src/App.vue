<template>
  <div id="app">
    <header class="header">
      <h1>Cloak SDK Vue Demo</h1>
      <p>Confidential dApps with FHEVM</p>
    </header>

    <main class="main">
      <div v-if="!sdkReady" class="loading">
        <h2>Initializing Cloak SDK...</h2>
        <p>Please wait while we set up the confidential computing environment.</p>
      </div>

      <div v-else class="demo-section">
        <!-- Wallet Connection -->
        <div class="card">
          <h2>Wallet Connection</h2>
          <div v-if="!isWalletConnected" class="wallet-section">
            <p>Connect your MetaMask wallet to use the confidential counter:</p>
            <button @click="connectWallet" class="connect-button">
              Connect MetaMask
            </button>
          </div>
          <div v-else class="wallet-connected">
            <p>✅ Wallet Connected: {{ userAddress }}</p>
          </div>
        </div>

        <div class="card">
          <h2>Confidential Counter</h2>
          <div class="input-group">
            <label>Counter Value:</label>
            <input 
              v-model.number="counterValue" 
              type="number" 
              placeholder="Enter a number"
            />
            <button @click="encryptValue" :disabled="isEncrypting || !isWalletConnected">
              {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
            </button>
          </div>
          
          <div v-if="encryptedData" class="encrypted-data">
            <h3>Encrypted Data:</h3>
            <p>Handles: {{ encryptedData.handles?.length || 0 }} items</p>
            <p>Input Proof: {{ encryptedData.inputProof?.length || 0 }} bytes</p>
          </div>
        </div>

        <div class="card">
          <h2>SDK Status</h2>
          <div class="status">
            <span class="status-indicator" :class="statusClass"></span>
            <span>{{ statusText }}</span>
          </div>
          <div v-if="error" class="error">
            <h3>Error:</h3>
            <p>{{ error.message }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CloakSDK } from '@cloak-sdk/core'
import { ethers } from 'ethers'

// Type declaration for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>
    }
  }
}

// Reactive state
const sdk = ref<CloakSDK | null>(null)
const sdkReady = ref(false)
const counterValue = ref(0)
const encryptedData = ref<any>(null)
const isEncrypting = ref(false)
const error = ref<Error | null>(null)
const userAddress = ref<string>('')
const isWalletConnected = ref(false)

// Computed properties
const statusText = computed(() => {
  if (sdkReady.value) return 'SDK Ready'
  if (error.value) return 'SDK Error'
  return 'SDK Loading...'
})

const statusClass = computed(() => {
  if (sdkReady.value) return 'ready'
  if (error.value) return 'error'
  return 'loading'
})

// Methods
const connectWallet = async () => {
  try {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        userAddress.value = accounts[0]
        isWalletConnected.value = true
        error.value = null
      }
    } else {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this demo.')
    }
  } catch (err) {
    error.value = err as Error
    console.error('Wallet connection failed:', err)
  }
}

const initializeSDK = async () => {
  try {
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/Xw9CqLbHPBrlpQQidd_Mv')
    
    sdk.value = new CloakSDK()
    await sdk.value.initialize({
      provider: provider as any, 
    })
    
    sdkReady.value = true
    error.value = null
  } catch (err) {
    error.value = err as Error
    console.error('SDK initialization failed:', err)
  }
}

const encryptValue = async () => {
  if (!sdk.value || !sdkReady.value) return
  
  if (!isWalletConnected.value) {
    error.value = new Error('Please connect your wallet first')
    return
  }
  
  isEncrypting.value = true
  try {
    const encryption = sdk.value.getEncryption()
    
    const result = await encryption.encrypt({
      contractAddress: (import.meta.env.VITE_COUNTER_CONTRACT_ADDRESS || '0x6dd89f22f09B3Ce06c6A743C8088A98b0DF522a2') as `0x${string}`,
      userAddress: userAddress.value as `0x${string}`,
      data: counterValue.value,
      dataType: 'externalEuint32'
    })
    
    encryptedData.value = result
  } catch (err) {
    error.value = err as Error
    console.error('Encryption failed:', err)
  } finally {
    isEncrypting.value = false
  }
}

// Lifecycle
onMounted(() => {
  initializeSDK()
})
</script>

<style scoped>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #2563eb;
  margin-bottom: 10px;
}

.header p {
  color: #6b7280;
  font-size: 1.1em;
}

.loading {
  text-align: center;
  padding: 40px;
  background: #f9fafb;
  border-radius: 8px;
}

.demo-section {
  display: grid;
  gap: 20px;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-top: 0;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.input-group label {
  font-weight: 600;
  color: #374151;
}

.input-group input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 16px;
}

.input-group button {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.input-group button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.input-group button:hover:not(:disabled) {
  background: #1d4ed8;
}

.wallet-section {
  text-align: center;
  padding: 20px;
}

.connect-button {
  padding: 12px 24px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
}

.connect-button:hover {
  background: #d97706;
}

.wallet-connected {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
}

.wallet-connected p {
  margin: 0;
  color: #166534;
  font-weight: 500;
}

.encrypted-data {
  background: #f3f4f6;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #10b981;
}

.encrypted-data h3 {
  margin-top: 0;
  color: #065f46;
}

.encrypted-data p {
  margin: 5px 0;
  font-family: monospace;
  color: #374151;
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.ready {
  background: #10b981;
}

.status-indicator.error {
  background: #ef4444;
}

.status-indicator.loading {
  background: #f59e0b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 15px;
  color: #dc2626;
}

.error h3 {
  margin-top: 0;
  color: #dc2626;
}
</style>
