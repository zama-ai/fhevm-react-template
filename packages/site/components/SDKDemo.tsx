"use client";

import React, { useState } from 'react';
import { useFHEVM, FHEVMProvider, EncryptButton, DecryptButton, createSepoliaConfig } from '../../fhevm-sdk/src';

/**
 * Demo component showing how to use the Universal FHEVM SDK
 */
export const SDKDemo = () => {
  const [encryptedResult, setEncryptedResult] = useState<unknown>(null);
  const [decryptedResult, setDecryptedResult] = useState<unknown>(null);
  const [error, setError] = useState<string>('');

  const fhevm = useFHEVM();

  const handleConnect = async () => {
    try {
      await fhevm.connect();
      await fhevm.initialize(createSepoliaConfig());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const handleEncryptSuccess = (result: unknown) => {
    setEncryptedResult(result);
    setError('');
  };

  const handleDecryptSuccess = (result: unknown) => {
    setDecryptedResult(result);
    setError('');
  };

  const handleError = (error: string) => {
    setError(error);
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

      {!fhevm.isConnected && (
        <div className="text-center mb-8">
          <button
            onClick={handleConnect}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          >
            <span className="mr-2">🔗</span>
            Connect Wallet & Initialize SDK
          </button>
        </div>
      )}

      {fhevm.isConnected && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-100 rounded-lg border border-green-200">
              <div className="flex items-center">
                <span className="text-green-600 text-xl mr-2">✅</span>
                <div>
                  <p className="font-semibold text-green-800">Wallet Connected</p>
                  <p className="text-sm text-green-600">MetaMask ready</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              fhevm.isInitialized 
                ? 'bg-green-100 border-green-200' 
                : 'bg-yellow-100 border-yellow-200'
            }`}>
              <div className="flex items-center">
                <span className={`text-xl mr-2 ${
                  fhevm.isInitialized ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {fhevm.isInitialized ? '✅' : '⏳'}
                </span>
                <div>
                  <p className={`font-semibold ${
                    fhevm.isInitialized ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    FHEVM SDK
                  </p>
                  <p className={`text-sm ${
                    fhevm.isInitialized ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {fhevm.isInitialized ? 'Ready' : 'Initializing...'}
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

          {fhevm.isInitialized && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">🔐</span>
                  Encryption Operations
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Encrypt sensitive values using FHEVM SDK
                    </p>
                    <EncryptButton
                      contractAddress="0x1234567890123456789012345678901234567890"
                      values={[42, 100, true]}
                      onSuccess={handleEncryptSuccess}
                      onError={handleError}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      🔒 Encrypt [42, 100, true]
                    </EncryptButton>
                  </div>
                </div>
              </div>

              {encryptedResult && (
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">🔓</span>
                    Decryption Operations
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Decrypt the encrypted handles
                      </p>
                      <DecryptButton
                        handles={encryptedResult.handles}
                        contractAddress="0x1234567890123456789012345678901234567890"
                        onSuccess={handleDecryptSuccess}
                        onError={handleError}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                      >
                        🔓 Decrypt Result
                      </DecryptButton>
                    </div>
                  </div>
                </div>
              )}

              {encryptedResult && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="mr-2">📦</span>
                    Encrypted Result
                  </h4>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(encryptedResult, null, 2)}
                  </pre>
                </div>
              )}

              {decryptedResult && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="mr-2">✨</span>
                    Decrypted Result
                  </h4>
                  <pre className="bg-gray-800 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(decryptedResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-2">❌</span>
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
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
    </div>
  );
};

/**
 * App component with FHEVM Provider
 */
export default function SDKDemoApp() {
  return (
    <FHEVMProvider config={createSepoliaConfig()}>
      <SDKDemo />
    </FHEVMProvider>
  );
}
