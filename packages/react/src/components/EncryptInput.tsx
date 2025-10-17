import React, { useState, useCallback } from "react";
import { ethers } from "ethers";
import { 
  CloakSDK, 
  FhevmDataType, 
  EncryptResult,
  CloakSDKError 
} from "@cloak-sdk/core";
import { useCloakEncryption } from "../hooks/useCloakEncryption";

export interface EncryptInputProps {
  sdk: CloakSDK;
  signer: ethers.JsonRpcSigner;
  contractAddress: `0x${string}`;
  dataType: FhevmDataType;
  placeholder?: string;
  label?: string;
  onEncrypt?: (result: EncryptResult) => void;
  onError?: (error: CloakSDKError) => void;
  className?: string;
  disabled?: boolean;
}

export function EncryptInput({
  sdk,
  signer,
  contractAddress,
  dataType,
  placeholder,
  label,
  onEncrypt,
  onError,
  className = "",
  disabled = false,
}: EncryptInputProps) {
  const [value, setValue] = useState<string>("");
  const [isEncrypting, setIsEncrypting] = useState(false);

  const { encrypt, canEncrypt, error } = useCloakEncryption({
    sdk,
    signer,
    contractAddress,
  });

  const handleEncrypt = useCallback(async () => {
    if (!value.trim()) return;

    try {
      setIsEncrypting(true);
      
      // Convert value based on data type
      let convertedValue: any = value;
      switch (dataType) {
        case "externalEbool":
          convertedValue = value.toLowerCase() === "true";
          break;
        case "externalEuint8":
        case "externalEuint16":
        case "externalEuint32":
          convertedValue = parseInt(value, 10);
          break;
        case "externalEuint64":
        case "externalEuint128":
        case "externalEuint256":
          convertedValue = BigInt(value);
          break;
        case "externalEaddress":
          convertedValue = value as `0x${string}`;
          break;
      }

      const result = await encrypt(convertedValue, dataType);
      
      if (result) {
        onEncrypt?.(result);
        setValue(""); // Clear input after successful encryption
      }
    } catch (err) {
      const error = err instanceof CloakSDKError 
        ? err 
        : new CloakSDKError("ENCRYPTION_FAILED", "Encryption failed", err);
      onError?.(error);
    } finally {
      setIsEncrypting(false);
    }
  }, [value, dataType, encrypt, onEncrypt, onError]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEncrypt();
    }
  }, [handleEncrypt]);

  const isDisabled = disabled || !canEncrypt || isEncrypting || !value.trim();

  return (
    <div className={`encrypt-input ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || `Enter ${dataType} value`}
          disabled={disabled || !canEncrypt}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        <button
          onClick={handleEncrypt}
          disabled={isDisabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isEncrypting ? "Encrypting..." : "Encrypt"}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          Error: {error.message}
        </div>
      )}
      
      {!canEncrypt && (
        <div className="mt-2 text-sm text-yellow-600">
          Encryption not available. Please check your connection.
        </div>
      )}
    </div>
  );
}
