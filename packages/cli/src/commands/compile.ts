import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

interface CompileOptions {
  clean?: boolean;
  force?: boolean;
}

export const compileCommand = new Command("compile")
  .description("Compile FHEVM contracts using Hardhat")
  .option("-c, --clean", "Clean artifacts before compilation")
  .option("-f, --force", "Force compilation even if contracts haven't changed")
  .action(async (options: CompileOptions) => {
    try {
      console.log(chalk.blue.bold("🔨 Cloak SDK Contract Compiler"));
      console.log(chalk.gray("Compiling your confidential contracts...\n"));

      // Check if we're in a project directory
      const hardhatConfigPath = path.join(process.cwd(), "hardhat.config.ts");
      if (!(await fs.pathExists(hardhatConfigPath))) {
        console.error(chalk.red("❌ No Hardhat configuration found. Please run 'cloak init' first to set up the project."));
        process.exit(1);
      }

      // Check if contracts directory exists
      const contractsDir = path.join(process.cwd(), "contracts");
      if (!(await fs.pathExists(contractsDir))) {
        console.error(chalk.red("❌ No contracts directory found. Please run 'cloak init' first to set up the project."));
        process.exit(1);
      }

      const spinner = ora("Compiling contracts...").start();

      try {
        // Clean artifacts if requested
        if (options.clean) {
          spinner.text = "Cleaning artifacts...";
          const artifactsDir = path.join(process.cwd(), "artifacts");
          const cacheDir = path.join(process.cwd(), "cache");
          
          if (await fs.pathExists(artifactsDir)) {
            await fs.remove(artifactsDir);
          }
          if (await fs.pathExists(cacheDir)) {
            await fs.remove(cacheDir);
          }
        }

        // Compile contracts
        spinner.text = "Compiling FHEVM contracts...";
        const compileCommand = options.force ? "npx hardhat compile --force" : "npx hardhat compile";
        
        execSync(compileCommand, { 
          stdio: "pipe",
          cwd: process.cwd()
        });

        spinner.succeed("Contracts compiled successfully!");

        // Show compilation results
        const artifactsDir = path.join(process.cwd(), "artifacts");
        if (await fs.pathExists(artifactsDir)) {
          const contractFiles = await findContractArtifacts(artifactsDir);
          
          console.log(chalk.green.bold("\n✅ Compilation completed!"));
          console.log(chalk.gray("\nCompiled contracts:"));
          
          for (const contract of contractFiles) {
            console.log(chalk.cyan(`  📄 ${contract.name}`));
            console.log(chalk.gray(`     ABI: ${contract.abiPath}`));
            console.log(chalk.gray(`     Bytecode: ${contract.bytecodePath}`));
          }

          // Generate TypeScript types if requested
          console.log(chalk.gray("\n💡 Tip: Run 'cloak generate-types' to generate TypeScript types from your contracts"));
        }

      } catch (error) {
        spinner.fail("Compilation failed");
        console.error(chalk.red("Compilation error:"), error);
        throw error;
      }

    } catch (error) {
      console.error(chalk.red("\n❌ Error compiling contracts:"), error);
      process.exit(1);
    }
  });

async function findContractArtifacts(artifactsDir: string): Promise<Array<{name: string, abiPath: string, bytecodePath: string}>> {
  const contracts: Array<{name: string, abiPath: string, bytecodePath: string}> = [];
  
  try {
    const files = await fs.readdir(artifactsDir, { recursive: true });
    
    for (const file of files) {
      if (typeof file === 'string' && file.endsWith('.json')) {
        const filePath = path.join(artifactsDir, file);
        const relativePath = path.relative(artifactsDir, filePath);
        
        // Skip if it's not a contract artifact
        if (!relativePath.includes('/') || relativePath.includes('dbg.json')) {
          continue;
        }
        
        try {
          const artifact = await fs.readJson(filePath);
          if (artifact.abi && artifact.bytecode) {
            const contractName = path.basename(file, '.json');
            contracts.push({
              name: contractName,
              abiPath: relativePath,
              bytecodePath: relativePath
            });
          }
        } catch {
          // Skip invalid JSON files
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return contracts;
}
