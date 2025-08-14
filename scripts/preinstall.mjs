// Cross-platform script so it works on Windows as well
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

// Get the absolute path to the script directory
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const GITHUB_REPO = "https://github.com/zama-ai/fhevm-hardhat-template.git";

// Path to the packages directory
const packagesDir = path.join(SCRIPT_DIR, '../packages');
const targetDir = path.join(packagesDir, 'fhevm-hardhat-template');

// Function to execute a shell command
const execPromise = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      reject(new Error(`Error: ${stderr || err.message}`));
    } else {
      resolve(stdout);
    }
  });
});

(async () => {
  // Exit if ./packages does not exist
  if (!fs.existsSync(packagesDir)) {
    console.error(`Directory ${packagesDir} does not exist.`);
    process.exit(1);
  }

  // Check if the target directory already exists
  if (fs.existsSync(targetDir)) {
    console.log(`Directory ${targetDir} already exists. Skipping git clone.`);
  } else {
    // Clone the repository if the directory doesn't exist
    console.log(`Cloning the repository ${GITHUB_REPO}`);

    try {
      // Run git clone using exec
      await execPromise(`git clone ${GITHUB_REPO} ${targetDir}`);
      console.log("Repository cloned successfully.");

      // Remove the .git directory to detach the repository
      const gitDir = path.join(targetDir, '.git');
      if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
        console.log("Detached .git from the cloned repository.");
      }
    } catch (err) {
      console.error("Failed to clone the repository. Exiting.");
      process.exit(1);
    }
  }
})();
