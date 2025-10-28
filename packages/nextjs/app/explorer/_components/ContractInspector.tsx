"use client";

import { useState, useEffect } from "react";
import { PublicClient, Abi } from "viem";
import contractData from "~~/contracts/deployedContracts";

interface ContractInspectorProps {
  publicClient: PublicClient | undefined;
}

interface ContractInfo {
  address: string;
  name: string;
  abi: Abi;
  deployedAt?: string;
}

export const ContractInspector = ({ publicClient }: ContractInspectorProps) => {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load deployed contracts
  useEffect(() => {
    const loadContracts = () => {
      const deployedContracts = contractData as any;
      const contractsList: ContractInfo[] = [];

      // Extract contracts from deployed contracts data
      Object.entries(deployedContracts).forEach(([chainId, chainData]: [string, any]) => {
        Object.entries(chainData).forEach(([contractName, contract]: [string, any]) => {
          if (contract.address && contract.abi) {
            contractsList.push({
              address: contract.address,
              name: contractName,
              abi: contract.abi,
              deployedAt: contract.deployedAt || "Unknown"
            });
          }
        });
      });

      setContracts(contractsList);
    };

    loadContracts();
  }, []);

  const getContractFunctions = (abi: Abi) => {
    return abi.filter(item => item.type === "function");
  };

  const getContractEvents = (abi: Abi) => {
    return abi.filter(item => item.type === "event");
  };

  const formatAbiItem = (item: any) => {
    const inputs = item.inputs?.map((input: any) => `${input.type} ${input.name}`).join(", ") || "";
    return `${item.type} ${item.name}(${inputs})`;
  };

  const callContractFunction = async (contractAddress: string, functionName: string, abi: Abi) => {
    if (!publicClient) return;
    
    setIsLoading(true);
    try {
      // This would need to be implemented based on the specific function
      console.log(`Calling ${functionName} on ${contractAddress}`);
    } catch (error) {
      console.error("Error calling contract function:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold">📋 Contract Inspector</h2>

      {/* Contracts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contracts Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Deployed Contracts</h3>
          <div className="space-y-2">
            {contracts.map((contract, index) => (
              <div 
                key={index}
                className="card bg-base-200 shadow-sm cursor-pointer hover:bg-base-300 transition-colors"
                onClick={() => setSelectedContract(contract)}
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{contract.name}</h4>
                      <div className="font-mono text-sm text-base-content/70">
                        {contract.address}
                      </div>
                    </div>
                    <div className="badge badge-primary">
                      {getContractFunctions(contract.abi).length} functions
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {contracts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-base-content/50">
                No deployed contracts found. Deploy some contracts to see them here.
              </div>
            </div>
          )}
        </div>

        {/* Contract Details */}
        <div className="space-y-4">
          {selectedContract ? (
            <>
              <h3 className="text-lg font-semibold">Contract Details</h3>
              
              {/* Contract Info */}
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h4 className="card-title">{selectedContract.name}</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm font-medium text-base-content/70">Address</div>
                      <div className="font-mono text-sm break-all">
                        {selectedContract.address}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-base-content/70">Deployed At</div>
                      <div className="text-sm">{selectedContract.deployedAt}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functions */}
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h4 className="card-title">Functions</h4>
                  <div className="space-y-2">
                    {getContractFunctions(selectedContract.abi).map((func, index) => (
                      <div key={index} className="p-2 bg-base-100 rounded">
                        <div className="font-mono text-sm">
                          {formatAbiItem(func)}
                        </div>
                        {func.stateMutability && (
                          <div className="text-xs text-base-content/70 mt-1">
                            {func.stateMutability}
                          </div>
                        )}
                        {func.stateMutability === "view" || func.stateMutability === "pure" ? (
                          <button
                            className="btn btn-outline btn-xs mt-2"
                            onClick={() => callContractFunction(selectedContract.address, func.name, selectedContract.abi)}
                            disabled={isLoading}
                          >
                            Call
                          </button>
                        ) : (
                          <div className="text-xs text-warning mt-1">
                            Write function - requires transaction
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Events */}
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h4 className="card-title">Events</h4>
                  <div className="space-y-2">
                    {getContractEvents(selectedContract.abi).map((event, index) => (
                      <div key={index} className="p-2 bg-base-100 rounded">
                        <div className="font-mono text-sm">
                          {formatAbiItem(event)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h4 className="card-title">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-outline btn-sm">
                      📋 Copy ABI
                    </button>
                    <button className="btn btn-outline btn-sm">
                      📊 View Events
                    </button>
                    <button className="btn btn-outline btn-sm">
                      🔍 Verify Contract
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-base-content/50">
                Select a contract to view its details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
