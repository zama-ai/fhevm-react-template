import { useCallback, useMemo, useState } from "react";
import { ethers } from "ethers";
import { 
  CloakSDK, 
  EncryptResult, 
  FhevmDataType,
  CloakSDKError 
} from "@cloak-sdk/core";

export interface UseCloakEncryptionOptions {
  sdk: CloakSDK | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  contractAddress: `0x${string}` | undefined;
}

export interface UseCloakEncryptionReturn {
  canEncrypt: boolean;
  encrypt: (data: any, dataType: FhevmDataType) => Promise<EncryptResult | undefined>;
  encryptMultiple: (dataArray: Array<{ data: any; dataType: FhevmDataType }>) => Promise<EncryptResult | undefined>;
  createEncryptedInput: () => any;
  isEncrypting: boolean;
  error: CloakSDKError | undefined;
}

export function useCloakEncryption(options: UseCloakEncryptionOptions): UseCloakEncryptionReturn {
  const { sdk, signer, contractAddress } = options;
  
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<CloakSDKError | undefined>(undefined);

  const canEncrypt = useMemo(
    () => Boolean(sdk?.isReady() && signer && contractAddress),
    [sdk, signer, contractAddress]
  );

  const encrypt = useCallback(
    async (data: any, dataType: FhevmDataType): Promise<EncryptResult | undefined> => {
      if (!canEncrypt) {
        setError(new CloakSDKError("ENCRYPTION_NOT_READY", "Encryption not ready"));
        return undefined;
      }

      try {
        setIsEncrypting(true);
        setError(undefined);

        const userAddress = await signer!.getAddress();
        const encryption = sdk!.getEncryption();

        const result = await encryption.encrypt({
          contractAddress: contractAddress!,
          userAddress: userAddress as `0x${string}`,
          data,
          dataType,
        });

        return result;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("ENCRYPTION_FAILED", "Encryption failed", err);
        setError(error);
        return undefined;
      } finally {
        setIsEncrypting(false);
      }
    },
    [canEncrypt, sdk, signer, contractAddress]
  );

  const encryptMultiple = useCallback(
    async (dataArray: Array<{ data: any; dataType: FhevmDataType }>): Promise<EncryptResult | undefined> => {
      if (!canEncrypt) {
        setError(new CloakSDKError("ENCRYPTION_NOT_READY", "Encryption not ready"));
        return undefined;
      }

      try {
        setIsEncrypting(true);
        setError(undefined);

        const userAddress = await signer!.getAddress();
        const encryption = sdk!.getEncryption();

        const result = await encryption.encryptMultiple(
          contractAddress!,
          userAddress as `0x${string}`,
          dataArray
        );

        return result;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("ENCRYPTION_FAILED", "Multiple encryption failed", err);
        setError(error);
        return undefined;
      } finally {
        setIsEncrypting(false);
      }
    },
    [canEncrypt, sdk, signer, contractAddress]
  );

  const createEncryptedInput = useCallback(async () => {
    if (!canEncrypt) {
      setError(new CloakSDKError("ENCRYPTION_NOT_READY", "Encryption not ready"));
      return undefined;
    }

    try {
      setError(undefined);
      const encryption = sdk!.getEncryption();
      const userAddress = await signer!.getAddress();
      return encryption.createEncryptedInput(contractAddress!, userAddress as `0x${string}`);
    } catch (err) {
      const error = err instanceof CloakSDKError 
        ? err 
        : new CloakSDKError("ENCRYPTION_FAILED", "Failed to create encrypted input", err);
      setError(error);
      return undefined;
    }
  }, [canEncrypt, sdk, signer, contractAddress]);

  return {
    canEncrypt,
    encrypt,
    encryptMultiple,
    createEncryptedInput,
    isEncrypting,
    error,
  };
}
