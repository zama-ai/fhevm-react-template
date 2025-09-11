// Cross-platform script so it works on Windows as well
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get the absolute path to the script directory
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

// Path to the packages directory
const packagesDir = path.join(SCRIPT_DIR, "../packages");
// <root>/packages/fhevm-hardhat-template
const TARGET_DIR = path.join(packagesDir, "fhevm-hardhat-template");
// <root>/packages/site
const SITE_DIR = path.join(packagesDir, "site");

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

function checkDir(d) {
  if (!fs.existsSync(d)) {
    printError(d);
    process.exit(1);
  }
}

export async function preinstall() {
  checkDir(SITE_DIR);
  checkDir(TARGET_DIR);
}

preinstall();
