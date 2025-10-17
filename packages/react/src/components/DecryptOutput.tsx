import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { 
  CloakSDK, 
  DecryptResult,
  FhevmDecryptionSignatureType,
  CloakSDKError 
} from "@cloak-sdk/core";
import { useCloakDecryption } from "../hooks/useCloakDecryption";

export interface DecryptOutputProps {
  sdk: CloakSDK;
  signer: ethers.JsonRpcSigner;
  contractAddress: `0x${string}`;
  encryptedData: Uint8Array;
  signature?: string;
  onDecrypt?: (result: DecryptResult) => void;
  onError?: (error: CloakSDKError) => void;
  className?: string;
  disabled?: boolean;
  showSignatureGeneration?: boolean;
}

export function DecryptOutput({
  sdk,
  signer,
  contractAddress,
  encryptedData,
  signature,
  onDecrypt,
  onError,
  className = "",
  disabled = false,
  showSignatureGeneration = true,
}: DecryptOutputProps) {
  const [decryptResult, setDecryptResult] = useState<DecryptResult | null>(null);
  const [generatedSignature, setGeneratedSignature] = useState<FhevmDecryptionSignatureType | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isGeneratingSignature, setIsGeneratingSignature] = useState(false);

  const { 
    decrypt, 
    publicDecrypt, 
    generateSignature, 
    canDecrypt, 
    error 
  } = useCloakDecryption({
    sdk,
    signer,
    contractAddress,
  });

  const handleDecrypt = useCallback(async () => {
    if (!encryptedData) return;

    try {
      setIsDecrypting(true);
      setDecryptResult(null);

      let result: DecryptResult;
      
      if (signature || generatedSignature) {
        // Use provided signature or generated signature
        const sig = signature || generatedSignature?.signature;
        if (!sig) {
          throw new CloakSDKError("NO_SIGNATURE", "No signature available for decryption");
        }
        result = await decrypt(encryptedData, sig);
      } else {
        // Try public decryption
        result = await publicDecrypt(encryptedData);
      }

      setDecryptResult(result);
      onDecrypt?.(result);
    } catch (err) {
      const error = err instanceof CloakSDKError 
        ? err 
        : new CloakSDKError("DECRYPTION_FAILED", "Decryption failed", err);
      onError?.(error);
    } finally {
      setIsDecrypting(false);
    }
  }, [encryptedData, signature, generatedSignature, decrypt, publicDecrypt, onDecrypt, onError]);

  const handleGenerateSignature = useCallback(async () => {
    try {
      setIsGeneratingSignature(true);
      const sig = await generateSignature(30); // 30 days duration
      setGeneratedSignature(sig || null);
    } catch (err) {
      const error = err instanceof CloakSDKError 
        ? err 
        : new CloakSDKError("SIGNATURE_GENERATION_FAILED", "Failed to generate signature", err);
      onError?.(error);
    } finally {
      setIsGeneratingSignature(false);
    }
  }, [generateSignature, onError]);

  const isDisabled = disabled || !canDecrypt || isDecrypting || !encryptedData;

  return (
    <div className={`decrypt-output ${className}`}>
      <div className="space-y-4">
        {/* Signature Generation */}
        {showSignatureGeneration && !signature && !generatedSignature && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Generate Decryption Signature
            </h4>
            <p className="text-sm text-yellow-700 mb-3">
              You need a signature to decrypt this data. Generate one below:
            </p>
            <button
              onClick={handleGenerateSignature}
              disabled={disabled || !canDecrypt || isGeneratingSignature}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGeneratingSignature ? "Generating..." : "Generate Signature"}
            </button>
          </div>
        )}

        {/* Signature Info */}
        {(signature || generatedSignature) && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Decryption Signature Available
            </h4>
            {generatedSignature && (
              <div className="text-sm text-green-700">
                <p>Expires in: {generatedSignature.durationDays} days</p>
                <p>Generated: {new Date(generatedSignature.startTimestamp * 1000).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Decrypt Button */}
        <div className="flex gap-2">
          <button
            onClick={handleDecrypt}
            disabled={isDisabled}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isDecrypting ? "Decrypting..." : "Decrypt"}
          </button>
        </div>

        {/* Decryption Result */}
        {decryptResult && (
          <div className={`p-4 border rounded-md ${
            decryptResult.success 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <h4 className={`text-sm font-medium mb-2 ${
              decryptResult.success ? "text-green-800" : "text-red-800"
            }`}>
              Decryption Result
            </h4>
            {decryptResult.success ? (
              <div className="text-sm text-green-700">
                <p className="font-mono break-all">
                  {typeof decryptResult.data === "object" 
                    ? JSON.stringify(decryptResult.data, null, 2)
                    : String(decryptResult.data)
                  }
                </p>
              </div>
            ) : (
              <div className="text-sm text-red-700">
                <p>Error: {decryptResult.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="text-sm font-medium text-red-800 mb-2">Error</h4>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}

        {/* Status Messages */}
        {!canDecrypt && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              Decryption not available. Please check your connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
