import { ethers } from "ethers";

async function checkIfHardhatNodeIsRunning() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`Ethereum node is running. Current block number: ${blockNumber}`);
  } catch {
    console.error("\n");
    console.error("===============================================================================\n");
    console.error(" 💥❌ Local Hardhat Node is not running!\n");
    console.error("   To start Hardhat Node:");
    console.error("   ----------------------");
    console.error("   ✅ 1. Open a new terminal window");
    console.error("   ✅ 2. Goto ./packages/fhevm-hardhat-template");
    console.error("   ✅ 3. Run: npx hardhat node --verbose");
    console.error("\n===============================================================================\n");
    console.error("\n");
    process.exit(1);
  }
}

checkIfHardhatNodeIsRunning();
