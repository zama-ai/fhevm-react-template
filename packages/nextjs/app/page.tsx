"use client";

import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useFHECounterWagmi } from "~~/hooks/fhecounter-example/useFHECounterWagmi";

const buttonBase =
  "inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg transition-all duration-200 hover:scale-105 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 " +
  "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";
const primaryButton = `${buttonBase} bg-[#FFD208] text-[#2D2D2D] hover:bg-[#A38025] focus-visible:ring-[#2D2D2D] cursor-pointer`;
const secondaryButton = `${buttonBase} bg-black text-[#F4F4F4] hover:bg-[#1F1F1F] focus-visible:ring-[#FFD208] cursor-pointer`;
const successButton = `${buttonBase} bg-[#A38025] text-[#2D2D2D] hover:bg-[#8F6E1E] focus-visible:ring-[#2D2D2D]`;
const sectionClass = "bg-[#f4f4f4] shadow-lg p-6 mb-6 text-gray-900";
const titleClass = "font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2";

export default function Home() {
  const { isConnected } = useAccount();
  const fheCounter = useFHECounterWagmi();

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
      <div className="max-w-6xl mx-auto p-6 space-y-6 text-gray-900">
        <div className="text-center mb-8 text-black">
          <h1 className="text-3xl font-bold mb-2">FHE Counter Demo</h1>
          <p className="text-gray-600">Interact with the Fully Homomorphic Encryption Counter contract</p>
        </div>

        <div className={sectionClass}>
          <h3 className={titleClass}>🔢 Count Handle</h3>
          <div className="space-y-3 space-x-3">
            <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 w-full">
              <span className="text-gray-800 font-medium">Encrypted Handle</span>
              <span className="ml-2 font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 border border-gray-300">
                {fheCounter.handle || "No handle available"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-white border border-gray-200 w-full">
              <span className="text-gray-800 font-medium">Decrypted Value</span>
              <span className="ml-2 font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 border border-gray-300">
                {fheCounter.isDecrypted ? fheCounter.clear : "Not decrypted yet"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
          <button
            className={fheCounter.isDecrypted ? successButton : primaryButton}
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
            className={secondaryButton}
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
            className={secondaryButton}
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

        {fheCounter.message && (
          <div className={sectionClass}>
            <h3 className={titleClass}>💬 Messages</h3>
            <div className="border bg-white border-gray-200 p-4">
              <p className="text-gray-800">{fheCounter.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
