export function errorNotDeployed(chainId: number | undefined) {
  return (
    <div className="grid w-full gap-4 mx-auto font-semibold bg-none">
      <div className="col-span-full mx-20">
        <p className="text-4xl leading-relaxed">
          {" "}
          <span className="font-mono bg-red-500">Error</span>:{" "}
          <span className="font-mono bg-white">FHECounter.sol</span> Contract
          Not Deployed on{" "}
          <span className="font-mono bg-white">chainId={chainId}</span>{" "}
          {chainId === 11155111 ? "(Sepolia)" : ""} or Deployment Address
          Missing.
        </p>
        <p className="text-xl leading-relaxed mt-8">
          It appears that the{" "}
          <span className="font-mono bg-white">FHECounter.sol</span> contract
          has either not been deployed yet, or the deployment address is missing
          from the ABI directory{" "}
          <span className="font-mono bg-white">root/packages/site/abi</span>. To
          deploy <span className="font-mono bg-white">FHECounter.sol</span> on
          Sepolia, run the following command:
        </p>
        <p className="font-mono text-2xl leading-relaxed bg-black text-white p-4 mt-12">
          <span className="opacity-50 italic text-red-500">
            #from &lt;root&gt;/packages/fhevm-hardhat-template
          </span>
          <br />
          npx hardhat deploy --network{" "}
          {chainId === 11155111 ? "sepolia" : "your-network-name"}
        </p>
        <p className="text-xl leading-relaxed mt-12">
          Alternatively, switch to the local{" "}
          <span className="font-mono bg-white">Hardhat Node</span> using the
          MetaMask browser extension.
        </p>
      </div>
    </div>
  );
}
