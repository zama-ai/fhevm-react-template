#!/bin/sh
# Patch node-tkms to use browser globals instead of require('util')
# for TextEncoder/TextDecoder. This is needed because node-tkms is a
# Node.js-only package that gets bundled into the browser via @fhevm/mock-utils.
# Uses a glob to match any node-tkms version.
TKMS_FILE=$(find node_modules/.pnpm -path "*/node-tkms/kms_lib.js" 2>/dev/null | head -1)
if [ -n "$TKMS_FILE" ] && [ -f "$TKMS_FILE" ]; then
  if grep -q "require(\`util\`)" "$TKMS_FILE"; then
    sed -i.bak "s/const { TextEncoder, TextDecoder } = require(\`util\`);/const TextEncoder = globalThis.TextEncoder; const TextDecoder = globalThis.TextDecoder;/" "$TKMS_FILE"
    rm -f "${TKMS_FILE}.bak"
    echo "Patched node-tkms ($TKMS_FILE) for browser compatibility"
  else
    echo "node-tkms already patched"
  fi
else
  echo "node-tkms not found, skipping patch"
fi
