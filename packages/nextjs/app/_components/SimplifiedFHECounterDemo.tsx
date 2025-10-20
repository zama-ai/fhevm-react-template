"use client";

import { useMemo } from "react";
import { useFhevmInstance, useFhevmEncrypt } from "@fhevm-sdk/react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useFHECounterWagmi } from "~~/hooks/fhecounter-example/useFHECounterWagmi";

/**
 * Simplified FHECounter Demo using new Wagmi-style hooks
 * 
 * This demonstrates the new simplified API:
 * - useFhevmInstance: Get FHEVM instance with simple status checks
 * - useFhevmEncrypt: Simplified encryption interface
 * 
 * Compare this with FHECounterDemo.tsx to see the improvements!
 */
export const SimplifiedFHECounterDemo = () => {
  const { isConnected, chain, address } = useAccount();

  const chainId = chain?.id;

  //////////////////////////////////////////////////////////////////////////////
  // FHEVM instance - New simplified API
  //////////////////////////////////////////////////////////////////////////////

  // Create EIP-1193 provider from wagmi for FHEVM
  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return (window as any).ethereum;
  }, []);

  // Use the new useFhevmInstance hook - cleaner API!
  const { instance, isReady, isLoading, error } = useFhevmInstance({
    provider,
    chainId,
    mockChains: { 31337: "http://localhost:8545" },
    enabled: true,
  });

  // Optional: Use useFhevmEncrypt for encryption-specific operations
  const { createEncryptedInput } = useFhevmEncrypt({
    provider,
    chainId,
    mockChains: { 31337: "http://localhost:8545" },
  });

  //////////////////////////////////////////////////////////////////////////////
  // FHECounter logic
  //////////////////////////////////////////////////////////////////////////////

  const fheCounter = useFHECounterWagmi({
    instance,
    initialMockChains: { 31337: "http://localhost:8545" },
  });

  //////////////////////////////////////////////////////////////////////////////
  // UI Styles
  //////////////////////////////////////////////////////////////////////////////

  const buttonClass =
    "inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg " +
    "transition-all duration-200 hover:scale-105 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  const primaryButtonClass =
    buttonClass +
    " bg-[#FFD208] text-[#2D2D2D] hover:bg-[#A38025] focus-visible:ring-[#2D2D2D] cursor-pointer";

  const secondaryButtonClass =
    buttonClass +
    " bg-black text-[#F4F4F4] hover:bg-[#1F1F1F] focus-visible:ring-[#FFD208] cursor-pointer";

  const titleClass = "font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2";
  const sectionClass = "bg-[#f4f4f4] shadow-lg p-6 mb-6 text-gray-900";

  //////////////////////////////////////////////////////////////////////////////
  // UI Rendering
  //////////////////////////////////////////////////////////////////////////////

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-gray-900">
        <div className="flex items-center justify-center">
          <div className="bg-white shadow-xl p-8 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-900/30 text-amber-400 text-3xl">
                ⚠️
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to use the FHE Counter</p>
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🔐 Simplified FHE Counter Demo
        </h1>
        <p className="text-gray-600">
          Using the new Wagmi-style FHEVM SDK hooks
        </p>
      </div>

      {/* FHEVM Status - New simplified status checks */}
      <div className={sectionClass}>
        <h2 className={titleClass}>FHEVM Status (New API)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Loading</div>
            <div className="font-mono text-lg">
              {isLoading ? "🔄 Yes" : "✅ No"}
            </div>
          </div>
          <div className="bg-white p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Ready</div>
            <div className="font-mono text-lg">
              {isReady ? "✅ Yes" : "⏳ No"}
            </div>
          </div>
          <div className="bg-white p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Error</div>
            <div className="font-mono text-lg">
              {error ? `❌ ${error.message}` : "✅ None"}
            </div>
          </div>
        </div>
      </div>

      {/* Counter Value */}
      <div className={sectionClass}>
        <h2 className={titleClass}>Counter Value</h2>
        <div className="bg-white p-6 rounded text-center">
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {fheCounter.decryptedValue !== undefined ? fheCounter.decryptedValue.toString() : "?"}
          </div>
          <div className="text-sm text-gray-600">
            {fheCounter.isDecrypting ? "Decrypting..." : "Current Count"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={sectionClass}>
        <h2 className={titleClass}>Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Decrypt Button */}
          <button
            onClick={fheCounter.decrypt}
            disabled={!isReady || fheCounter.isDecrypting}
            className={primaryButtonClass}
          >
            {fheCounter.isDecrypting ? "Decrypting..." : "🔓 Decrypt"}
          </button>

          {/* Increment Button */}
          <button
            onClick={fheCounter.increment}
            disabled={!isReady || fheCounter.isIncrementing}
            className={secondaryButtonClass}
          >
            {fheCounter.isIncrementing ? "Incrementing..." : "➕ Increment"}
          </button>

          {/* Decrement Button */}
          <button
            onClick={fheCounter.decrement}
            disabled={!isReady || fheCounter.isDecrementing}
            className={secondaryButtonClass}
          >
            {fheCounter.isDecrementing ? "Decrementing..." : "➖ Decrement"}
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className={sectionClass}>
        <h2 className={titleClass}>Debug Info</h2>
        <div className="bg-white p-4 rounded font-mono text-sm space-y-2">
          <div>
            <span className="text-gray-600">Chain ID:</span>{" "}
            <span className="text-gray-900">{chainId || "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-600">Address:</span>{" "}
            <span className="text-gray-900">{address || "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-600">FHEVM Ready:</span>{" "}
            <span className="text-gray-900">{isReady ? "Yes" : "No"}</span>
          </div>
          <div>
            <span className="text-gray-600">Encrypted Input Available:</span>{" "}
            <span className="text-gray-900">
              {createEncryptedInput && address ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* API Comparison Note */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
        <h3 className="font-bold text-blue-900 mb-2">💡 New API Benefits</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>
            <code className="bg-blue-100 px-1 rounded">useFhevmInstance</code> - Cleaner status
            checks with <code className="bg-blue-100 px-1 rounded">isReady</code> and{" "}
            <code className="bg-blue-100 px-1 rounded">isLoading</code>
          </li>
          <li>
            <code className="bg-blue-100 px-1 rounded">useFhevmEncrypt</code> - Simplified
            encryption interface
          </li>
          <li>Wagmi-style API for familiar developer experience</li>
          <li>Better TypeScript support and error handling</li>
        </ul>
      </div>
    </div>
  );
};

