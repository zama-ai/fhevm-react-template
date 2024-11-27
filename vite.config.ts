import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const workerImportMetaUrlRE =
  /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*(new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\))/g;

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.bin'],
  plugins: [
    react(),
    // wasm(),
    nodePolyfills(),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: 'node_modules/fhevmjs/lib/tfhe_bg.wasm',
    //       dest: 'node_modules/.vite/deps/tfhe_bg.wasm',
    //     },
    //   ],
    // }),
  ],
  optimizeDeps: {
    exclude: ['fhevmjs'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  worker: {
    format: 'es',
    // https://github.com/vitejs/vite/issues/7015
    // https://github.com/vitejs/vite/issues/14499#issuecomment-1740267849
    plugins: () => [
      {
        name: 'Disable nested workers',
        enforce: 'pre',
        transform(code: string, id: string) {
          const toFind = "new URL('./workerHelpers.worker.js', import.meta.url)";
          return code.replace(toFind, `new URL('./workerHelpers.worker.js')`);
        },
      },
      wasm(),
    ],
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
