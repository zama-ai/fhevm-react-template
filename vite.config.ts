import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const workerImportMetaUrlRE =
  /\bnew\s+(?:Worker|SharedWorker)\s*\(\s*(new\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*\))/g;

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.bin'],
  plugins: [react(), nodePolyfills()],
  worker: {
    format: 'es',
    // https://github.com/vitejs/vite/issues/7015
    // https://github.com/vitejs/vite/issues/14499#issuecomment-1740267849
    plugins: () => [
      {
        name: 'Disable nested workers',
        enforce: 'pre',
        transform(code: string, id: string) {
          if (code.includes('new Worker') && code.includes('new URL') && code.includes('import.meta.url')) {
            return code.replace(workerImportMetaUrlRE, `((() => { throw new Error('Nested workers are disabled') })()`);
          }
        },
      },
    ],
  },
});
