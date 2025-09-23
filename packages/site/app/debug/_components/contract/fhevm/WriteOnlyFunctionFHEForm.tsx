"use client";

import { useEffect, useMemo, useState } from "react";
import { InheritanceTooltip } from "../InheritanceTooltip";
import { useFhevm } from "@fhevm-sdk";
import { buildParamsFromAbi, getEncryptionMethod, useFHEEncryption } from "@fhevm-sdk";
import { Abi, AbiFunction } from "abitype";
import { Address, TransactionReceipt } from "viem";
import { useAccount, useConfig, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  ContractInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useWagmiEthers } from "~~/hooks/wagmi/useWagmiEthers";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import { simulateContractWriteAndNotifyError } from "~~/utils/scaffold-eth/contract";

type WriteOnlyFunctionFormProps = {
  abi: Abi;
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
  inheritedFrom?: string;
};

export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string>("");
  const { chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;

  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const wagmiConfig = useConfig();

  // FHE setup
  const { chainId, ethersSigner } = useWagmiEthers();

  // Create EIP-1193 provider from wagmi for FHEVM
  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
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
    enabled: true,
  });

  const { canEncrypt, encryptWith } = useFHEEncryption({
    instance: fhevmInstance,
    ethersSigner,
    contractAddress: contractAddress as `0x${string}`,
  });

  // Detect FHE inputs by checking internalType for externalE* patterns
  // Group FHE inputs with their corresponding proof fields
  const fheInputGroups = useMemo(() => {
    const inputs = abiFunction.inputs ?? [];
    const groups: Array<{
      fheInput: any;
      fheIndex: number;
      proofIndex?: number;
    }> = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i] as any;
      if (input.internalType?.startsWith("externalE")) {
        // Look for a corresponding proof field (usually the next input)
        const nextInput = inputs[i + 1] as any;
        const isProof =
          nextInput?.type === "bytes" && (nextInput?.name?.includes("Proof") || nextInput?.name?.includes("proof"));

        groups.push({
          fheInput: input,
          fheIndex: i,
          proofIndex: isProof ? i + 1 : undefined,
        });
      }
    }

    return groups;
  }, [abiFunction.inputs]);

  const hasFheInputs = fheInputGroups.length > 0;

  const handleWrite = async () => {
    if (writeContractAsync) {
      try {
        let finalArgs = getParsedContractFunctionArgs(form);

        // Handle FHE encryption if this function has FHE inputs
        if (hasFheInputs && canEncrypt) {
          // Collect plaintext values for FHE input groups
          const plaintexts = fheInputGroups.map(({ fheInput, fheIndex }) => {
            const key = getFunctionInputKey(abiFunction.name, fheInput, fheIndex);
            return form[key];
          });

          // Encrypt all FHE inputs at once
          const enc = await encryptWith(builder => {
            fheInputGroups.forEach(({ fheInput }, i) => {
              const method = getEncryptionMethod(fheInput.internalType);
              (builder as any)[method](plaintexts[i]);
            });
          });

          if (!enc) {
            throw new Error("FHE encryption failed");
          }

          // Build contract args from encrypted data using ABI-driven transformer
          finalArgs = buildParamsFromAbi(enc, abi as any[], abiFunction.name);
        }

        const writeContractObj = {
          address: contractAddress,
          functionName: abiFunction.name,
          abi: abi,
          args: finalArgs,
          value: BigInt(txValue || "0"),
        };

        await simulateContractWriteAndNotifyError({
          wagmiConfig,
          writeContractParams: writeContractObj,
          chainId: targetNetwork.id as AllowedChainIds,
        });

        const makeWriteWithParams = () => writeContractAsync(writeContractObj);
        await writeTxn(makeWriteWithParams);
        onChange();
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionFHEForm.tsx:handleWrite ~ error", e);
      }
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransactionReceipt({
    hash: result,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  const transformedFunction = useMemo(() => transformAbiFunction(abiFunction), [abiFunction]);

  // Create inputs, grouping FHE inputs with their proofs
  const inputs = useMemo(() => {
    const transformedInputs = transformedFunction.inputs;
    const processedIndices = new Set<number>();
    const result: React.ReactNode[] = [];

    // First, handle FHE input groups
    fheInputGroups.forEach((group, groupIndex) => {
      const { fheInput, fheIndex, proofIndex } = group;

      // Mark these indices as processed
      processedIndices.add(fheIndex);
      if (proofIndex !== undefined) {
        processedIndices.add(proofIndex);
      }

      // Create a single input for the FHE group
      const key = getFunctionInputKey(abiFunction.name, fheInput, fheIndex);
      const transformedInput = transformedInputs[fheIndex];

      result.push(
        <div key={`fhe-group-${groupIndex}`} className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{fheInput.name} (plaintext for FHE encryption)</label>
          <ContractInput
            setForm={updatedFormValue => {
              setDisplayedTxResult(undefined);
              setForm(updatedFormValue);
            }}
            form={form}
            stateObjectKey={key}
            paramType={transformedInput}
          />
        </div>,
      );
    });

    // Then handle remaining regular inputs
    transformedInputs.forEach((input, inputIndex) => {
      if (!processedIndices.has(inputIndex)) {
        const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
        result.push(
          <ContractInput
            key={key}
            setForm={updatedFormValue => {
              setDisplayedTxResult(undefined);
              setForm(updatedFormValue);
            }}
            form={form}
            stateObjectKey={key}
            paramType={input}
          />,
        );
      }
    });

    return result;
  }, [transformedFunction.inputs, fheInputGroups, form, abiFunction.name]);
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">
          {abiFunction.name}
          <InheritanceTooltip inheritedFrom={inheritedFrom} />
          {hasFheInputs && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">FHE Function</span>
          )}
        </p>
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center ml-2">
              <span className="text-xs font-medium mr-2 leading-none">payable value</span>
              <span className="block text-xs font-extralight leading-none">wei</span>
            </div>
            <IntegerInput
              value={txValue}
              onChange={updatedTxValue => {
                setDisplayedTxResult(undefined);
                setTxValue(updatedTxValue);
              }}
              placeholder="value (wei)"
            />
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="grow basis-0">{displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}</div>
          )}
          <div className="flex flex-col gap-2">
            {hasFheInputs && (
              <div className="text-xs text-gray-600">
                {fhevmStatus === "ready" && canEncrypt ? (
                  <span className="text-green-600">✓ FHE encryption ready</span>
                ) : fhevmStatus === "loading" ? (
                  <span className="text-yellow-600">⏳ Loading FHE instance...</span>
                ) : fhevmError ? (
                  <span className="text-red-600">✗ FHE error: {fhevmError.message}</span>
                ) : (
                  <span className="text-gray-500">FHE not available</span>
                )}
              </div>
            )}
            <div
              className={`flex ${
                (writeDisabled || (hasFheInputs && !canEncrypt)) &&
                "tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:-translate-x-1/3 before:left-auto before:transform-none"
              }`}
              data-tip={`${
                writeDisabled
                  ? "Wallet not connected or in the wrong network"
                  : hasFheInputs && !canEncrypt
                    ? "FHE encryption not available"
                    : ""
              }`}
            >
              <button
                className="btn btn-secondary btn-sm"
                disabled={writeDisabled || isPending || (hasFheInputs && !canEncrypt)}
                onClick={handleWrite}
              >
                {isPending && <span className="loading loading-spinner loading-xs"></span>}
                {hasFheInputs ? "Encrypt & Send 🔐" : "Send 💸"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {zeroInputs && txResult ? (
        <div className="grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};
