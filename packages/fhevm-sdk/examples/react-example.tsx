import React, { useState } from 'react';
import { useFHEVM, FHEVMProvider, EncryptButton, DecryptButton, createSepoliaConfig } from '../src';

/**
 * Example React component using FHEVM SDK
 */
function FHEVMExample() {
  const [encryptedResult, setEncryptedResult] = useState<any>(null);
  const [decryptedResult, setDecryptedResult] = useState<any>(null);
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

  const handleEncryptSuccess = (result: any) => {
    setEncryptedResult(result);
    setError('');
  };

  const handleDecryptSuccess = (result: any) => {
    setDecryptedResult(result);
    setError('');
  };

  const handleError = (error: string) => {
    setError(error);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">FHEVM SDK Example</h1>
      
      {!fhevm.isConnected && (
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      )}

      {fhevm.isConnected && (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 rounded">
            <p>✅ Wallet Connected</p>
            <p>FHEVM Status: {fhevm.isInitialized ? 'Ready' : 'Not Ready'}</p>
          </div>

          {fhevm.isInitialized && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Encrypt Values</h3>
                <EncryptButton
                  contractAddress="0x1234567890123456789012345678901234567890"
                  values={[42, 100]}
                  onSuccess={handleEncryptSuccess}
                  onError={handleError}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Encrypt [42, 100]
                </EncryptButton>
              </div>

              {encryptedResult && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Decrypt Handles</h3>
                  <DecryptButton
                    handles={encryptedResult.handles}
                    contractAddress="0x1234567890123456789012345678901234567890"
                    onSuccess={handleDecryptSuccess}
                    onError={handleError}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Decrypt Result
                  </DecryptButton>
                </div>
              )}

              {encryptedResult && (
                <div className="p-4 bg-gray-100 rounded">
                  <h4 className="font-semibold">Encrypted Result:</h4>
                  <pre className="text-sm">{JSON.stringify(encryptedResult, null, 2)}</pre>
                </div>
              )}

              {decryptedResult && (
                <div className="p-4 bg-gray-100 rounded">
                  <h4 className="font-semibold">Decrypted Result:</h4>
                  <pre className="text-sm">{JSON.stringify(decryptedResult, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * App with FHEVM Provider
 */
export default function App() {
  return (
    <FHEVMProvider config={createSepoliaConfig()}>
      <FHEVMExample />
    </FHEVMProvider>
  );
}
