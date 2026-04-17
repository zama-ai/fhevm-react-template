# FHEVM Foundry Template

A Foundry-based template for developing Fully Homomorphic Encryption (FHE) enabled Solidity smart contracts using the
FHEVM protocol by Zama.

## Quick Start

For detailed instructions see:
[FHEVM Quick Start Tutorial](https://docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Foundry**: [Installation guide](https://book.getfoundry.sh/getting-started/installation)

### Installation

1. **Install dependencies**

   ```bash
   forge soldeer install
   ```

2. **Compile and test**

   ```bash
   forge build
   forge test -vvv
   ```

3. **Deploy to local network**

   Start an Anvil node with the FHEVM host contracts deployed (requires [forge-fhevm](../forge-fhevm)):

   ```bash
   # From the forge-fhevm directory
   ./deploy-local.sh
   ```

   Then deploy to the local network:

   ```bash
   forge script script/DeployFHECounter.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

4. **Deploy to Sepolia Testnet**

   ```bash
   cp .env.example .env
   # Edit .env with your deployer key and RPC URL

   source .env
   forge script script/DeployFHECounter.s.sol \
       --rpc-url $RPC_URL \
       --private-key $DEPLOYER_PRIVATE_KEY \
       --broadcast --verify
   ```

## Project Structure

```
fhevm-foundry-template/
├── src/                 # Smart contract source files
│   └── FHECounter.sol   # Example FHE counter contract
├── test/                # Test files
│   └── FHECounter.t.sol # Tests using forge-fhevm
├── script/              # Deployment scripts
│   └── DeployFHECounter.s.sol
├── foundry.toml         # Foundry configuration
└── remappings.txt       # Dependency remappings
```

## Available Scripts

| Script                                     | Description              |
| ------------------------------------------ | ------------------------ |
| `forge build`                              | Compile all contracts    |
| `forge test -vvv`                          | Run all tests            |
| `forge test --match-test test_name -vvv`   | Run a single test        |
| `forge fmt`                                | Format code              |
| `forge fmt --check`                        | Check formatting         |

## Documentation

- [FHEVM Documentation](https://docs.zama.org/fhevm)
- [FHEVM Quick Start Tutorial](https://docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial)
- [forge-fhevm Documentation](../forge-fhevm/docs/)

## License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.org)
- **Community**: [Zama Discord](https://discord.gg/zama)
