import type { NextConfig } from "next";
// import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: process.env.IS_MOCK_FHEVM === "true"
        ? "tsconfig.mock-fhevm.json"
        : "tsconfig.json"
  },
  headers() {
    // Required by FHEVM 
    return Promise.resolve([
      {
        source: '/',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]);
  }
};

export default nextConfig;
