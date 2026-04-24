/**
 * Generates per-contract files in packages/nextjs/contracts/ from foundry
 * build output + broadcast receipts.
 *
 * Inputs:
 *   packages/foundry/out/<Name>.sol/<Name>.json              — compiled ABI
 *   packages/foundry/broadcast/.../<chainId>/run-latest.json — deployed addr+block
 *
 * Outputs (one pair per contract; bundlers tree-shake unused ones):
 *   packages/nextjs/contracts/<Name>.ts        — non-local chains (tracked)
 *   packages/nextjs/contracts/<Name>.local.ts  — local 31337 overlay (gitignored)
 *
 * The main file imports the sidecar and merges at module load, so consumers
 * stay agnostic to which chain a deployment lives on.
 *
 * Invoked by:
 *   pnpm generate
 *   (also appended to deploy:localhost and deploy:sepolia)
 */
import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";
import { getAddress } from "viem";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOUNDRY_DIR = path.join(REPO_ROOT, "packages/foundry");
const OUT_DIR = path.join(FOUNDRY_DIR, "out");
const BROADCAST_DIR = path.join(FOUNDRY_DIR, "broadcast");
const TARGET_DIR = path.join(REPO_ROOT, "packages/nextjs/contracts");

const LOCAL_CHAIN_ID = 31337;

type Deployment = {
  address: `0x${string}`;
  deployedOnBlock: number;
};

type ContractEntry = Deployment & { abi: unknown[] };

/** Walk broadcast/ for `CREATE` txs, grouped by contract name → chainId.
 *  When multiple scripts deploy the same contract to the same chain, the
 *  most-recently-modified broadcast wins.
 *
 *  Reads every historical `run-NNN.json` (not just `run-latest.json`) so that
 *  incremental deploy scripts — where a partial run replaces run-latest with
 *  only the freshly-deployed CREATEs — don't drop the addresses of reused
 *  contracts that were CREATE'd in earlier runs of the same script. */
function collectDeployments(): Record<string, Record<number, Deployment & { mtime: number }>> {
  const out: Record<string, Record<number, Deployment & { mtime: number }>> = {};
  if (!fs.existsSync(BROADCAST_DIR)) return out;

  for (const scriptDir of fs.readdirSync(BROADCAST_DIR)) {
    const scriptPath = path.join(BROADCAST_DIR, scriptDir);
    if (!fs.statSync(scriptPath).isDirectory()) continue;

    for (const chainIdStr of fs.readdirSync(scriptPath)) {
      const chainPath = path.join(scriptPath, chainIdStr);
      if (!fs.statSync(chainPath).isDirectory()) continue;

      const chainId = Number(chainIdStr);

      // run-latest.json is a copy of the most recent run-<timestamp>.json,
      // so iterating just the timestamped files covers it without double work.
      const runFiles = fs
        .readdirSync(chainPath)
        .filter((f) => /^run-\d+\.json$/.test(f))
        .map((f) => path.join(chainPath, f));

      // Fresh-clone fallback: if the only file present is run-latest.json
      // (no timestamped runs yet), still process it so the first deploy works.
      if (runFiles.length === 0) {
        const runLatest = path.join(chainPath, "run-latest.json");
        if (fs.existsSync(runLatest)) runFiles.push(runLatest);
      }

      for (const runPath of runFiles) {
        const mtime = fs.statSync(runPath).mtimeMs;
        const run = JSON.parse(fs.readFileSync(runPath, "utf8"));
        const receipts: Array<{ blockNumber: string; transactionHash: string }> =
          run.receipts ?? [];
        const receiptByHash = new Map(receipts.map((r) => [r.transactionHash, r]));

        for (const tx of run.transactions ?? []) {
          if (tx.transactionType !== "CREATE" || !tx.contractName || !tx.contractAddress) continue;
          const receipt = receiptByHash.get(tx.hash);
          const deployedOnBlock = receipt ? parseInt(receipt.blockNumber, 16) : 0;
          out[tx.contractName] ??= {};
          const existing = out[tx.contractName][chainId];
          // Newest CREATE per (contract, chain) wins — reflects current on-chain state.
          if (existing && existing.mtime >= mtime) continue;
          // Foundry writes lowercase addresses; Zama's relayer SDK requires EIP-55
          // checksummed addresses (isChecksummedAddress() check in createRelayerEncryptedInput).
          out[tx.contractName][chainId] = {
            address: getAddress(tx.contractAddress),
            deployedOnBlock,
            mtime,
          };
        }
      }
    }
  }
  return out;
}

/** Read the compiled ABI for a contract from out/. Returns null if missing
 *  (e.g. a contract deployed in an older broadcast but since removed). */
function readAbi(contractName: string): unknown[] | null {
  const artifactPath = path.join(OUT_DIR, `${contractName}.sol`, `${contractName}.json`);
  if (!fs.existsSync(artifactPath)) return null;
  const { abi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return abi;
}

// Chain IDs must be numeric keys in the generated TS (consumer types narrow on `number`).
const serializeChains = (obj: Record<number, ContractEntry>) =>
  JSON.stringify(obj, null, 2).replace(/^(\s*)"(\d+)":/gm, "$1$2:");

async function renderMainFile(name: string, remote: Record<number, ContractEntry>) {
  // `as const` preserves the literal ABI tuple type so viem/wagmi can narrow
  // function names, args, and return types at consumer call sites.
  // `Partial<Record<...>>` lets the merge typecheck even when one side is empty.
  const body = `/**
 * This file is autogenerated. Do not edit by hand — run \`pnpm generate\`.
 *
 * Non-local chain deployments live here; local (chainId ${LOCAL_CHAIN_ID})
 * deployments live in \`./${name}.local.ts\` (gitignored) and are merged in
 * at module load. Import by name: \`import { ${name} } from "~~/contracts/${name}";\`
 */
import type { ContractDeployment } from "~~/utils/contract";
import { ${name} as ${name}_LOCAL } from "./${name}.local";

const REMOTE = ${serializeChains(remote)} as const;

export const ${name} = {
  ...REMOTE,
  ...${name}_LOCAL,
} as const satisfies Partial<Record<number, ContractDeployment>>;
`;

  const formatted = await prettier.format(body, { parser: "typescript" });
  const target = path.join(TARGET_DIR, `${name}.ts`);
  fs.writeFileSync(target, formatted);
  return target;
}

async function renderLocalFile(name: string, local: Record<number, ContractEntry>) {
  const body = `/**
 * Autogenerated local (chainId ${LOCAL_CHAIN_ID}) overlay — do not edit by hand.
 *
 * This file is gitignored: your local deployment addresses live here and
 * should not be committed. Run \`pnpm generate\` after \`pnpm deploy:localhost\`
 * to refresh, or after a fresh clone to materialize a stub.
 */
import type { ContractDeployment } from "~~/utils/contract";

export const ${name} = ${serializeChains(local)} as const satisfies Partial<Record<number, ContractDeployment>>;
`;

  const formatted = await prettier.format(body, { parser: "typescript" });
  const target = path.join(TARGET_DIR, `${name}.local.ts`);
  fs.writeFileSync(target, formatted);
  return target;
}

async function renderContractFile(name: string, perChain: Record<number, ContractEntry>) {
  const remote: Record<number, ContractEntry> = {};
  const local: Record<number, ContractEntry> = {};
  for (const [chainIdStr, entry] of Object.entries(perChain)) {
    const chainId = Number(chainIdStr);
    if (chainId === LOCAL_CHAIN_ID) local[chainId] = entry;
    else remote[chainId] = entry;
  }

  await renderLocalFile(name, local);

  // Preserve tracked remote (Sepolia, etc.) entries when this run only has
  // local broadcasts. Without this, `pnpm deploy:localhost` (or postinstall
  // after a localhost deploy) would clobber the committed Sepolia addresses.
  // A fresh Sepolia broadcast always overwrites the corresponding entry.
  if (Object.keys(remote).length === 0) {
    const mainPath = path.join(TARGET_DIR, `${name}.ts`);
    if (fs.existsSync(mainPath)) {
      const head = fs.readFileSync(mainPath, "utf8").slice(0, 200);
      if (head.includes("This file is autogenerated")) return mainPath;
    }
  }
  return renderMainFile(name, remote);
}

/** Walk TARGET_DIR and ensure every autogenerated `<Name>.ts` has a matching
 *  `<Name>.local.ts` sidecar. On a fresh clone with no broadcasts, the tracked
 *  main files exist but the gitignored sidecars don't — without these stubs,
 *  the static `import { X } from "./X.local"` in the main file would fail. */
async function ensureLocalStubs() {
  if (!fs.existsSync(TARGET_DIR)) return;
  for (const file of fs.readdirSync(TARGET_DIR)) {
    if (!file.endsWith(".ts") || file.endsWith(".local.ts")) continue;
    const name = file.slice(0, -3);
    const mainPath = path.join(TARGET_DIR, file);
    const head = fs.readFileSync(mainPath, "utf8").slice(0, 200);
    if (!head.includes("This file is autogenerated")) continue;
    const sidecar = path.join(TARGET_DIR, `${name}.local.ts`);
    if (fs.existsSync(sidecar)) continue;
    await renderLocalFile(name, {});
    console.log(`  + wrote stub sidecar ${path.relative(REPO_ROOT, sidecar)}`);
  }
}

/** Wipe any previously-generated per-contract files that no longer have a
 *  broadcast entry, so renamed/removed contracts don't leave stale bundles.
 *
 *  Skipped when no broadcasts exist at all (fresh clone / CI install) — in that
 *  case the tracked main files came from git and shouldn't be deleted. */
function cleanStaleContractFiles(currentNames: Set<string>) {
  if (!fs.existsSync(TARGET_DIR)) return;
  if (currentNames.size === 0) return;
  for (const file of fs.readdirSync(TARGET_DIR)) {
    if (!file.endsWith(".ts")) continue;
    const baseName = file.endsWith(".local.ts")
      ? file.slice(0, -".local.ts".length)
      : file.slice(0, -3);
    if (currentNames.has(baseName)) continue;
    // Generated files start with a JSDoc marker we can detect — skip any
    // hand-written TS that happens to share the directory.
    const full = path.join(TARGET_DIR, file);
    const head = fs.readFileSync(full, "utf8").slice(0, 200);
    if (!head.includes("autogenerated")) continue;
    fs.unlinkSync(full);
    console.log(`  ✗ removed stale ${path.relative(REPO_ROOT, full)}`);
  }
}

async function main() {
  const deployments = collectDeployments();
  const contractNames = Object.keys(deployments);

  if (contractNames.length === 0) {
    console.warn("⚠ No deployments found in packages/foundry/broadcast/");
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  const written: Array<{ name: string; chains: number[] }> = [];
  const skipped: Array<{ name: string; reason: string }> = [];

  for (const [name, perChainRaw] of Object.entries(deployments)) {
    const abi = readAbi(name);
    if (abi === null) {
      // Stale broadcast — contract source has been removed. Skip it so
      // the generated files always match live source.
      skipped.push({ name, reason: "no out/ artifact" });
      continue;
    }
    const perChain: Record<number, ContractEntry> = {};
    for (const [chainIdStr, dep] of Object.entries(perChainRaw)) {
      perChain[Number(chainIdStr)] = {
        address: dep.address,
        abi,
        deployedOnBlock: dep.deployedOnBlock,
      };
    }
    await renderContractFile(name, perChain);
    written.push({ name, chains: Object.keys(perChain).map(Number) });
  }

  const writtenNames = new Set(written.map((w) => w.name));
  cleanStaleContractFiles(writtenNames);
  await ensureLocalStubs();

  for (const { name, chains } of written) {
    for (const chainId of chains) {
      const dep = deployments[name][chainId];
      console.log(`✓ ${name} [chainId ${chainId}] @ ${dep.address} (block ${dep.deployedOnBlock})`);
    }
  }
  for (const s of skipped) {
    console.warn(`  ⚠ skipped ${s.name} — ${s.reason}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
