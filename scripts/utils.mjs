import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

const CONTRACTS_PACKAGE_DIR = "fhevm-hardhat-template";

function getContractsPackageName() {
  const pkgDir = path.resolve(`./packages/${CONTRACTS_PACKAGE_DIR}`);
  const jsonString = fs.readFileSync(
    path.join(pkgDir, "package.json"),
    "utf-8"
  );

  const obj = JSON.parse(jsonString);
  return obj.name;
}

async function getBlockNumber(url) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_blockNumber",
      params: [],
    }),
  });
  if (!r.ok) {
    throw new Error();
  }
  const data = await r.json();
  if (data.error) {
    throw new Error();
  }
  return Number(data.result);
}

export async function tryGetBlockNumber() {
  try {
    const blockNumber = await getBlockNumber("http://localhost:8545");
    return Number(blockNumber);
  } catch {
    return undefined;
  }
}

export async function checkIfHardhatNodeIsRunning() {
  const rootDir = path.resolve("..");

  const blockNumber = await tryGetBlockNumber();

  if (blockNumber === undefined) {
    console.error("\n");
    console.error(
      "===============================================================================\n"
    );
    console.error(" 💥❌ Local Hardhat Node is not running!\n");
    console.error("   To start Hardhat Node:");
    console.error("   ----------------------");
    console.error("   ✅ 1. Open a new terminal window, then run:");
    console.error(`   ✅ 2. cd ${rootDir}`);
    console.error("   ✅ 3. npm run hardhat-node");
    console.error(
      "\n===============================================================================\n"
    );
    console.error("\n");

    process.exit(1);
  } else {
    console.log(
      `✅ Local Hardhat Node is running. Current block number: ${blockNumber}`
    );
  }
}

function npmHardhatDeploy(network) {
  try {
    const pkgName = getContractsPackageName();
    let opt = "";
    if (network) {
      opt = `--network ${network}`;
    }
    console.log(`> npx -w ${pkgName} hardhat deploy ${opt}`);
    execSync(`npx -w ${pkgName} hardhat deploy ${opt}`, {
      stdio: "inherit",
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

export async function generateSiteABI() {
  // To generate the addresses, we basically use the 'hardhat-deploy' plugin
  // In the contracts package directory, the typescript file 'deploy/deploy.ts' contains a call to 'postDeploy'
  // whose main goal is to generate the site/abi/<ContractName>Addresses.ts + site/abi/<ContractName>ABI.ts
  // typescript files after the deploy is completed.
  //
  // If the hardhat node is running, we call 'npx hardhat deploy --network localhost'
  // otherwise we call 'npx hardhat deploy' using in-memory node.
  const network =
    (await tryGetBlockNumber()) !== undefined ? "localhost" : undefined;
  npmHardhatDeploy(network);
}
