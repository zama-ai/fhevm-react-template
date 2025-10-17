import { useCallback, useMemo, useState } from "react";
import { ethers } from "ethers";
import { 
  CloakSDK, 
  ContractCallOptions, 
  EncryptResult,
  CloakSDKError 
} from "@cloak-sdk/core";

export interface UseCloakContractOptions {
  sdk: CloakSDK | undefined;
  signer: ethers.JsonRpcSigner | undefined;
  contractAddress: `0x${string}` | undefined;
  abi: any[];
}

export interface UseCloakContractReturn {
  canCallContract: boolean;
  callWithEncryptedParams: (functionName: string, encryptedParams: EncryptResult) => Promise<any>;
  callWithRegularParams: (functionName: string, regularParams: any[]) => Promise<any>;
  estimateGas: (functionName: string, params: EncryptResult | any[]) => Promise<bigint | undefined>;
  getContract: () => ethers.Contract | undefined;
  isCalling: boolean;
  isEstimating: boolean;
  error: CloakSDKError | undefined;
}

export function useCloakContract(options: UseCloakContractOptions): UseCloakContractReturn {
  const { sdk, signer, contractAddress, abi } = options;
  
  const [isCalling, setIsCalling] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<CloakSDKError | undefined>(undefined);

  const canCallContract = useMemo(
    () => Boolean(sdk?.isReady() && signer && contractAddress && abi.length > 0),
    [sdk, signer, contractAddress, abi]
  );

  const callWithEncryptedParams = useCallback(
    async (functionName: string, encryptedParams: EncryptResult): Promise<any> => {
      if (!canCallContract) {
        const error = new CloakSDKError("CONTRACT_NOT_READY", "Contract not ready");
        setError(error);
        throw error;
      }

      try {
        setIsCalling(true);
        setError(undefined);

        const contract = sdk!.getContract();
        const result = await contract.callWithEncryptedParams({
          contractAddress: contractAddress!,
          functionName,
          abi,
          encryptedParams,
          signer: signer!,
        });

        return result;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("CONTRACT_CALL_FAILED", "Contract call failed", err);
        setError(error);
        throw error;
      } finally {
        setIsCalling(false);
      }
    },
    [canCallContract, sdk, signer, contractAddress, abi]
  );

  const callWithRegularParams = useCallback(
    async (functionName: string, regularParams: any[]): Promise<any> => {
      if (!canCallContract) {
        const error = new CloakSDKError("CONTRACT_NOT_READY", "Contract not ready");
        setError(error);
        throw error;
      }

      try {
        setIsCalling(true);
        setError(undefined);

        const contract = sdk!.getContract();
        const result = await contract.callWithRegularParams({
          contractAddress: contractAddress!,
          functionName,
          abi,
          regularParams,
          signer: signer!,
        });

        return result;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("CONTRACT_CALL_FAILED", "Contract call failed", err);
        setError(error);
        throw error;
      } finally {
        setIsCalling(false);
      }
    },
    [canCallContract, sdk, signer, contractAddress, abi]
  );

  const estimateGas = useCallback(
    async (functionName: string, params: EncryptResult | any[]): Promise<bigint | undefined> => {
      if (!canCallContract) {
        const error = new CloakSDKError("CONTRACT_NOT_READY", "Contract not ready");
        setError(error);
        return undefined;
      }

      try {
        setIsEstimating(true);
        setError(undefined);

        const contract = sdk!.getContract();
        
        const options: ContractCallOptions = {
          contractAddress: contractAddress!,
          functionName,
          abi,
          signer: signer!,
        };

        if (Array.isArray(params)) {
          options.regularParams = params;
        } else {
          options.encryptedParams = params;
        }

        const gasEstimate = await contract.estimateGas(options);
        return gasEstimate;
      } catch (err) {
        const error = err instanceof CloakSDKError 
          ? err 
          : new CloakSDKError("GAS_ESTIMATION_FAILED", "Gas estimation failed", err);
        setError(error);
        return undefined;
      } finally {
        setIsEstimating(false);
      }
    },
    [canCallContract, sdk, signer, contractAddress, abi]
  );

  const getContract = useCallback((): ethers.Contract | undefined => {
    if (!canCallContract) {
      setError(new CloakSDKError("CONTRACT_NOT_READY", "Contract not ready"));
      return undefined;
    }

    try {
      setError(undefined);
      const contract = sdk!.getContract();
      return contract.getContractInstance(contractAddress!, abi, signer!);
    } catch (err) {
      const error = err instanceof CloakSDKError 
        ? err 
        : new CloakSDKError("CONTRACT_CREATION_FAILED", "Failed to create contract instance", err);
      setError(error);
      return undefined;
    }
  }, [canCallContract, sdk, signer, contractAddress, abi]);

  return {
    canCallContract,
    callWithEncryptedParams,
    callWithRegularParams,
    estimateGas,
    getContract,
    isCalling,
    isEstimating,
    error,
  };
}
