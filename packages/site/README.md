# FHEVM React Template

The FHEVM React Template is an ultra-minimal React project for building and running an FHEVM-enabled dApp.
It works alongside the (fhevm-hardhat-template)[https://github.com/zama-ai/fhevm-hardhat-template]
and provides a simple development frontend for interacting with the `FHECounter.sol` contract.

This template also illustrates how to run your FHEVM-dApp on both Sepolia as well as a local Hardhat Node (much faster).

## Requirements

- You need to have Metamask browser extension installed on your browser.

## Local Hardhat Network (to add in MetaMask if needed)

- Name: Hardhat
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency symbol: ETH

## Setup

1. Clone this repository.

2. From the repo root, run:
```sh
# Clones fhevm-hardhat-template into packages/, removes its .git
node ./scripts/preinstall.mjs
```

3. From the root repo, run:
```sh
npm install
```

4. Setup your hardhat environment variables:

Follow the detailed instructions in the [FHEVM documentation](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) to setup `MNEMONIC` + `INFURA_API_KEY` Hardhat environment variables

5. Start a local Hardhat node (new terminal):

```sh
cd packages/fhevm-hardhat-template
npx hardhat node --verbose
# Default RPC: http://127.0.0.1:8545  | chainId: 31337
```

6. Deploy `FHECounter` to the local node:

```sh
# still in packages/fhevm-hardhat-template
npx hardhat deploy --network localhost
```

7. Deploy to Sepolia (required):

Follows instructions in the [FHEVM documentation to setup your Hardhat project for Sepolia](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional)

```sh
# still in packages/fhevm-hardhat-template
npx hardhat deploy --network sepolia
```

8. From the `<root>/packages/site` run
```sh
npm run dev
```

## How to fix Hardhat Node + Metamask Errors ?

In case you encouter errors running your react site on Hardhat Node make sure you have cleaned up the Metamask cache.
Metamask keeps track of the wallet nonces and consequently, on a local dev node these nonces are often invalid. 

To clean Metamask cache:
- open Metamask browser extension
- Select the Hardhat network
- Goto settings > advanced
- Click "Clear Activity Tab" red button.