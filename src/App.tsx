import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { AnimatePresence } from 'framer-motion';
import { FhevmProvider } from '@/providers/FhevmProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { createAppKit } from '@reown/appkit/react';

import Header from './components/layout/Header';
import Transfer from './pages/Transfer';
import Fhevm from './pages/Fhevm';
import NotFound from './pages/NotFound';
import { projectId, metadata, networks, wagmiAdapter } from './config';

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  defaultAccountTypes: { eip155: 'eoa' },
  enableWalletGuide: false,
  projectId,
  networks,
  metadata,
  enableCoinbase: false,
  coinbasePreference: 'smartWalletOnly',
  themeMode: 'light' as const,
  themeVariables: {
    '--w3m-border-radius-master': '0',
    '--w3m-font-family': 'Telegraf',
  },
  features: {
    legalCheckbox: true,
    analytics: true,
    swaps: false,
    send: false,
    history: false,
    connectMethodsOrder: ['email', 'social', 'wallet'],
  },
});

function App() {
  if (!import.meta.env.VITE_KMS_ADDRESS)
    throw new Error('Missing VITE_KMS_ADDRESS environment variable');
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <FhevmProvider>
            <ThemeProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Header />
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Fhevm />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
              </BrowserRouter>
            </ThemeProvider>
          </FhevmProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
