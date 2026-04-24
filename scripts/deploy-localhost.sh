#!/usr/bin/env bash
# Deploy FHECounter to a running anvil node at 127.0.0.1:8545 and regenerate
# the frontend's per-contract ABI/address files.
#
# Prereq: `pnpm chain` is running in another terminal. That script starts
# anvil AND materializes the FHEVM cleartext host stack at the canonical
# addresses RelayerCleartext expects.
set -euo pipefail

RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"
# Anvil's first default account — deterministic, same on every run.
ANVIL_PK="${PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FOUNDRY_DIR="$REPO_ROOT/packages/foundry"

if ! cast chain-id --rpc-url "$RPC_URL" >/dev/null 2>&1; then
    echo "❌  No RPC at $RPC_URL. Run 'pnpm chain' in another terminal first." >&2
    exit 1
fi

echo "▸ Deploying FHECounter"
cd "$FOUNDRY_DIR"
# foundry.toml references SEPOLIA_RPC_URL / ETHERSCAN_API_KEY under
# [rpc_endpoints] / [etherscan]. forge 1.x refuses to load the config if
# those vars are unset, even on a localhost deploy that never touches them —
# so stub them here so a fresh checkout doesn't silently fail.
: "${SEPOLIA_RPC_URL:=unset}"
: "${ETHERSCAN_API_KEY:=unset}"
export SEPOLIA_RPC_URL ETHERSCAN_API_KEY

deploy_log="$(mktemp)"
trap 'rm -f "$deploy_log"' EXIT
if ! PRIVATE_KEY="$ANVIL_PK" forge script script/DeployFHECounter.s.sol:DeployFHECounter \
    --rpc-url "$RPC_URL" \
    --private-key "$ANVIL_PK" \
    --broadcast \
    >"$deploy_log" 2>&1; then
    echo "❌  forge script failed:" >&2
    cat "$deploy_log" >&2
    exit 1
fi
grep -E "FHECounter|Owner|===" "$deploy_log" || true

echo
echo "▸ Regenerating frontend ABIs + addresses"
cd "$REPO_ROOT"
pnpm generate

echo
echo "✅  Local dev stack ready. Frontend reads addresses from"
echo "    packages/nextjs/contracts/FHECounter.ts (+ FHECounter.local.ts)."
