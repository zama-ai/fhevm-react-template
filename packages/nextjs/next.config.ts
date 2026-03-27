import type { NextConfig } from "next";
import path from "path";

// The @fhevm/sdk workspace link points into the SDK's src/ directory.
// The ESM build at src/_esm/ uses relative imports like ../../../../wasm/tkms/kms_lib.js
// which resolve to src/_esm/wasm/ — but the actual WASM files live at src/wasm/.
// This alias fixes the mismatch so webpack can find them.
const SDK_ROOT = path.resolve(__dirname, "../../../../src");
const SDK_ESM_WASM = path.join(SDK_ROOT, "_esm", "wasm");
const SDK_REAL_WASM = path.join(SDK_ROOT, "wasm");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Turbopack: resolve Node.js built-ins to empty modules for client bundle
  // Next.js 15.x uses experimental.turbo; Next 16+ uses turbopack
  experimental: {
    turbo: {
      resolveAlias: {
        fs: "./empty-module.js",
        net: "./empty-module.js",
        tls: "./empty-module.js",
        child_process: "./empty-module.js",
        worker_threads: "./empty-module.js",
      },
    },
  },
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  // Configure webpack for @fhevm/sdk compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: require.resolve("./empty-module.js"),
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
      };
    }

    // Fix WASM path resolution: src/_esm/wasm/ → src/wasm/
    config.resolve.alias = {
      ...config.resolve.alias,
      [SDK_ESM_WASM]: SDK_REAL_WASM,
    };

    // Handle node: protocol scheme — webpack doesn't support it natively.
    // These are dynamic imports in @fhevm/sdk that only run in Node.js;
    // in the browser the SDK uses base64-embedded WASM instead.
    config.plugins.push(
      new (require("webpack").NormalModuleReplacementPlugin)(
        /^node:/,
        (resource: any) => {
          resource.request = require.resolve("./empty-module.js");
        },
      ),
    );

    // The SDK's wasmBaseUrl.js uses `typeof __filename !== "undefined"` to
    // detect CJS vs ESM. Webpack provides a __filename mock, causing the CJS
    // branch to run in the browser. Replace wasmBaseUrl.js with a browser-safe
    // version that always uses import.meta.url.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        [path.resolve(SDK_ROOT, "wasm", "wasmBaseUrl.js")]: path.resolve(
          __dirname,
          "fhevm-wasm-base-url-browser.js",
        ),
      };
    }

    // Suppress "critical dependency" warnings from @fhevm/sdk's dynamic WASM worker imports.
    // These are runtime-computed paths that webpack can't statically analyze, but they work fine.
    config.module.exprContextCritical = false;

    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;
