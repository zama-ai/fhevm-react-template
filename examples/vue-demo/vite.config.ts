import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    define: {
      global: 'globalThis',
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    optimizeDeps: {
      include: ['ethers', '@cloak-sdk/core']
    },
    build: {
      target: 'esnext',
      minify: mode === 'production' ? 'esbuild' : false,
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'vue': ['vue'],
            'ethers': ['ethers'],
            'cloak-sdk': ['@cloak-sdk/core']
          }
        }
      }
    },
    esbuild: {
      target: 'esnext'
    },
    server: {
      port: 3001,
      host: true
    }
  }
})
