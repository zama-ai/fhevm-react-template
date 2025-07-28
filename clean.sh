#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd ${SCRIPT_DIR}

rm -rf ./package-lock.json
rm -rf ./packages/fhevm-hardhat-template/package-lock.json
rm -rf ./packages/site/package-lock.json
rm -rf ./node_modules
rm -rf ./packages/site/node_modules
rm -rf ./packages/fhevm-hardhat-template/node_modules
