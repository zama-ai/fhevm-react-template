import type { Abi, Address } from "viem";

export type ContractDeployment = {
  address: Address;
  abi: Abi;
  inheritedFunctions?: Record<string, string>;
  deployedOnBlock: number;
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: ContractDeployment;
  };
};

/** Pick a deployment for a chain, preserving the narrow (as-const) shape
 *  so viem/wagmi can still infer function names and return types from the ABI.
 *
 *  contracts/<Name>.ts exports `{...REMOTE, ...LOCAL} as const satisfies
 *  Partial<Record<number, ContractDeployment>>`; when both sides are empty on
 *  a fresh clone, `keyof typeof X` collapses to `never`. The bracketed
 *  conditional avoids distribution and falls back to the wide ContractDeployment
 *  type so the helper stays usable (returning `ContractDeployment | undefined`)
 *  until the sidecar or remote entries are populated. */
type DeploymentOf<T> = [keyof T] extends [never] ? ContractDeployment : NonNullable<T[keyof T]>;

export function deploymentFor<T extends Partial<Record<number, ContractDeployment>>>(
  byChain: T,
  chainId: number,
): DeploymentOf<T> | undefined {
  return (byChain as Partial<Record<number, DeploymentOf<T>>>)[chainId];
}
