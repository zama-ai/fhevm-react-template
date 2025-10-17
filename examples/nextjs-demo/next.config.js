/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better pnpm workspace support
  experimental: {
    externalDir: true,
    webpackBuildWorker: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Better support for pnpm workspaces
    config.resolve.symlinks = false;
    
    // Prevent circular dependencies by disabling module concatenation for problematic modules
    config.optimization.concatenateModules = false;
    
    // Handle React Native dependencies that aren't needed in browser
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': require.resolve('./src/utils/async-storage-fallback.js'),
    };
    
    // Ignore React Native modules that aren't needed in browser
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': false,
      'react-native-web': false,
    };
    
    // Fix circular dependency issues with more aggressive chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 0,
        maxInitialRequests: Infinity,
        maxAsyncRequests: Infinity,
        cacheGroups: {
          default: false,
          vendors: false,
          // Separate chunk for each major library to prevent circular dependencies
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          ethers: {
            test: /[\\/]node_modules[\\/]ethers[\\/]/,
            name: 'ethers',
            chunks: 'all',
            priority: 19,
          },
          wagmi: {
            test: /[\\/]node_modules[\\/](wagmi|viem|@wagmi)[\\/]/,
            name: 'wagmi',
            chunks: 'all',
            priority: 18,
          },
          appkit: {
            test: /[\\/]node_modules[\\/]@reown[\\/]/,
            name: 'appkit',
            chunks: 'all',
            priority: 17,
          },
          cloak: {
            test: /[\\/]node_modules[\\/]@cloak-sdk[\\/]/,
            name: 'cloak-sdk',
            chunks: 'all',
            priority: 16,
          },
          fhevm: {
            test: /[\\/]node_modules[\\/](@fhevm|@zama-fhe)[\\/]/,
            name: 'fhevm',
            chunks: 'all',
            priority: 15,
          },
          // Catch-all for other node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    };
    
    return config;
  },
  env: {
    CUSTOM_KEY: 'my-value',
    npm_config_workspaces: 'false',
    npm_config_workspace: 'false',
    LIT_DEV_MODE: 'false',
  },
}

module.exports = nextConfig
