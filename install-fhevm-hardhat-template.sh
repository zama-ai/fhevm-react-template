#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd ${SCRIPT_DIR}

rm -rf ./package-lock.json
rm -rf ./packages/site/package-lock.json
rm -rf ./node_modules
rm -rf ./packages/site/node_modules

rm -rf ./packages/fhevm-hardhat-template

cd ./packages
git clone https://github.com/zama-ai/fhevm-hardhat-template.git
cd ./fhevm-hardhat-template
rm -rf .git
rm -rf .vscode
