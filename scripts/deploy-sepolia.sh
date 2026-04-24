#!/usr/bin/env bash
# Deploy FHECounter to Sepolia and regenerate the frontend's TS ABIs.
#
# Required env vars:
#   SEPOLIA_RPC_URL       - Sepolia JSON-RPC endpoint
#   DEPLOYER_PRIVATE_KEY  - private key of the deployer (0x-prefixed)
#
# Optional env vars:
#   ETHERSCAN_API_KEY     - if set, verifies the contract on Etherscan
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FOUNDRY_DIR="$REPO_ROOT/packages/foundry"

# Auto-load repo-root .env.local if present, so users don't have to source it.
if [[ -f "$REPO_ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env.local"
  set +a
fi

: "${SEPOLIA_RPC_URL:?SEPOLIA_RPC_URL is required (set in .env.local or shell)}"
: "${DEPLOYER_PRIVATE_KEY:?DEPLOYER_PRIVATE_KEY is required (set in .env.local or shell)}"

FORGE_ARGS=(
  script/DeployFHECounter.s.sol:DeployFHECounter
  --rpc-url "$SEPOLIA_RPC_URL"
  --private-key "$DEPLOYER_PRIVATE_KEY"
  --broadcast
)

if [[ -n "${ETHERSCAN_API_KEY:-}" ]]; then
  FORGE_ARGS+=(--verify --etherscan-api-key "$ETHERSCAN_API_KEY")
else
  echo "note: ETHERSCAN_API_KEY not set — skipping verification"
fi

cd "$FOUNDRY_DIR"
forge script "${FORGE_ARGS[@]}"

echo
echo "▸ Regenerating frontend ABIs + addresses"
cd "$REPO_ROOT"
pnpm generate

echo
echo "✅  Sepolia deploy complete. Frontend reads addresses from"
echo "    packages/nextjs/contracts/FHECounter.ts."
