"use client";

import { useFhevm } from "@fhevm/react";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useFHECounter } from "../hooks/useFHECounter";
import { errorNotDeployed } from "./ErrorNotDeployed";

/*
 * Main FHECounter React component with 3 buttons
 *  - "Decrypt" button: allows you to decrypt the current FHECounter count handle.
 *  - "Increment" button: allows you to increment the FHECounter count handle using FHE operations.
 *  - "Decrement" button: allows you to decrement the FHECounter count handle using FHE operations.
 */
export const FHECounterDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  //////////////////////////////////////////////////////////////////////////////
  // FHEVM instance
  //////////////////////////////////////////////////////////////////////////////

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

  const fheCounter = useFHECounter({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage, // is global, could be invoked directly in useFHECounter hook
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
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
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const titleClass = "font-semibold text-black text-lg mt-4";

  if (!isConnected) {
    return (
      <div className="mx-auto">
        <button
          className={buttonClass}
          disabled={isConnected}
          onClick={connect}
        >
          <span className="text-4xl p-6">Connect to MetaMask</span>
        </button>
      </div>
    );
  }

  if (fheCounter.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black text-white">
        <p className="font-semibold  text-3xl m-5">
          FHEVM React Minimal Template -{" "}
          <span className="font-mono font-normal text-gray-400">
            FHECounter.sol
          </span>
        </p>
      </div>
      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Chain Infos</p>
        {printProperty("ChainId", chainId)}
        {printProperty(
          "Metamask accounts",
          accounts
            ? accounts.length === 0
              ? "No accounts"
              : `{ length: ${accounts.length}, [${accounts[0]}, ...] }`
            : "undefined"
        )}
        {printProperty(
          "Signer",
          ethersSigner ? ethersSigner.address : "No signer"
        )}

        <p className={titleClass}>Contract</p>
        {printProperty("FHECounter", fheCounter.contractAddress)}
        {printProperty("isDeployed", fheCounter.isDeployed)}
      </div>
      <div className="col-span-full mx-20">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>FHEVM instance</p>
            {printProperty(
              "Fhevm Instance",
              fhevmInstance ? "OK" : "undefined"
            )}
            {printProperty("Fhevm Status", fhevmStatus)}
            {printProperty("Fhevm Error", fhevmError ?? "No Error")}
          </div>
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>Status</p>
            {printProperty("isRefreshing", fheCounter.isRefreshing)}
            {printProperty("isDecrypting", fheCounter.isDecrypting)}
            {printProperty("isIncOrDec", fheCounter.isIncOrDec)}
            {printProperty("canGetCount", fheCounter.canGetCount)}
            {printProperty("canDecrypt", fheCounter.canDecrypt)}
            {printProperty("canIncOrDec", fheCounter.canIncOrDec)}
          </div>
        </div>
      </div>
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Count Handle</p>
        {printProperty("countHandle", fheCounter.handle)}
        {printProperty(
          "clear countHandle",
          fheCounter.isDecrypted ? fheCounter.clear : "Not decrypted"
        )}
      </div>
      <div className="grid grid-cols-2 mx-20 gap-4">
        <button
          className={buttonClass}
          disabled={!fheCounter.canDecrypt}
          onClick={fheCounter.decryptCountHandle}
        >
          {fheCounter.canDecrypt
            ? "Decrypt"
            : fheCounter.isDecrypted
              ? `Decrypted clear counter value is ${fheCounter.clear}`
              : fheCounter.isDecrypting
                ? "Decrypting..."
                : "Nothing to decrypt"}
        </button>
        <button
          className={buttonClass}
          disabled={!fheCounter.canGetCount}
          onClick={fheCounter.refreshCountHandle}
        >
          {fheCounter.canGetCount
            ? "Refresh Count Handle"
            : "FHECounter is not available"}
        </button>
      </div>
      <div className="grid grid-cols-2 mx-20 gap-4">
        <button
          className={buttonClass}
          disabled={!fheCounter.canIncOrDec}
          onClick={() => fheCounter.incOrDec(+1)}
        >
          {fheCounter.canIncOrDec
            ? "Increment Counter by 1"
            : fheCounter.isIncOrDec
              ? "Running..."
              : "Cannot increment"}
        </button>
        <button
          className={buttonClass}
          disabled={!fheCounter.canIncOrDec}
          onClick={() => fheCounter.incOrDec(-1)}
        >
          {fheCounter.canIncOrDec
            ? "Decrement Counter by 1"
            : fheCounter.isIncOrDec
              ? "Running..."
              : "cannot decrement"}
        </button>
      </div>
      <div className="col-span-full mx-20 p-4 rounded-lg bg-white border-2 border-black">
        {printProperty("Message", fheCounter.message)}
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
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-black">{displayValue}</span>
    </p>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <p className="text-black">
        {name}:{" "}
        <span className="font-mono font-semibold text-green-500">true</span>
      </p>
    );
  }

  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-red-500">false</span>
    </p>
  );
}
