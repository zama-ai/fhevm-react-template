import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { spawn } from "child_process";
import dotenv from "dotenv";
import "hardhat-deploy";
import "hardhat-ignore-warnings";
import { HardhatUserConfig, extendProvider } from "hardhat/config";
import { task } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";

import CustomProvider from "./CustomProvider";
// Adjust the import path as needed
import "./tasks/accounts";
import "./tasks/etherscanVerify";
import "./tasks/mintMyConfidentialERC20";
import { setCodeMocked } from "./test/mockedSetup";

extendProvider(async (provider) => {
  const newProvider = new CustomProvider(provider);
  return newProvider;
});

dotenv.config();

// Ensure that we have all the environment variables we need.
const mnemonic: string = process.env.MNEMONIC!;

const chainIds = {
  zama: 8009,
  local: 9000,
  localCoprocessor: 12345,
  sepolia: 11155111,
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case "local":
      jsonRpcUrl = "http://localhost:8545";
      break;
    case "localCoprocessor":
      jsonRpcUrl = "http://localhost:8745";
      break;
    case "zama":
      jsonRpcUrl = "https://devnet.zama.ai";
      break;
    case "sepolia":
      jsonRpcUrl = process.env.SEPOLIA_RPC_URL!;
  }
  return {
    accounts: {
      count: 10,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  };
}

task("coverage").setAction(async (taskArgs, hre, runSuper) => {
  hre.config.networks.hardhat.allowUnlimitedContractSize = true;
  hre.config.networks.hardhat.blockGasLimit = 1099511627775;

  await runSuper(taskArgs);
});

task("test", async (_taskArgs, hre, runSuper) => {
  // Run modified test task
  if (hre.network.name === "hardhat") {
    await setCodeMocked(hre);
  }
  await runSuper();
});

task("node", async (_taskArgs, hre, runSuper) => {
  await setCodeMocked(hre);
  const server = spawn("ts-node", ["--transpile-only", "mockedServices/server.ts"], {
    stdio: "inherit",
  });

  process.on("SIGINT", () => {
    server.kill();
    process.exit(0);
  });
  await runSuper();
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  mocha: {
    timeout: 500000,
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        count: 10,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
    },
    sepolia: getChainConfig("sepolia"),
    zama: getChainConfig("zama"),
    localDev: getChainConfig("local"),
    local: getChainConfig("local"),
    localCoprocessor: getChainConfig("localCoprocessor"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.24",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
      evmVersion: "cancun",
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY!,
  },
  warnings: {
    "*": {
      "transient-storage": false,
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;
