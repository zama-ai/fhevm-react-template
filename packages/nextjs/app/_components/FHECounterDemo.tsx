"use client";

import { FhevmEnvironment, useFHEDecryption, useFHEEncryption } from "fhevm-sdk";
import { Hex, bytesToHex } from "viem";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useFHECounterClient } from "~~/hooks/fhecounter-example/useFHECounterClient";

/*
 * Main FHECounter React component with 3 buttons
 *  - "Decrypt" button: allows you to decrypt the current FHECounter count handle.
 *  - "Increment" button: allows you to increment the FHECounter count handle using FHE operations.
 *  - "Decrement" button: allows you to decrement the FHECounter count handle using FHE operations.
 */
export const FHECounterDemo = () => {
  const { isConnected } = useAccount();

  const { fhevmClient, contractClient } = useFHECounterClient();
  const { canEncrypt, encryptWith } = useFHEEncryption({ client: fhevmClient });
  const { canDecrypt, decrypt } = useFHEDecryption({ client: fhevmClient });

  const buttonClass =
    "inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg " +
    "transition-all duration-200 hover:scale-105 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  // Secondary (neutral dark) button — #2D2D2D with light text and accent focus
  const secondaryButtonClass =
    buttonClass + " bg-black text-[#F4F4F4] hover:bg-[#1F1F1F] focus-visible:ring-[#FFD208] cursor-pointer";

  const titleClass = "font-bold text-gray-900 text-xl mb-4 border-b-1 border-gray-700 pb-2";

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
  if (!fhevmClient || !contractClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-gray-900">
      {/* Header */}
      <div className="text-center mb-8 text-black">
        <h1 className="text-3xl font-bold mb-2">FHE Counter Demo</h1>
        <p className="text-gray-600">Interact with the Fully Homomorphic Encryption Counter contract</p>
        <h3 className={titleClass}>
          🔧 FHEVM Instance Status: {FhevmEnvironment.isFhevmInitialized() ? "✅ Connected" : "❌ Disconnected"}
        </h3>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
        <button
          className={secondaryButtonClass}
          onClick={async () => {
            // const res = await fhevmClient.userEncrypt(i => i.add32(1));
            const res = await encryptWith(a => a.add32(1));
            await contractClient.increment(bytesToHex(res!.handles[0]), bytesToHex(res!.inputProof));
          }}
        >
          Increment +1 ({String(canEncrypt)})
        </button>

        <button
          className={secondaryButtonClass}
          onClick={async () => {
            const res = await fhevmClient.userEncrypt(i => i.add32(1));
            await contractClient.decrement(bytesToHex(res.handles[0]), bytesToHex(res.inputProof));
          }}
        >
          Decrement -1
        </button>

        <button
          className={secondaryButtonClass}
          onClick={async () => {
            const cHandle = await contractClient.getCount();
            const c = await decrypt(cHandle);
            // const c = await fhevmClient.userDecrypt(cHandle);
            alert(`Current count: ${c}`); // Display current count
          }}
        >
          Get count ({String(canDecrypt)})
        </button>
        <button
          className={secondaryButtonClass}
          onClick={async () => {
            const protocolId = await contractClient.protocolId();

            alert(`Current protocolId: ${protocolId}`); // Display current count
          }}
        >
          Get protocolId
        </button>
      </div>
    </div>
  );
};
