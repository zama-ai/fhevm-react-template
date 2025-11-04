import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(`\n🚀 Deploying MockAuction on network: ${hre.network.name}`);
  console.log(`📍 Deployer address: ${deployer}`);

  const deployedMockAuction = await deploy("MockAuction", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });

  console.log(`✅ MockAuction deployed at: ${deployedMockAuction.address}`);
  console.log(`📝 Transaction hash: ${deployedMockAuction.transactionHash}`);
  console.log(`\n💡 To interact with the contract, use:`);
  console.log(`   Address: ${deployedMockAuction.address}`);
};

export default func;
func.id = "deploy_mockAuction";
func.tags = ["MockAuction"];
func.skip = async (hre: HardhatRuntimeEnvironment) => {
  return hre.network.name === "hardhat";
};
