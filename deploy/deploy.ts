import { DeployFunction } from "hardhat-deploy/types";
// import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: any) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedMockAuction = await deploy("MockAuction", {
    from: deployer,
    log: true,
  });

  console.log(`MockAuction contract: `, deployedMockAuction.address);
};
export default func;
func.id = "deploy_mockAuction";
func.tags = ["MockAuction"];
