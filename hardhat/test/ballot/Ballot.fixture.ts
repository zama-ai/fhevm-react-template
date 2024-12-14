import { ethers } from "hardhat";

import type { Ballot } from "../../types";
import { getSigners } from "../signers";

export async function deployBallot(): Promise<Ballot> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("Ballot");
  const contract = await contractFactory.connect(signers.alice).deploy("1000"); // City of Zama's battle
  await contract.waitForDeployment();

  return contract;
}
