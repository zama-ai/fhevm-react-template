"use client";

import { useMemo } from "react";
import { useFhevm } from "@fhevm-sdk";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useFHECounterWagmi } from "~~/hooks/fhecounter-example/useFHECounterWagmi";

/*
 * Main FHECounter React component with 3 buttons
 *  - "Decrypt" button: allows you to decrypt the current FHECounter count handle.
 *  - "Increment" button: allows you to increment the FHECounter count handle using FHE operations.
 *  - "Decrement" button: allows you to decrement the FHECounter count handle using FHE operations.
 */
export const FHECounterDemo = () => {
  const { isConnected, chain } = useAccount();

  const chainId = chain?.id;

  //////////////////////////////////////////////////////////////////////////////
  // FHEVM instance
  //////////////////////////////////////////////////////////////////////////////

  // Create EIP-1193 provider from wagmi for FHEVM
  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;

    // Get the wallet provider from window.ethereum
    return (window as any).ethereum;
  }, []);

  const initialMockChains = { 31337: "http://localhost:8545" };

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true, // use enabled to dynamically create the instance on-demand
  });

  //////////////////////////////////////////////////////////////////////////////
  // useFHECounter is a custom hook containing all the FHECounter logic, including
  // - calling the FHECounter contract
  // - encrypting FHE inputs
  // - decrypting FHE handles
  //////////////////////////////////////////////////////////////////////////////

  const fheCounter = useFHECounterWagmi({
    instance: fhevmInstance,
    initialMockChains,
  });

  //////////////////////////////////////////////////////////////////////////////
  // UI Stuff:
  // --------
  // A basic page containing
  // - A bunch of debug values allowing you to better visualize the React state
  // - 1x "Decrypt" button (to decrypt the latest FHECounter count handle)
  // - 1x "Increment" button (to increment the FHECounter)
  // - 1x "Decrement" button (to decrement the FHECounter)
  //////////////////////////////////////////////////////////////////////////////

  const buttonClass =
    "inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg " +
    "transition-all duration-200 hover:scale-105 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  // Primary (accent) button — #FFD208 with dark text and warm hover #A38025
  const primaryButtonClass =
    buttonClass +
    " bg-[#FFD208] text-[#2D2D2D] hover:bg-[#A38025] focus-visible:ring-[#2D2D2D]  cursor-pointer";

  // Secondary (neutral dark) button — #2D2D2D with light text and accent focus
  const secondaryButtonClass =
    buttonClass +
    " bg-black text-[#F4F4F4] hover:bg-[#1F1F1F] focus-visible:ring-[#FFD208] cursor-pointer";

  // Success/confirmed state — deeper gold #A38025 with dark text
  const successButtonClass =
    buttonClass +
    " bg-[#A38025] text-[#2D2D2D] hover:bg-[#8F6E1E] focus-visible:ring-[#2D2D2D]";

  const titleClass = "font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2";
  const sectionClass = "bg-[#f4f4f4] shadow-lg p-6 mb-6 text-gray-900";

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-gray-900">
        <div className="flex items-center justify-center">
          <div className="bg-white bordershadow-xl p-8 text-center">
            <div className="mb-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-900/30 text-amber-400 text-3xl">
                ⚠️
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Wallet not connected</h2>
            <p className="text-gray-700 mb-6">Connect your wallet to use the FHE Counter demo.</p>
            <div className="flex items-center justify-center">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-gray-900">
      {/* Header */}
      <div className="text-center mb-8 text-black">
        <h1 className="text-3xl font-bold mb-2">FHE Counter Demo</h1>
        <p className="text-gray-600">Interact with the Fully Homomorphic Encryption Counter contract</p>
      </div>

      {/* Count Handle Display */}
      <div className={sectionClass}>
        <h3 className={titleClass}>🔢 Count Handle</h3>
        <div className="space-y-3 space-x-3">
          {printProperty("Encrypted Handle", fheCounter.handle || "No handle available")}
          {printProperty("Decrypted Value", fheCounter.isDecrypted ? fheCounter.clear : "Not decrypted yet")}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
        <button
          className={fheCounter.isDecrypted ? successButtonClass : primaryButtonClass}
          disabled={!fheCounter.canDecrypt}
          onClick={fheCounter.decryptCountHandle}
        >
          {fheCounter.canDecrypt
            ? "🔓 Decrypt Counter"
            : fheCounter.isDecrypted
              ? `✅ Decrypted: ${fheCounter.clear}`
              : fheCounter.isDecrypting
                ? "⏳ Decrypting..."
                : "❌ Nothing to decrypt"}
        </button>

        <button
          className={secondaryButtonClass}
          disabled={!fheCounter.canUpdateCounter}
          onClick={() => fheCounter.updateCounter(+1)}
        >
          {fheCounter.canUpdateCounter
            ? "➕ Increment +1"
            : fheCounter.isProcessing
              ? "⏳ Processing..."
              : "❌ Cannot increment"}
        </button>

        <button
          className={secondaryButtonClass}
          disabled={!fheCounter.canUpdateCounter}
          onClick={() => fheCounter.updateCounter(-1)}
        >
          {fheCounter.canUpdateCounter
            ? "➖ Decrement -1"
            : fheCounter.isProcessing
              ? "⏳ Processing..."
              : "❌ Cannot decrement"}
        </button>
      </div>

      {/* Messages */}
      {fheCounter.message && (
        <div className={sectionClass}>
          <h3 className={titleClass}>💬 Messages</h3>
          <div className="border bg-white border-gray-200 p-4">
            <p className="text-gray-800">{fheCounter.message}</p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={sectionClass}>
          <h3 className={titleClass}>🔧 FHEVM Instance</h3>
          <div className="space-y-3">
            {printProperty("Instance Status", fhevmInstance ? "✅ Connected" : "❌ Disconnected")}
            {printProperty("Status", fhevmStatus)}
            {printProperty("Error", fhevmError ?? "No errors")}
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className={titleClass}>📊 Counter Status</h3>
          <div className="space-y-3">
            {printProperty("Refreshing", fheCounter.isRefreshing)}
            {printProperty("Decrypting", fheCounter.isDecrypting)}
            {printProperty("Processing", fheCounter.isProcessing)}
            {printProperty("Can Get Count", fheCounter.canGetCount)}
            {printProperty("Can Decrypt", fheCounter.canDecrypt)}
            {printProperty("Can Modify", fheCounter.canUpdateCounter)}
          </div>
        </div>
      </div>
    </div>
  );
};

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 w-full">
      <span className="text-gray-800 font-medium">{name}</span>
      <span className="ml-2 font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 border border-gray-300">
        {displayValue}
      </span>
    </div>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  return (
    <div className="flex justify-between items-center py-2 px-3  bg-white border border-gray-200 w-full">
      <span className="text-gray-700 font-medium">{name}</span>
      <span
        className={`font-mono text-sm font-semibold px-2 py-1 border ${
          value
            ? "text-green-800 bg-green-100 border-green-300"
            : "text-red-800 bg-red-100 border-red-300"
        }`}
      >
        {value ? "✓ true" : "✗ false"}
      </span>
    </div>
  );
}
