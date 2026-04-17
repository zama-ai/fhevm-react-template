#!/usr/bin/env bash
# Start a local anvil node with the FHEVM cleartext host stack deployed.
#
# This deploys CleartextFHEVMExecutor (and the full host stack) at the same
# fixed addresses that @zama-fhe/sdk/cleartext's hardhatCleartextConfig
# expects, so RelayerCleartext in the frontend works out of the box.
set -euo pipefail

PORT="${ANVIL_PORT:-8545}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# forge-fhevm is installed as a soldeer dependency of packages/foundry. The
# installed source tree includes deploy-local.sh (the canonical FHEVM host
# deploy script) and the full script/ directory it needs.
FORGE_FHEVM_DIR="$(find "$REPO_ROOT/packages/foundry/dependencies" -maxdepth 1 -type d -name 'forge-fhevm-*' | head -1)"

if [[ -z "$FORGE_FHEVM_DIR" || ! -d "$FORGE_FHEVM_DIR" ]]; then
  echo "error: forge-fhevm not found under packages/foundry/dependencies/" >&2
  echo "run: (cd packages/foundry && forge soldeer install)" >&2
  exit 1
fi

for bin in anvil forge cast jq; do
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
anvil --port "$PORT" --chain-id 31337 --silent &
ANVIL_PID=$!

# Wait for RPC
for _ in $(seq 1 150); do
  nc -z 127.0.0.1 "$PORT" 2>/dev/null && break
  sleep 0.2
done
nc -z 127.0.0.1 "$PORT" 2>/dev/null || { echo "anvil failed to start on port $PORT" >&2; exit 1; }

echo "deploying FHEVM cleartext host stack..."
(cd "$FORGE_FHEVM_DIR" && ./deploy-local.sh --anvil-port "$PORT")

echo ""
echo "✓ anvil + FHEVM cleartext host ready on http://127.0.0.1:$PORT"
echo "  chain id: 31337"
echo "  press Ctrl+C to stop"
echo ""

wait "$ANVIL_PID"
