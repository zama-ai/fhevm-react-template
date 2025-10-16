<template>
  <div class="container">
    <header>
      <h1>🔐 FHEVM Vue 3 Example</h1>
      <p>Homomorphic Encryption with Framework-Agnostic SDK</p>
    </header>

    <main>
      <!-- SDK Status -->
      <section class="status-card">
        <h2>SDK Status</h2>
        <div :class="['status-badge', sdkStatus]">
          {{ sdkReady ? '✅ SDK Ready' : '⏳ Loading SDK...' }}
        </div>
      </section>

      <!-- Encryption Demo -->
      <section v-if="sdkReady" class="demo-card">
        <h2>🔐 Encryption Demo</h2>
        
        <div class="input-group">
          <label>Enter value to encrypt (1-10000):</label>
          <input
            v-model.number="bidValue"
            type="number"
            min="1"
            max="10000"
            placeholder="e.g., 5000"
            :disabled="isEncrypting"
          />
        </div>

        <button
          @click="handleEncrypt"
          :disabled="!bidValue || isEncrypting"
          class="btn btn-primary"
        >
          {{ isEncrypting ? 'Encrypting...' : '🔒 Encrypt Bid' }}
        </button>

        <!-- Encryption Result -->
        <div v-if="encryptedResult" class="result-card">
          <h3>Encryption Result</h3>
          <div class="result-item">
            <span class="label">Original Value:</span>
            <span class="value">{{ bidValue }}</span>
          </div>
          <div class="result-item">
            <span class="label">Handles Count:</span>
            <span class="value">{{ encryptedResult.handles?.length || 0 }}</span>
          </div>
          <div class="result-item">
            <span class="label">InputProof Size:</span>
            <span class="value">{{ encryptedResult.inputProof?.length || 0 }} bytes</span>
          </div>
          <div class="result-item success">
            ✅ Encryption successful!
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="encryptError" class="error-card">
          <strong>❌ Error:</strong> {{ encryptError }}
        </div>
      </section>

      <!-- Loading State -->
      <section v-else class="loading-card">
        <div class="spinner"></div>
        <p>Loading FHEVM SDK...</p>
      </section>

      <!-- Console Logs -->
      <section class="logs-card">
        <h2>📋 Console Logs</h2>
        <div class="logs">
          <div v-for="(log, idx) in consoleLogs" :key="idx" class="log-entry">
            <span class="timestamp">{{ formatTime(log.time) }}</span>
            <span :class="['message', log.level]">{{ log.message }}</span>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <p>🚀 Vue 3 + FHEVM SDK = Framework-Agnostic Confidential Computing</p>
      <p><a href="https://docs.zama.ai/">Learn more about FHEVM</a></p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEncryptBid } from '../../packages/fhevm-sdk/react/useEncryptBid'

// State
const sdkReady = ref(false)
const bidValue = ref<number | null>(null)
const isEncrypting = ref(false)
const encryptedResult = ref<any>(null)
const encryptError = ref<string>('')
const consoleLogs = ref<Array<{ time: Date; message: string; level: string }>>([])
const sdkStatus = ref('loading')

// Initialize SDK
onMounted(async () => {
  try {
    console.log('[Vue] Initializing FHEVM SDK...')
    addLog('Initializing FHEVM SDK...', 'info')

    // Check if SDK is available globally
    const win = window as any
    if (!win.relayerSDK) {
      throw new Error('FHEVM SDK not loaded globally. Check CDN link in HTML.')
    }

    // Initialize SDK WASM
    await win.relayerSDK.initSDK()
    console.log('[Vue] ✅ SDK initialized successfully')
    addLog('✅ SDK initialized successfully', 'success')

    sdkReady.value = true
    sdkStatus.value = 'ready'
  } catch (err) {
    console.error('[Vue] SDK initialization error:', err)
    addLog(`❌ SDK Error: ${(err as Error).message}`, 'error')
    sdkStatus.value = 'error'
  }
})

// Encryption handler
async function handleEncrypt() {
  if (!bidValue.value) return

  try {
    isEncrypting.value = true
    encryptError.value = ''
    encryptedResult.value = null

    console.log(`[Vue] Encrypting value: ${bidValue.value}`)
    addLog(`Encrypting value: ${bidValue.value}`, 'info')

    const win = window as any
    if (!win.relayerSDK) {
      throw new Error('SDK not available')
    }

    // Get config
    const config = win.relayerSDK.SepoliaConfig
    addLog('✅ SepoliaConfig loaded', 'success')

    // Create instance
    const instance = await win.relayerSDK.createInstance(config)
    addLog('✅ Instance created', 'success')

    // Get user address (mock for this example)
    const userAddress = '0x' + Math.random().toString(16).slice(2, 42)
    addLog(`User address: ${userAddress}`, 'info')

    // Create encrypted input
    const contractAddress = config.verifyingContractAddressDecryption
    const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress)
    addLog('✅ EncryptedInput created', 'success')

    // Add value and encrypt
    const encrypted = await encryptedInput.add256(BigInt(bidValue.value)).encrypt()
    addLog('✅ Value encrypted', 'success')

    encryptedResult.value = encrypted
    console.log('[Vue] Encryption successful:', encrypted)
    addLog(`✅ Encryption successful! Handles: ${encrypted.handles.length}, Proof: ${encrypted.inputProof.length} bytes`, 'success')
  } catch (err) {
    const errorMsg = (err as Error).message
    console.error('[Vue] Encryption error:', err)
    encryptError.value = errorMsg
    addLog(`❌ Error: ${errorMsg}`, 'error')
  } finally {
    isEncrypting.value = false
  }
}

// Logging utility
function addLog(message: string, level: string = 'info') {
  consoleLogs.value.push({
    time: new Date(),
    message,
    level
  })
  // Keep only last 20 logs
  if (consoleLogs.value.length > 20) {
    consoleLogs.value.shift()
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString()
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

header p {
  font-size: 14px;
  opacity: 0.9;
}

main {
  display: grid;
  gap: 24px;
}

section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #333;
}

h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #555;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.status-badge.loading {
  background: #fff3cd;
  color: #856404;
}

.status-badge.ready {
  background: #d4edda;
  color: #155724;
}

.status-badge.error {
  background: #f8d7da;
  color: #721c24;
}

/* Input Group */
.input-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Result Cards */
.result-card {
  background: #f0f9ff;
  border: 2px solid #bfdbfe;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #dbeafe;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item .label {
  color: #555;
  font-weight: 500;
}

.result-item .value {
  color: #667eea;
  font-weight: 600;
  font-family: 'Monaco', 'Courier New', monospace;
}

.result-item.success {
  color: #059669;
  font-weight: 600;
  padding-top: 12px;
  border-top: 1px solid #dbeafe;
}

/* Error Card */
.error-card {
  background: #fee;
  border: 2px solid #fcc;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 16px;
  color: #c33;
}

/* Loading State */
.loading-card {
  text-align: center;
  padding: 60px 24px;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Logs */
.logs-card {
  background: #1e1e1e;
  color: #e0e0e0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.logs {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-entry {
  display: flex;
  gap: 8px;
}

.timestamp {
  color: #888;
  min-width: 80px;
}

.message {
  flex: 1;
  word-break: break-all;
}

.message.info {
  color: #87ceeb;
}

.message.success {
  color: #90ee90;
}

.message.error {
  color: #ff6b6b;
}

/* Footer */
footer {
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 12px;
  margin-top: 40px;
}

footer a {
  color: #667eea;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}
</style>
