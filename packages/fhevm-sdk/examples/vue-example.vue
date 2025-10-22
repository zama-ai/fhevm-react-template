<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">FHEVM SDK Vue Example</h1>
    
    <div v-if="!fhevm.isConnected.value">
      <button
        @click="handleConnect"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Connect Wallet
      </button>
    </div>

    <div v-if="fhevm.isConnected.value" class="space-y-4">
      <div class="p-4 bg-green-100 rounded">
        <p>✅ Wallet Connected</p>
        <p>FHEVM Status: {{ fhevm.isInitialized.value ? 'Ready' : 'Not Ready' }}</p>
      </div>

      <div v-if="fhevm.isInitialized.value" class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold mb-2">Encrypt Values</h3>
          <button
            @click="handleEncrypt"
            :disabled="isEncrypting"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {{ isEncrypting ? 'Encrypting...' : 'Encrypt [42, 100]' }}
          </button>
        </div>

        <div v-if="encryptedResult">
          <h3 class="text-lg font-semibold mb-2">Decrypt Handles</h3>
          <button
            @click="handleDecrypt"
            :disabled="isDecrypting"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {{ isDecrypting ? 'Decrypting...' : 'Decrypt Result' }}
          </button>
        </div>

        <div v-if="encryptedResult" class="p-4 bg-gray-100 rounded">
          <h4 class="font-semibold">Encrypted Result:</h4>
          <pre class="text-sm">{{ JSON.stringify(encryptedResult, null, 2) }}</pre>
        </div>

        <div v-if="decryptedResult" class="p-4 bg-gray-100 rounded">
          <h4 class="font-semibold">Decrypted Result:</h4>
          <pre class="text-sm">{{ JSON.stringify(decryptedResult, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFHEVM, createSepoliaConfig } from '../src';

const fhevm = useFHEVM();
const encryptedResult = ref(null);
const decryptedResult = ref(null);
const error = ref('');
const isEncrypting = ref(false);
const isDecrypting = ref(false);

const handleConnect = async () => {
  try {
    await fhevm.connect();
    await fhevm.initialize(createSepoliaConfig());
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to connect';
  }
};

const handleEncrypt = async () => {
  try {
    isEncrypting.value = true;
    const result = await fhevm.encrypt(
      '0x1234567890123456789012345678901234567890',
      [42, 100]
    );
    encryptedResult.value = result;
    error.value = '';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Encryption failed';
  } finally {
    isEncrypting.value = false;
  }
};

const handleDecrypt = async () => {
  if (!encryptedResult.value) return;

  try {
    isDecrypting.value = true;
    const result = await fhevm.decrypt(
      encryptedResult.value.handles,
      '0x1234567890123456789012345678901234567890'
    );
    decryptedResult.value = result;
    error.value = '';
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Decryption failed';
  } finally {
    isDecrypting.value = false;
  }
};
</script>
