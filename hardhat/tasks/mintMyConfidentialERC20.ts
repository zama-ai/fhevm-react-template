import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { MyConfidentialERC20 } from "../types";

task("mint")
  .addParam("amount", "Tokens to mint")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers, deployments } = hre;
    const ERC20 = await deployments.get("MyConfidentialERC20");
    const signers = await ethers.getSigners();
    const erc20 = (await ethers.getContractAt("MyConfidentialERC20", ERC20.address)) as MyConfidentialERC20;
    const tx = await erc20.connect(signers[0]).mint(+taskArguments.amount);
    const rcpt = await tx.wait();
    console.info("Mint tx hash: ", rcpt!.hash);
    console.info("Mint done: ", taskArguments.amount, "tokens were minted succesfully");
  });
