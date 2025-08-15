# FHEVM React Template

The FHEVM React Template is an ultra-minimal React project for building and running an FHEVM-enabled dApp.
It works alongside the [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template)
and provides a simple development frontend for interacting with the `FHECounter.sol` contract.

This template also illustrates how to run your FHEVM-dApp on both Sepolia as well as a local Hardhat Node (much faster).

## Features

- **@zama-fhe/relayer-sdk**: Fully Homomorphic Encryption for Ethereum Virtual Machine
- **React**: Modern UI framework for building interactive interfaces
- **Next.js**: Next-generation frontend build tool
- **Tailwind**: Utility-first CSS framework for rapid UI development

## Requirements

- You need to have Metamask browser extension installed on your browser.

## Local Hardhat Network (to add in MetaMask)

- Name: Hardhat
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency symbol: ETH

## Install

### Automatic install

1. Clone this repository.
2. From the repo root, run:
```sh
# - git clone "https://github.com/zama-ai/fhevm-hardhat-template.git" into <root>/packages
# - npm install
# - auto-depoy on hardhat node
node ./scripts/install.mjs
```

### Manual install

1. Clone this repository.
2. From the repo root, execute the following:
```sh
cd ./packages
git clone "https://github.com/zama-ai/fhevm-hardhat-template.git"
cd ..
npm install
```

## Setup

1. Setup your hardhat environment variables:

Follow the detailed instructions in the [FHEVM documentation](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) to setup `MNEMONIC` + `INFURA_API_KEY` Hardhat environment variables

2. Start a local Hardhat node (new terminal):

```sh
cd packages/fhevm-hardhat-template
npx hardhat node --verbose
# Default RPC: http://127.0.0.1:8545  | chainId: 31337
```

3. Deploy `FHECounter` to the local node:

```sh
# still in packages/fhevm-hardhat-template
npx hardhat deploy --network localhost
```

4. Deploy to Sepolia:

Follows instructions in the [FHEVM documentation to setup your Hardhat project for Sepolia](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional)

```sh
# still in packages/fhevm-hardhat-template
npx hardhat deploy --network sepolia
```

## Run

1. Start a local Hardhat node (new terminal):

```sh
npx hardhat node --verbose
```

2. Open your Browser

3. From your browser, open the MetaMask extension and select the Hardhat network

4. From the `<root>/packages/site` run

```sh
npm run dev:mock
```
4. In your browser open `http://localhost:3000`


## How to fix Hardhat Node + Metamask Errors ?

When using MetaMask as a wallet provider with a development node like Hardhat, you may encounter two common types of errors:

### 1. ⚠️ Nonce Mismatch ❌💥
MetaMask tracks wallet nonces (the number of transactions sent from a wallet). However, if you restart your Hardhat node, the nonce is reset on the dev node, but MetaMask does not update its internal nonce tracking. This discrepancy causes a nonce mismatch error.

### 2. ⚠️ View Function Call Result Mismatch ❌💥

MetaMask caches the results of view function calls. If you restart your Hardhat node, MetaMask may return outdated cached data corresponding to a previous instance of the node, leading to incorrect results.

### ✅ How to Fix Nonce Mismatch:

To fix the nonce mismatch error, simply clear the MetaMask cache:

1. Open the MetaMask browser extension.
2. Select the Hardhat network.
3. Go to Settings > Advanced.
4. Click the "Clear Activity Tab" red button to reset the nonce tracking.

The correct way to do this is also explained [here](https://docs.metamask.io/wallet/how-to/run-devnet/).

### ✅ How to Fix View Function Return Value Mismatch:

To fix the view function result mismatch:

1. Restart the entire browser. MetaMask stores its cache in the extension's memory, which cannot be cleared by simply clearing the browser cache or using MetaMask's built-in cache cleaning options.

By following these steps, you can ensure that MetaMask syncs correctly with your Hardhat node and avoid potential issues related to nonces and cached view function results.

## Documentation

- [Hardhat + MetaMask](https://docs.metamask.io/wallet/how-to/run-devnet/): Set up your local devnet step by step using Hardhat and MetaMask.
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [FHEVM Hardhat](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [@zama-fhe/relayer-sdk Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/)
- [Setting up MNEMONIC and INFURA_API_KEY](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional)
- [React Documentation](https://reactjs.org/)

## License

This project is licensed under the BSD-3-Clause-Clear License - see the LICENSE file for details.