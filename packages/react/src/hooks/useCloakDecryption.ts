import { useCallback, useMemo, useState } from "react";
import { ethers } from "ethers";
import { 
  CloakSDK, 
  DecryptResult, 
  FhevmDecryptionSignatureType,
  CloakSDKError 
} from "@cloak-sdk/core";

export interface UseCloakDecryptionOptions {
  sdk: CloakSDK | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  contractAddress: `0x${string}` | undefined;
}

export interface UseCloakDecryptionReturn {
  canDecrypt: boolean;
  decrypt: (encryptedData: Uint8Array, signature: string) => Promise<DecryptResult>;
  publicDecrypt: (encryptedData: Uint8Array) => Promise<DecryptResult>;
  generateSignature: (durationDays?: number) => Promise<FhevmDecryptionSignatureType | undefined>;
  decryptMultiple: (encryptedDataArray: Uint8Array[], signature: string) => Promise<DecryptResult[]>;
  isDecrypting: boolean;
  isGeneratingSignature: boolean;
  error: CloakSDKError | undefined;
}

export function useCloakDecryption(options: UseCloakDecryptionOptions): UseCloakDecryptionReturn {
  const { sdk, signer, contractAddress } = options;
  
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isGeneratingSignature, setIsGeneratingSignature] = useState(false);
  const [error, setError] = useState<CloakSDKError | undefined>(undefined);

  const canDecrypt = useMemo(
    () => Boolean(sdk?.isReady() && signer && contractAddress),
    [sdk, signer, contractAddress]
  );

  const decrypt = useCallback(
    async (encryptedData: Uint8Array, signature: string): Promise<DecryptResult> => {
      if (!canDecrypt) {
        const error = new CloakSDKError("DECRYPTION_NOT_READY", "Decryption not ready");
        setError(error);
        return { success: false, error: error.message };
      }

      try {
        setIsDecrypting(true);
        setError(undefined);

        const userAddress = await signer!.getAddress();
        const decryption = sdk!.getDecryption();

        const result = await decryption.decrypt({
          contractAddress: contractAddress!,
          userAddress: userAddress as `0x${string}`,
          encryptedData,
          signature,
        });

        return result;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("DECRYPTION_FAILED", "Decryption failed", err);
        setError(error);
        return { success: false, error: error.message };
      } finally {
        setIsDecrypting(false);
      }
    },
    [canDecrypt, sdk, signer, contractAddress]
  );

  const publicDecrypt = useCallback(
    async (encryptedData: Uint8Array): Promise<DecryptResult> => {
      if (!sdk?.isReady()) {
        const error = new CloakSDKError("DECRYPTION_NOT_READY", "SDK not ready");
        setError(error);
        return { success: false, error: error.message };
      }

      try {
        setIsDecrypting(true);
        setError(undefined);

        const decryption = sdk.getDecryption();
        const result = await decryption.publicDecrypt(encryptedData);

        return result;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("DECRYPTION_FAILED", "Public decryption failed", err);
        setError(error);
        return { success: false, error: error.message };
      } finally {
        setIsDecrypting(false);
      }
    },
    [sdk]
  );

  const generateSignature = useCallback(
    async (durationDays: number = 30): Promise<FhevmDecryptionSignatureType | undefined> => {
      if (!canDecrypt) {
        setError(new CloakSDKError("DECRYPTION_NOT_READY", "Decryption not ready"));
        return undefined;
      }

      try {
        setIsGeneratingSignature(true);
        setError(undefined);

        const userAddress = await signer!.getAddress();
        const decryption = sdk!.getDecryption();

        const signature = await decryption.generateDecryptionSignature(
          contractAddress!,
          userAddress as `0x${string}`,
          durationDays
        );

        return signature;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("SIGNATURE_GENERATION_FAILED", "Failed to generate signature", err);
        setError(error);
        return undefined;
      } finally {
        setIsGeneratingSignature(false);
      }
    },
    [canDecrypt, sdk, signer, contractAddress]
  );

  const decryptMultiple = useCallback(
    async (encryptedDataArray: Uint8Array[], signature: string): Promise<DecryptResult[]> => {
      if (!sdk?.isReady()) {
        const error = new CloakSDKError("DECRYPTION_NOT_READY", "SDK not ready");
        setError(error);
        return encryptedDataArray.map(() => ({ success: false, error: error.message }));
      }

      try {
        setIsDecrypting(true);
        setError(undefined);

        const decryption = sdk.getDecryption();
        const results = await decryption.decryptMultiple(encryptedDataArray, signature);

        return results;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("DECRYPTION_FAILED", "Multiple decryption failed", err);
        setError(error);
        return encryptedDataArray.map(() => ({ success: false, error: error.message }));
      } finally {
        setIsDecrypting(false);
      }
    },
    [sdk]
  );

  return {
    canDecrypt,
    decrypt,
    publicDecrypt,
    generateSignature,
    decryptMultiple,
    isDecrypting,
    isGeneratingSignature,
    error,
  };
}
