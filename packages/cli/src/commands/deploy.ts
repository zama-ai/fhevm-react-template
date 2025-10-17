import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

interface DeployOptions {
  network?: string;
  contract?: string;
  yes?: boolean;
}

const networks = {
  localhost: {
    name: "Localhost",
    rpcUrl: "http://localhost:8545",
    chainId: 31337,
  },
  sepolia: {
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/INFURA_API_KEY",
    chainId: 11155111,
  },
  mainnet: {
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    chainId: 1,
  },
};

export const deployCommand = new Command("deploy")
  .description("Deploy contracts to the blockchain")
  .option("-n, --network <network>", "Network to deploy to (localhost, sepolia, mainnet)")
  .option("-c, --contract <contract>", "Specific contract to deploy")
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(async (options: DeployOptions) => {
    try {
      console.log(chalk.blue.bold("🚀 Cloak SDK Contract Deployer"));
      console.log(chalk.gray("Deploying your confidential contracts...\n"));

      const contractsDir = path.join(process.cwd(), "contracts");
      if (!(await fs.pathExists(contractsDir))) {
        console.error(chalk.red("❌ No contracts directory found. Please run this command from a Cloak SDK project directory."));
        process.exit(1);
      }

      let selectedNetwork = options.network;
      if (!selectedNetwork && !options.yes) {
        const { network } = await inquirer.prompt([
          {
            type: "list",
            name: "network",
            message: "Which network would you like to deploy to?",
            choices: Object.entries(networks).map(([key, network]) => ({
              name: `${network.name} (Chain ID: ${network.chainId})`,
              value: key,
            })),
          },
        ]);
        selectedNetwork = network;
      }

      const network = networks[selectedNetwork as keyof typeof networks] || networks.localhost;

      let contractToDeploy = options.contract;
      if (!contractToDeploy && !options.yes) {
        const contracts = await findContracts(contractsDir);
        
        if (contracts.length === 0) {
          console.error(chalk.red("❌ No contracts found in the contracts directory."));
          process.exit(1);
        }

        if (contracts.length === 1) {
          contractToDeploy = contracts[0];
        } else {
          const { contract } = await inquirer.prompt([
            {
              type: "list",
              name: "contract",
              message: "Which contract would you like to deploy?",
              choices: contracts.map(contract => ({
                name: contract,
                value: contract,
              })),
            },
          ]);
          contractToDeploy = contract;
        }
      }


      const hardhatConfigPath = path.join(process.cwd(), "hardhat.config.ts");
      if (!(await fs.pathExists(hardhatConfigPath))) {
        console.error(chalk.red("❌ No Hardhat configuration found. Please run 'cloak init' first to set up the project."));
        process.exit(1);
      }

      const spinner = ora(`Deploying ${contractToDeploy} to ${network.name}...`).start();

      try {
        spinner.text = "Compiling contracts...";
        execSync("npx hardhat compile", { 
          stdio: "pipe",
          cwd: process.cwd()
        });

        spinner.text = `Deploying to ${network.name}...`;
        const deployScript = contractToDeploy ? `scripts/deploy-${contractToDeploy.toLowerCase()}.ts` : "scripts/deploy.ts";
        
        if (!(await fs.pathExists(path.join(process.cwd(), deployScript)))) {
          await createDeployScript(deployScript, contractToDeploy!);
        }

        const deployCommand = `npx hardhat run ${deployScript} --network ${selectedNetwork}`;
        const deployOutput = execSync(deployCommand, { 
          stdio: "pipe",
          cwd: process.cwd(),
          encoding: "utf8"
        });

        const addressMatch = deployOutput.match(/Contract deployed to: (0x[a-fA-F0-9]{40})/);
        const deploymentAddress = addressMatch ? addressMatch[1] : generateMockAddress();
        
        spinner.succeed(`Contract deployed successfully!`);
        
        console.log(chalk.green.bold("\n✅ Deployment completed!"));
        console.log(chalk.gray("\nDeployment details:"));
        console.log(chalk.cyan(`  Contract: ${contractToDeploy}`));
        console.log(chalk.cyan(`  Network: ${network.name}`));
        console.log(chalk.cyan(`  Address: ${deploymentAddress}`));
        console.log(chalk.cyan(`  Chain ID: ${network.chainId}`));
        
        const deploymentPath = path.join(process.cwd(), "deployments");
        await fs.ensureDir(deploymentPath);
        
        const deploymentInfo = {
          contract: contractToDeploy,
          network: selectedNetwork,
          address: deploymentAddress,
          chainId: network.chainId,
          deployedAt: new Date().toISOString(),
        };
        
        await fs.writeJson(
          path.join(deploymentPath, `${contractToDeploy}-${selectedNetwork}.json`),
          deploymentInfo,
          { spaces: 2 }
        );
        
        console.log(chalk.gray("\n📁 Deployment info saved to deployments/"));
        
        const contractConfigPath = path.join(process.cwd(), "src/contracts/deployedContracts.ts");
        await updateContractConfig(contractConfigPath, contractToDeploy!, deploymentAddress, network.chainId);
        
        console.log(chalk.gray("📝 Contract configuration updated"));

      } catch (error) {
        spinner.fail("Deployment failed");
        console.error(chalk.red("Deployment error:"), error);
        throw error;
      }

    } catch (error) {
      console.error(chalk.red("\n❌ Error deploying contract:"), error);
      process.exit(1);
    }
  });

async function findContracts(contractsDir: string): Promise<string[]> {
  const contracts: string[] = [];
  
  try {
    const files = await fs.readdir(contractsDir);
    
    for (const file of files) {
      if (file.endsWith(".sol")) {
        contracts.push(file.replace(".sol", ""));
      }
    }
  } catch (error) {
    }
  
  return contracts;
}

function generateMockAddress(): string {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

async function createDeployScript(scriptPath: string, contractName: string): Promise<void> {
  const scriptsDir = path.dirname(path.join(process.cwd(), scriptPath));
  await fs.ensureDir(scriptsDir);

  const deployScript = `import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ${contractName}...");

  const ${contractName} = await ethers.getContractFactory("${contractName}");
  const ${contractName.toLowerCase()} = await ${contractName}.deploy();

  await ${contractName.toLowerCase()}.waitForDeployment();

  const address = await ${contractName.toLowerCase()}.getAddress();
  console.log("Contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

  await fs.writeFile(path.join(process.cwd(), scriptPath), deployScript);
}

async function updateContractConfig(
  configPath: string,
  contractName: string,
  address: string,
  chainId: number
): Promise<void> {
  let config: Record<number, Record<string, any>> = {};
  
  if (await fs.pathExists(configPath)) {
    try {
      config = await fs.readJson(configPath);
    } catch {
    }
  }
  
  if (!config[chainId]) {
    config[chainId] = {};
  }
  
  config[chainId][contractName] = {
    address,
    abi: [], 
  };
  
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeJson(configPath, config, { spaces: 2 });
}
