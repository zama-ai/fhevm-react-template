"use client";

import { useEffect, useMemo, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { RelayerWeb, SepoliaConfig, memoryStorage } from "@zama-fhe/sdk";
import { RelayerCleartext, hardhatCleartextConfig } from "@zama-fhe/sdk/cleartext";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider, useChainId } from "wagmi";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/helper";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { WagmiSigner } from "~~/services/web3/wagmiSigner";

const signer = new WagmiSigner({ config: wagmiConfig });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// ZamaProvider takes a single relayer, but RelayerWeb can't serve Hardhat
// (HardhatConfig.relayerUrl is empty, and the CDN-loaded relayer-sdk rejects it).
// Swap to RelayerCleartext for chainId 31337 and rebuild on chain changes.
const ZamaRuntimeProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId();

  const relayer = useMemo(() => {
    if (chainId === 31337) {
      return new RelayerCleartext(hardhatCleartextConfig);
    }
    return new RelayerWeb({
      getChainId: () => signer.getChainId(),
      transports: {
        11155111: SepoliaConfig,
      },
    });
  }, [chainId]);

  useEffect(() => {
    return () => {
      relayer.terminate();
    };
  }, [relayer]);

  return (
    <ZamaProvider relayer={relayer} signer={signer} storage={memoryStorage}>
      {children}
    </ZamaProvider>
  );
};

export const DappWrapperWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ZamaRuntimeProvider>
            <ProgressBar height="3px" color="#2299dd" />
            <div className={`flex flex-col min-h-screen`}>
              <Header />
              <main className="relative flex flex-col flex-1">{children}</main>
            </div>
            <Toaster />
          </ZamaRuntimeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
