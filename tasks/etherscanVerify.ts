import { task } from "hardhat/config";

task("verify-deployed", "Verifies an already deployed contract on Etherscan")
  .addParam("address", "The contract's address")
  .addParam("contract", "Full contract path (e.g., 'contracts/MyConfidentialERC20.sol:MyConfidentialERC20.sol')")
  .addParam("args", "Constructor arguments as comma-separated values", "")
  .setAction(async (taskArgs, hre) => {
    if (hre.network.name === "hardhat") {
      throw Error("Etherscan verification is not possilbe in mocked mode, choose another network");
    }
    const { address, contract, args } = taskArgs;

    console.info("\nStarting verification for deployed contract...");
    console.info("Contract:", contract);
    console.info("Address:", address);

    try {
      // Parse constructor arguments
      const constructorArgs = args
        ? args.split(",").map((arg) => {
            const trimmed = arg.trim();
            // Try to parse as JSON
            try {
              return JSON.parse(trimmed);
            } catch {
              // If it's a number
              if (!isNaN(trimmed)) {
                return Number(trimmed);
              }
              // If it's a boolean
              if (trimmed.toLowerCase() === "true") return true;
              if (trimmed.toLowerCase() === "false") return false;
              // Otherwise return as string
              return trimmed;
            }
          })
        : [];

      console.info("Constructor Arguments:", constructorArgs);

      // Prepare verification arguments
      const verificationArgs = {
        address: address,
        contract: contract,
        constructorArguments: constructorArgs,
      };

      console.info("\nSubmitting verification request...");
      await hre.run("verify:verify", verificationArgs);

      console.info("\n✅ Contract verification completed successfully!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.info("\n✓ Contract is already verified!");
      } else {
        console.error("\n❌ Verification failed:", error.message);
        console.info("\nTo verify your contract, use the following format:");
        console.info("\nnpx hardhat verify-deployed \\");
        console.info("  --address", address, "\\");
        console.info("  --contract", contract, "\\");
        console.info('  --args "arg1,arg2,arg3" \\');
        console.info("  --network <network>");
      }
    }
  });
