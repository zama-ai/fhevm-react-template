import * as fs from "fs";
import * as path from "path";

/* ************************************************************************** *

The purpose of the functions below is:

1. to parse:
  - <root>/packages/<contracts dir>/deployments/localhost/FHECounter.json
  - <root>/packages/<contracts dir>/deployments/sepolia/FHECounter.json

2. generate:
  - <root>/packages/site/abi/FHECounterABI.ts
  - <root>/packages/site/abi/FHECounterAddresses.ts

* ************************************************************************** */

type DeploymentInfo =
  | {
      abiJson: undefined;
      address: "0x0000000000000000000000000000000000000000";
      chainId: number;
      chainName: string;
    }
  | {
      abiJson: string;
      address: `0x{string}`;
      chainId: number;
      chainName: string;
    };

/// Parse <root>/packages/<contracts dir>/deployments/<chainName>/<contractName>.json
function readDeployment(
  chainName: string,
  chainId: number,
  contractName: string,
  deploymentsDir: string
): DeploymentInfo {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    return {
      abiJson: undefined,
      address: "0x0000000000000000000000000000000000000000",
      chainId,
      chainName,
    };
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);

  return {
    abiJson: JSON.stringify({ abi: obj.abi }, null, 2),
    address: obj.address as `0x{string}`,
    chainId,
    chainName,
  };
}

/// Generates FHECounterABI.ts + FHECounterAddress.ts
function saveDeployments(
  abiJson: string | undefined,
  contractName: string,
  outputDir: string,
  sepoliaDeployment: DeploymentInfo,
  localhostDeployment: DeploymentInfo
) {
  if (!abiJson) {
    throw new Error("Null ABI!");
  }

  const tsCode = `
/*
  This file is auto-generated.
  By commands: 'npx hardhat deploy' or 'npx hardhat node'
*/
export const ${contractName}ABI = ${abiJson} as const;
\n`;
  const tsAddresses = `
/*
  This file is auto-generated.
  By commands: 'npx hardhat deploy' or 'npx hardhat node'
*/
export const ${contractName}Addresses = { 
  "${sepoliaDeployment.chainId}": { address: "${sepoliaDeployment.address}", chainId: ${sepoliaDeployment.chainId}, chainName: "sepolia" },
  "${localhostDeployment.chainId}": { address: "${localhostDeployment.address}", chainId: ${localhostDeployment.chainId}, chainName: "hardhat" },
};
`;

  console.log(`✅ Generated ${path.join(outputDir, `${contractName}ABI.ts`)}`);
  console.log(
    `✅ Generated ${path.join(outputDir, `${contractName}Addresses.ts`)}`
  );
  console.log(`✅ Localhost address: ${localhostDeployment.address}`);
  console.log(`✅ Sepolia address: ${sepoliaDeployment.address}`);
  //console.log(tsAddresses);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(
    path.join(outputDir, `${contractName}ABI.ts`),
    tsCode,
    "utf-8"
  );
  fs.writeFileSync(
    path.join(outputDir, `${contractName}Addresses.ts`),
    tsAddresses,
    "utf-8"
  );
}

function resetIfNeeded(
  dep: DeploymentInfo,
  referenceABIJson: string | undefined
): DeploymentInfo {
  if ((dep.abiJson && dep.abiJson !== referenceABIJson) || !referenceABIJson) {
    console.log(`Reset ${dep.chainName}=${dep.chainId} ABI!`);
    return {
      ...dep,
      abiJson: undefined,
      address: "0x0000000000000000000000000000000000000000",
    };
  }
  return dep;
}

export function postDeploy(chainName: string, contractName: string) {
  // chainName === localhost when `npx hardhat deploy --network localhost`
  // chainName === hardhat when `npx hardhat deploy` or `npx hardhat node`
  // chainName === sepolia when `npx hardhat deploy --network sepolia`
  if (
    chainName !== "sepolia" &&
    chainName !== "localhost" &&
    chainName !== "hardhat"
  ) {
    return;
  }
  let localhostDeployment = readDeployment(
    "localhost",
    31337,
    contractName,
    path.resolve("./deployments")
  );
  let sepoliaDeployment = readDeployment(
    "sepolia",
    11155111,
    contractName,
    path.resolve("./deployments")
  );

  // Use the target chain as the ABI reference
  const referenceABIJson =
    chainName === localhostDeployment.chainName || chainName === "hardhat"
      ? localhostDeployment.abiJson
      : sepoliaDeployment.abiJson;

  // Reset if ABI differs from reference ABI
  sepoliaDeployment = resetIfNeeded(sepoliaDeployment, referenceABIJson);
  localhostDeployment = resetIfNeeded(localhostDeployment, referenceABIJson);

  saveDeployments(
    referenceABIJson,
    contractName,
    path.resolve("../site/abi"),
    sepoliaDeployment,
    localhostDeployment
  );
}
