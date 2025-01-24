import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

const workerImportMetaUrlRE =
  /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*(new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\))/g;

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.bin'],
  plugins: [
    react(),
    nodePolyfills(),
    tailwindcss()
  ],
  define: {
    'import.meta.env.MOCKED': process.env.MOCKED === 'true',
  },
  resolve: {
    alias: [
      { find: '@deployments', replacement: path.resolve(__dirname, '../hardhat/deployments') },
      { find: '@/components', replacement: path.resolve(__dirname, './components') },
      { find: '@/lib', replacement: path.resolve(__dirname, './lib') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './hooks') }
    ],
  },
  server: {
    port: 9000,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
