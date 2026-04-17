import { AllowedChainIds } from "./networks";
import { Abi, Address } from "viem";
import deployedContractsData from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

export type InheritedFunctions = { readonly [key: string]: string };

export type GenericContract = {
  address: Address;
  abi: Abi;
  inheritedFunctions?: InheritedFunctions;
  external?: true;
  deployedOnBlock?: number;
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract;
  };
};

export const contracts = deployedContractsData as GenericContractsDeclaration | null;

type ConfiguredChainId = (typeof scaffoldConfig)["targetNetworks"][0]["id"];

type IsContractDeclarationMissing<TYes, TNo> = typeof deployedContractsData extends { [key in ConfiguredChainId]: any }
  ? TNo
  : TYes;

type ContractsDeclaration = IsContractDeclarationMissing<GenericContractsDeclaration, typeof deployedContractsData>;

type Contracts = ContractsDeclaration[ConfiguredChainId];

export type ContractName = keyof Contracts;

export type Contract<TContractName extends ContractName> = Contracts[TContractName];

export enum ContractCodeStatus {
  "LOADING",
  "DEPLOYED",
  "NOT_FOUND",
}

export type UseDeployedContractConfig<TContractName extends ContractName> = {
  contractName: TContractName;
  chainId?: AllowedChainIds;
};
