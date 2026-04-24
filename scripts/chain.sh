#!/usr/bin/env bash
# Start anvil + FHEVM cleartext host stack + FHECounter in one command.
#
# Flow (2 terminals):
#   pnpm chain   # this script — anvil + FHEVM host + FHECounter
#   pnpm start   # frontend
#
# To redeploy FHECounter without restarting anvil, run
# `pnpm deploy:localhost` in another terminal.
set -euo pipefail

PORT="${ANVIL_PORT:-8545}"
RPC_URL="http://127.0.0.1:$PORT"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# forge-fhevm is installed as a soldeer dependency of packages/foundry. The
# installed source tree includes deploy-local.sh (the canonical FHEVM host
# deploy script) and the full script/ directory it needs.
FORGE_FHEVM_DIR="$(find "$REPO_ROOT/packages/foundry/dependencies" -maxdepth 1 -type d -name 'forge-fhevm-*' | head -1)"

if [[ -z "$FORGE_FHEVM_DIR" || ! -d "$FORGE_FHEVM_DIR" ]]; then
  echo "error: forge-fhevm not found under packages/foundry/dependencies/" >&2
  echo "run: (cd packages/foundry && forge soldeer install)" >&2
  exit 1
fi

for bin in anvil forge cast jq pnpm; do
  command -v "$bin" >/dev/null || { echo "error: missing '$bin' on PATH" >&2; exit 1; }
done

if lsof -ti :"$PORT" >/dev/null 2>&1; then
  echo "port $PORT in use, killing stale process..."
  lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Build forge-fhevm artifacts once. deploy-local.sh reads from out/.
if [[ ! -d "$FORGE_FHEVM_DIR/out" ]]; then
  echo "building forge-fhevm (first run)..."
  (cd "$FORGE_FHEVM_DIR" && forge soldeer install && forge build)
fi

ANVIL_PID=
cleanup() { [[ -n "$ANVIL_PID" ]] && kill "$ANVIL_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo "starting anvil on port $PORT..."
ANVIL_STATE="${ANVIL_STATE:-$REPO_ROOT/.anvil-state.json}"
ANVIL_ARGS="--host 127.0.0.1 --port $PORT --chain-id 31337 --auto-impersonate --silent"
if [[ -f "$ANVIL_STATE" ]]; then
  echo "  restoring anvil state from $ANVIL_STATE"
  anvil $ANVIL_ARGS --load-state "$ANVIL_STATE" --dump-state "$ANVIL_STATE" &
else
  anvil $ANVIL_ARGS --dump-state "$ANVIL_STATE" &
fi
ANVIL_PID=$!

# Wait for RPC
for _ in $(seq 1 150); do
  cast chain-id --rpc-url "$RPC_URL" >/dev/null 2>&1 && break
  sleep 0.2
done
kill -0 "$ANVIL_PID" 2>/dev/null \
  || { echo "anvil failed to start on port $PORT (already in use?)" >&2; exit 1; }

echo "deploying FHEVM cleartext host stack..."
# Unset any chain override inherited from the calling shell — cast reads
# CHAIN (and legacy FOUNDRY_CHAIN / DAPP_CHAIN) and would fail if set to an
# invalid value such as "testnet".
(unset CHAIN FOUNDRY_CHAIN DAPP_CHAIN; cd "$FORGE_FHEVM_DIR" && ./deploy-local.sh --rpc-url "$RPC_URL")

echo "deploying FHECounter..."
RPC_URL="$RPC_URL" "$SCRIPT_DIR/deploy-localhost.sh"

echo
echo "✓ anvil + FHEVM host + FHECounter ready on $RPC_URL (chain id 31337)"
echo "  next: pnpm start (in another terminal)"
echo

wait "$ANVIL_PID"
