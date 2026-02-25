import type { NextConfig } from "next";

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
  // Configure webpack fallbacks for client-side (these packages shouldn't be bundled for browser)
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
