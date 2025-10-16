import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// .env.local dosyasını direkt oku
function loadEnvLocal(): Record<string, string> {
  const envPath = path.resolve(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env.local bulunamadı');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  envContent.split('\n').forEach((line) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      env[key.trim()] = value;
    }
  });

  return env;
}

// Hex string'i Uint8Array'a dönüştür
function hexToUint8ArrayCode(hex: string): string {
  if (!hex) return 'undefined';
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes: number[] = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  return `new Uint8Array([${bytes.join(',')}])`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnvLocal();

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.NEXT_PUBLIC_RELAYER_PUBLIC_KEY': env.NEXT_PUBLIC_RELAYER_PUBLIC_KEY 
        ? hexToUint8ArrayCode(env.NEXT_PUBLIC_RELAYER_PUBLIC_KEY)
        : 'undefined',
      'process.env.NEXT_PUBLIC_RELAYER_PUBLIC_KEY_HEX': JSON.stringify(env.NEXT_PUBLIC_RELAYER_PUBLIC_KEY || ''),
      'process.env.NEXT_PUBLIC_RELAYER_PUBLIC_KEY_ID': JSON.stringify(env.NEXT_PUBLIC_RELAYER_PUBLIC_KEY_ID || ''),
      'process.env.NEXT_PUBLIC_RELAYER_ENDPOINT': JSON.stringify(env.NEXT_PUBLIC_RELAYER_ENDPOINT || ''),
      'process.env.NEXT_PUBLIC_RELAYER_API_KEY': JSON.stringify(env.NEXT_PUBLIC_RELAYER_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
