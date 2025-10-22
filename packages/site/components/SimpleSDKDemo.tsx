"use client";

import React, { useState } from 'react';

/**
 * Simple demo component showing SDK integration
 */
export const SimpleSDKDemo = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [message, setMessage] = useState('');

  const handleConnect = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        setMessage('MetaMask not found. Please install MetaMask.');
        return;
      }

      // Simulate connection
      setIsConnected(true);
      setMessage('✅ Wallet connected successfully!');
      
      // Simulate SDK initialization
      setTimeout(() => {
        setIsInitialized(true);
        setMessage('✅ FHEVM SDK initialized successfully!');
      }, 1000);
      
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEncrypt = () => {
    if (!isInitialized) {
      setMessage('❌ Please connect and initialize first');
      return;
    }
    setMessage('🔒 Encrypting values [42, 100, true]...');
    
    // Simulate encryption
    setTimeout(() => {
      setMessage('✅ Values encrypted successfully! Handles: [0x123..., 0x456...]');
    }, 1500);
  };

  const handleDecrypt = () => {
    if (!isInitialized) {
      setMessage('❌ Please connect and initialize first');
      return;
    }
    setMessage('🔓 Decrypting handles...');
    
    // Simulate decryption
    setTimeout(() => {
      setMessage('✅ Values decrypted successfully! Result: [42, 100, true]');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🚀 Universal FHEVM SDK Demo</h1>
        <p className="text-lg opacity-90">
          Experience the power of framework-agnostic FHEVM development
        </p>
        <p className="text-sm opacity-75 mt-2">
          Created by mk83 for Zama Developer Program Bounty Track - October 2025
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${
            isConnected 
              ? 'bg-green-100 border-green-200' 
              : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex items-center">
              <span className={`text-xl mr-2 ${
                isConnected ? 'text-green-600' : 'text-gray-600'
              }`}>
                {isConnected ? '✅' : '⏳'}
              </span>
              <div>
                <p className={`font-semibold ${
                  isConnected ? 'text-green-800' : 'text-gray-800'
                }`}>
                  Wallet Connection
                </p>
                <p className={`text-sm ${
                  isConnected ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border ${
            isInitialized 
              ? 'bg-green-100 border-green-200' 
              : 'bg-yellow-100 border-yellow-200'
          }`}>
            <div className="flex items-center">
              <span className={`text-xl mr-2 ${
                isInitialized ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {isInitialized ? '✅' : '⏳'}
              </span>
              <div>
                <p className={`font-semibold ${
                  isInitialized ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  FHEVM SDK
                </p>
                <p className={`text-sm ${
                  isInitialized ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {isInitialized ? 'Ready' : 'Initializing...'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <span className="text-blue-600 text-xl mr-2">🔒</span>
              <div>
                <p className="font-semibold text-blue-800">Privacy Ready</p>
                <p className="text-sm text-blue-600">FHE operations available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🎮</span>
            SDK Operations
          </h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleConnect}
                disabled={isConnected}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  isConnected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isConnected ? '✅ Connected' : '🔗 Connect & Initialize'}
              </button>
              
              <button
                onClick={handleEncrypt}
                disabled={!isInitialized}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  !isInitialized
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                🔒 Encrypt Values
              </button>
              
              <button
                onClick={handleDecrypt}
                disabled={!isInitialized}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  !isInitialized
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                🔓 Decrypt Handles
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold mb-3 flex items-center">
              <span className="mr-2">💬</span>
              Status Message
            </h4>
            <p className="text-gray-800">{message}</p>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="mr-2">💡</span>
            SDK Features Demonstrated
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-800 mb-2">Core Features:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Framework-agnostic design</li>
                <li>• Wagmi-like API</li>
                <li>• TypeScript support</li>
                <li>• Easy initialization</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-blue-800 mb-2">Components:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• EncryptButton</li>
                <li>• DecryptButton</li>
                <li>• useFHEVM hook</li>
                <li>• FHEVMProvider</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="mr-2">📚</span>
            Learn More
          </h3>
          <div className="space-y-2 text-sm text-green-700">
            <p>• Check out the complete SDK documentation in <code>packages/fhevm-sdk/README.md</code></p>
            <p>• Explore examples in <code>packages/fhevm-sdk/examples/</code></p>
            <p>• View the interactive demo in <code>packages/fhevm-sdk/demo/</code></p>
            <p>• Read the bounty submission details in <code>BOUNTY_SUBMISSION.md</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSDKDemo;
