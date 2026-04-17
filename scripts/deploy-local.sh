#!/usr/bin/env bash
# Deploy FHECounter to local anvil and regenerate the frontend's TS ABIs.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FOUNDRY_DIR="$REPO_ROOT/packages/foundry"
RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"
# Anvil default account #0
PRIVATE_KEY="${DEPLOYER_PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"

if ! nc -z 127.0.0.1 "${RPC_URL##*:}" 2>/dev/null; then
  echo "error: no RPC at $RPC_URL — run 'pnpm chain' first" >&2
  exit 1
fi

cd "$FOUNDRY_DIR"
forge script script/DeployFHECounter.s.sol:DeployFHECounter \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --silent

cd "$REPO_ROOT"
pnpm generate
