// Cross-platform script so it works on Windows as well
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get the absolute path to the script directory
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const GITHUB_REPO = "https://github.com/zama-ai/fhevm-hardhat-template.git";

// Path to the packages directory
const packagesDir = path.join(SCRIPT_DIR, "../packages");
// <root>/packages/fhevm-hardhat-template
const TARGET_DIR = path.join(packagesDir, "fhevm-hardhat-template");
// <root>/packages/site
const SITE_DIR = path.join(packagesDir, "site");

const execPromise = (cmd) =>
  new Promise((resolve, reject) => {
    const childProcess = exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`Error: ${stderr || err.message}`));
      } else {
        resolve(stdout);
      }
    });

    childProcess.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    childProcess.stderr.on("data", (data) => {
      process.stderr.write(data);
    });
  });

function checkDir(d) {
  if (!fs.existsSync(d)) {
    console.error(`Directory ${d} does not exist.`);
    process.exit(1);
  }
}

export async function npmInstall() {
  console.log(`cwd:${process.cwd()}`);
  console.log(`npm install`);
  console.log("Running npm install, please wait...");

  checkDir(TARGET_DIR);
  checkDir(SITE_DIR);

  try {
    // Run npm install using exec
    await execPromise(`npm install`);
  } catch (err) {
    process.exit(1);
  }
}

export async function installFhevmHardhatTemplate() {
  // Exit if ./packages does not exist
  checkDir(packagesDir);

  // Check if the target directory already exists
  if (fs.existsSync(TARGET_DIR)) {
    console.log(`Directory ${TARGET_DIR} already exists. Skipping git clone.`);
  } else {
    // Clone the repository if the directory doesn't exist
    console.log(`Cloning the repository ${GITHUB_REPO}`);

    try {
      // Run git clone using exec
      await execPromise(`git clone ${GITHUB_REPO} ${TARGET_DIR}`);
      console.log("Repository cloned successfully.");

      // Remove the .git directory to detach the repository
      const gitDir = path.join(TARGET_DIR, ".git");
      if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
        console.log("Detached .git from the cloned repository.");
      }
    } catch (err) {
      console.error("Failed to clone the repository. Exiting.");
      process.exit(1);
    }
  }
}

export async function install() {
  // git clone "https://github.com/zama-ai/fhevm-hardhat-template.git" into <root>/packages
  await installFhevmHardhatTemplate();
  // npm install
  await npmInstall();
}

install();
