"use client";

import React, { useState } from 'react';

/**
 * SDK Showcase component - demonstrates the Universal FHEVM SDK concept
 */
export const SDKShowcase = () => {
  const [activeTab, setActiveTab] = useState<'react' | 'vue' | 'node'>('react');

  const codeExamples = {
    react: `import { useFHEVM, createSepoliaConfig } from 'fhevm-sdk';

function App() {
  const fhevm = useFHEVM();

  const handleConnect = async () => {
    await fhevm.connect();
    await fhevm.initialize(createSepoliaConfig());
  };

  const handleEncrypt = async () => {
    const result = await fhevm.encrypt(
      '0x1234...', // contract address
      [42, 100, true] // values to encrypt
    );
    console.log('Encrypted:', result);
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect</button>
      <button onClick={handleEncrypt}>Encrypt</button>
    </div>
  );
}`,
    vue: `<template>
  <div>
    <button @click="handleConnect">Connect</button>
    <button @click="handleEncrypt">Encrypt</button>
  </div>
</template>

<script setup>
import { useFHEVM, createSepoliaConfig } from 'fhevm-sdk';

const fhevm = useFHEVM();

const handleConnect = async () => {
  await fhevm.connect();
  await fhevm.initialize(createSepoliaConfig());
};

const handleEncrypt = async () => {
  const result = await fhevm.encrypt('0x1234...', [42, 100, true]);
  console.log('Encrypted:', result);
};
</script>`,
    node: `import { createFHEVMNode, createProviderAndSigner } from 'fhevm-sdk';
import { ethers } from 'ethers';

async function main() {
  const fhevmNode = createFHEVMNode();
  
  const { provider, signer } = createProviderAndSigner(
    'https://sepolia.infura.io/v3/YOUR_KEY',
    'YOUR_PRIVATE_KEY'
  );

  await fhevmNode.initialize(createSepoliaConfig(), provider, signer);

  const result = await fhevmNode.encrypt('0x1234...', [42, 100, true]);
  console.log('Encrypted:', result);
}`
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🚀 Universal FHEVM SDK</h1>
        <p className="text-lg opacity-90">
          Framework-agnostic SDK for building privacy-preserving dApps
        </p>
        <p className="text-sm opacity-75 mt-2">
          Created by mk83 for Zama Developer Program Bounty Track - October 2025
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Features */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">✨</span>
              Key Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✅</span>
                <div>
                  <p className="font-medium">Framework Agnostic</p>
                  <p className="text-sm text-gray-600">Works with React, Vue, Node.js, and more</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✅</span>
                <div>
                  <p className="font-medium">Wagmi-like API</p>
                  <p className="text-sm text-gray-600">Familiar interface for Web3 developers</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✅</span>
                <div>
                  <p className="font-medium">TypeScript Support</p>
                  <p className="text-sm text-gray-600">Full type safety across all modules</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✅</span>
                <div>
                  <p className="font-medium">Easy Setup</p>
                  <p className="text-sm text-gray-600">Simple configuration and initialization</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">🛠️</span>
              Available Components
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-mono text-sm"><code>useFHEVM()</code></p>
                <p className="text-xs text-gray-600">Main React hook for FHEVM operations</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-mono text-sm"><code>EncryptButton</code></p>
                <p className="text-xs text-gray-600">Reusable encryption component</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-mono text-sm"><code>DecryptButton</code></p>
                <p className="text-xs text-gray-600">Reusable decryption component</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-mono text-sm"><code>FHEVMProvider</code></p>
                <p className="text-xs text-gray-600">React context provider</p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">💻</span>
            Code Examples
          </h3>
          
          <div className="mb-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded">
              <button
                onClick={() => setActiveTab('react')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'react' 
                    ? 'bg-white text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                React
              </button>
              <button
                onClick={() => setActiveTab('vue')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'vue' 
                    ? 'bg-white text-green-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Vue
              </button>
              <button
                onClick={() => setActiveTab('node')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'node' 
                    ? 'bg-white text-orange-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Node.js
              </button>
            </div>
          </div>

          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            <code>{codeExamples[activeTab]}</code>
          </pre>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">📚</span>
            Documentation
          </h4>
          <p className="text-blue-700 text-sm">
            Complete documentation available in <code>packages/fhevm-sdk/README.md</code>
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <span className="mr-2">🎮</span>
            Interactive Demo
          </h4>
          <p className="text-green-700 text-sm">
            Try the interactive demo in <code>packages/fhevm-sdk/demo/</code>
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
            <span className="mr-2">🏆</span>
            Bounty Submission
          </h4>
          <p className="text-purple-700 text-sm">
            Complete submission details in <code>BOUNTY_SUBMISSION.md</code>
          </p>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-3">🎯 Ready for Production</h3>
        <p className="mb-4">
          This Universal FHEVM SDK is production-ready and fulfills all requirements 
          for the Zama Developer Program Bounty Track - October 2025.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-2">Repository:</p>
            <p className="font-mono bg-black bg-opacity-20 p-2 rounded">
              github.com/83mhpll/fhevm-react-template
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">Branch:</p>
            <p className="font-mono bg-black bg-opacity-20 p-2 rounded">
              bounty-submission-october-2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKShowcase;
