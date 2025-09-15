import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { postDeploy } from "postdeploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const chainId = await hre.getChainId();
  const chainName = hre.network.name;

  const contractName = "FHECounter";
  const deployed = await deploy(contractName, {
    from: deployer,
    log: true,
  });

  console.log(`${contractName} contract address: ${deployed.address}`);
  console.log(`${contractName} chainId: ${chainId}`);
  console.log(`${contractName} chainName: ${chainName}`);

  // Generates:
  //  - <root>/packages/site/abi/FHECounterABI.ts
  //  - <root>/packages/site/abi/FHECounterAddresses.ts
  postDeploy(chainName, contractName);
};

export default func;

func.id = "deploy_fheCounter"; // id required to prevent reexecution
func.tags = ["FHECounter"];
