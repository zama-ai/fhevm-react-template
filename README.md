# FHEVM React Template

A minimal React + Foundry template for building FHEVM-enabled dApps. Ships with `FHECounter.sol` (a trivial encrypted counter) and a Next.js frontend that reads, writes, and decrypts its value.

## What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) lets smart contracts compute on encrypted data. Inputs, storage, and ciphertext handles stay private; only authorized callers can decrypt.

## Stack

- **Contracts**: Foundry, Solidity 0.8.27, [forge-fhevm](https://github.com/zama-ai/forge-fhevm) for host contracts + testing helpers
- **Frontend**: Next.js 15 (App Router), React 19, wagmi, viem, RainbowKit, Tailwind + daisyUI
- **FHE SDK**: `@zama-fhe/sdk` + `@zama-fhe/react-sdk` v3
  - `RelayerCleartext` for local anvil (plaintext mirror executor — no KMS/gateway)
  - `RelayerWeb` for Sepolia (real relayer, WASM worker)
- **Tooling**: husky + lint-staged pre-commit (prettier + eslint + `forge fmt`), gitleaks scan in CI, GitHub Actions for forge test + frontend typecheck/lint/build

## Prerequisites

- Node.js ≥ 20, pnpm
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `anvil`, `cast`)
- `jq` (for the chain startup script)
- MetaMask

## Quick start

```bash
pnpm install
```

The `postinstall` hook regenerates `packages/nextjs/contracts/*.ts` from any existing broadcasts, and `prepare` installs husky hooks.

### Local (recommended for development)

Two terminals:

```bash
# 1. Start anvil + deploy the FHEVM cleartext host stack + FHECounter
pnpm chain

# 2. Start the frontend
pnpm start
```

Open http://localhost:3000 and add the local network to MetaMask:

- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- **Currency**: `ETH`

Import an anvil dev account (10,000 ETH each) — e.g. private key `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (address `0xf39F…2266`).

To redeploy `FHECounter` without restarting anvil, run `pnpm deploy:localhost` in a third terminal.

### Sepolia

Copy the example env file and fill it in:

```bash
cp .env.example .env.local
```

```bash
# .env.local
DEPLOYER_PRIVATE_KEY=0x...                          # deployer funded with Sepolia ETH
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=...                               # optional, enables --verify
```

Add to `packages/nextjs/.env.local`:

```bash
NEXT_PUBLIC_ALCHEMY_API_KEY=YOUR_KEY
```

Then:

```bash
pnpm deploy:sepolia    # forge script → writes deployment → regenerates ABIs
pnpm start             # same frontend picks up the 11155111 entry automatically
```

## Scripts

| Command                  | What it does                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `pnpm chain`             | Starts anvil on 8545 + deploys FHEVM cleartext host stack + `FHECounter`                     |
| `pnpm deploy:localhost`  | Deploys `FHECounter` to local anvil + regenerates frontend ABIs                              |
| `pnpm deploy:sepolia`    | Deploys to Sepolia (reads `.env.local`) + regenerates frontend ABIs                          |
| `pnpm contracts:install` | `forge soldeer install` in `packages/foundry`                                                |
| `pnpm contracts:build`   | `forge build` in `packages/foundry`                                                          |
| `pnpm contracts:test`    | `forge test -vv` in `packages/foundry`                                                       |
| `pnpm compile`           | Alias for `contracts:build`                                                                  |
| `pnpm test`              | Alias for `contracts:test` (forge only — no frontend tests)                                  |
| `pnpm generate`          | Emits `packages/nextjs/contracts/<Name>.ts` + `<Name>.local.ts` from forge broadcasts + out/ |
| `pnpm start`             | `next dev` (http://localhost:3000)                                                           |
| `pnpm next:build`        | Production build of the frontend                                                             |
| `pnpm next:check-types`  | TypeScript check on the frontend                                                             |
| `pnpm lint`              | Lint the frontend                                                                            |
| `pnpm format`            | Prettier write on the whole repo                                                             |
| `pnpm format:check`      | Prettier check (no write) — used by CI                                                       |

## Project structure

```
fhevm-react-template/
├── .github/workflows/ci.yml           # forge test + frontend typecheck/lint/build + gitleaks
├── .husky/pre-commit                  # runs lint-staged
├── .gitleaks.toml                     # gitleaks allowlist/stopwords
├── .prettierrc.json                   # root prettier config
├── .env.example                       # copy to .env.local for Sepolia deploys
├── scripts/
│   ├── chain.sh                       # anvil + FHEVM host + FHECounter
│   ├── deploy-localhost.sh
│   ├── deploy-sepolia.sh
│   └── generateTsAbis.ts              # emits per-contract .ts + .local.ts sidecars
└── packages/
    ├── foundry/                       # Solidity contracts + forge tests
    │   ├── src/FHECounter.sol
    │   ├── script/DeployFHECounter.s.sol
    │   ├── test/FHECounter.t.sol      # inherits forge-fhevm's FhevmTest
    │   ├── foundry.toml
    │   └── remappings.txt
    └── nextjs/                        # React frontend
        ├── app/
        ├── components/
        │   └── DappWrapperWithProviders.tsx  # wires ZamaProvider + relayer
        ├── hooks/
        │   └── fhecounter-example/useFHECounterWagmi.tsx
        ├── services/web3/
        │   └── wagmiSigner.ts         # local workaround for SDK 3.0.0's broken WagmiSigner
        ├── contracts/
        │   ├── FHECounter.ts          # autogenerated — non-local (Sepolia) deployments, tracked
        │   └── FHECounter.local.ts    # autogenerated — chainId 31337 overlay, gitignored
        ├── utils/contract.ts          # ContractDeployment type + deploymentFor() helper
        └── scaffold.config.ts
```

### ABI generation

`scripts/generateTsAbis.ts` walks `packages/foundry/broadcast/*/*/run-*.json` and `packages/foundry/out/` to produce **one pair of files per contract**:

- `packages/nextjs/contracts/<Name>.ts` — non-local chain entries (Sepolia, mainnet, etc.). Tracked in git.
- `packages/nextjs/contracts/<Name>.local.ts` — chainId 31337 overlay. Gitignored.

The main file imports its sidecar and merges at module load, so consumers stay agnostic to where a deployment lives. A `postinstall` hook runs the generator on every `pnpm install`, and a fresh clone with no broadcasts gets empty stub sidecars automatically so imports resolve.

## Troubleshooting

### MetaMask nonce mismatch after restarting anvil

MetaMask caches nonces; anvil resets them on restart. Fix:

1. MetaMask → Settings → Advanced → **Clear activity tab data**

### Stale view-function results

MetaMask also caches view-function results across reloads. After restarting anvil, **restart your browser** (not just the tab) to clear the cache.

### `Contract address is not a valid address`

The Zama relayer SDK requires EIP-55 checksummed addresses. `scripts/generateTsAbis.ts` already checksums via viem's `getAddress()` — if you see this error, rerun `pnpm generate` after a deploy.

### Sepolia entry disappeared from `FHECounter.ts`

Shouldn't happen on current `main` — the generator preserves the tracked REMOTE entries when a run only produces local broadcasts. If it does, rerun `pnpm deploy:sepolia` to repopulate.

### `pnpm install` asks for a package manager version

The root `package.json` pins `packageManager: "pnpm@10.18.3"`. Upgrade pnpm (`corepack prepare pnpm@10.18.3 --activate`) or match your local install.

### Sepolia deploy fails with weird path errors

Your `.env.local` likely has a typo (double `==`, spaces around `=`, quoted values with stray chars). Inspect and fix.

## FHEVM notes

- **ACL is mandatory.** Every encrypted value needs `FHE.allowThis(handle)` + `FHE.allow(handle, user)` — without it, reads silently fail. `FHECounter.sol` does this explicitly.
- **`euint32` vs `euint64`.** Types are baked into ciphertext handles. The frontend's `type: "euint32"` must match the contract's `externalEuint32` parameter — a mismatch reverts with `InvalidType()`.
- **Local uses cleartext mode.** Anvil runs a `CleartextFHEVMExecutor` from forge-fhevm that mirrors every FHE op into a `plaintexts(bytes32)` mapping. No KMS, no gateway, no WASM in the browser — `RelayerCleartext` reads plaintext directly. Good for dev, not for production.
- **Sepolia uses real relayer.** `RelayerWeb` spins up a Web Worker and fetches the FHE crypto from Zama's CDN. Requires `NEXT_PUBLIC_ALCHEMY_API_KEY` for the RPC transport.

## References

- [Zama Protocol docs](https://docs.zama.ai/protocol/)
- [`@zama-fhe/sdk`](https://github.com/zama-ai/sdk)
- [forge-fhevm](https://github.com/zama-ai/forge-fhevm)
- [OpenZeppelin Confidential Contracts](https://github.com/OpenZeppelin/openzeppelin-confidential-contracts)
- [FHEVM Discord](https://discord.com/invite/zama)

## License

BSD-3-Clause-Clear. See [LICENSE](LICENSE).
