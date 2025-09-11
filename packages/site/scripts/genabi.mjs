import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "FHECounter";

// <root>/packages/fhevm-hardhat-template
const rel = "../fhevm-hardhat-template";

// <root>/packages/site/components
const abidir = path.resolve("./abi");

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

function printError(dir) {
  console.error(`
  
  * ==============================================================================  *
  *                                                                                 *
  *  \u001b[31mPlease Run "fhevm-react-template" Installer First!\u001b[0m                             *
  *  \u001b[31m==================================================\u001b[0m                             *
  *                                                                                 *
  *  It looks like the 'fhevm-react-template' installer hasn't been run.            *
  *  🚚 Please run the setup script below to complete installation:                 *
  *                                                                                 *
  *       \u001b[36mnode ./scripts/install.mjs\u001b[0m                                                *
  *                                                                                 *
  *   For manual install, see:                                                      *
  *   \u001b[33mhttps://github.com/zama-ai/fhevm-react-template/blob/main/README.md#install\u001b[0m   *
  *                                                                                 *
  * =============================================================================== *
  
    
  \u001b[31mError\u001b[0m Directory ${dir} does not exist.
  

  `);
}

if (!fs.existsSync(dir)) {
  printError(dir);
  process.exit(1);
}

if (!fs.existsSync(abidir)) {
  fs.mkdirSync(abidir);
}

if (!fs.existsSync(abidir)) {
  console.error(`${line}Unable to locate ${abidir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function deployOnHardhatNode() {
  if (process.platform === "win32") {
    // Not supported on Windows
    return;
  }
  try {
    execSync(`./deploy-hardhat-node.sh`, {
      cwd: path.resolve("./scripts"),
      stdio: "inherit",
    });
  } catch (e) {
    console.error(`${line}Script execution failed: ${e}${line}`);
    process.exit(1);
  }
}

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir) && chainId === 31337) {
    // Try to auto-deploy the contract on hardhat node!
    deployOnHardhatNode();
  }

  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Auto deployed on Linux/Mac (will fail on windows)
const deployLocalhost = readDeployment(
  "localhost",
  31337,
  CONTRACT_NAME,
  false /* optional */
);

// Sepolia is optional
let deploySepolia = readDeployment(
  "sepolia",
  11155111,
  CONTRACT_NAME,
  true /* optional */
);
if (!deploySepolia) {
  deploySepolia = {
    abi: deployLocalhost.abi,
    address: "0x0000000000000000000000000000000000000000",
  };
}

if (deployLocalhost && deploySepolia) {
  if (
    JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)
  ) {
    console.error(
      `${line}Deployments on localhost and Sepolia differ. Cant use the same abi on both networks. Consider re-deploying the contracts on both networks.${line}`
    );
    process.exit(1);
  }
}

const contractAbi = JSON.stringify({ abi: deployLocalhost.abi }, null, 2);

const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${contractAbi} as const;
\n`;
const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" },
};
`;

console.log(`Generated ${path.join(abidir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(abidir, `${CONTRACT_NAME}Addresses.ts`)}`);
console.log(tsAddresses);

fs.writeFileSync(path.join(abidir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(abidir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);
