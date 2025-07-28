import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";
import { fhevmReactConfig } from "@/fhevm-react/fhevmReactConfig";

// const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL; // for Vite
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL; // for Next.js
const isDebug = fhevmReactConfig.build === "debug";

export function getConfig() {
  if (isDebug) {
    console.log("Run fhevm-react in debug mode.");
    return createConfig({
      chains: [sepolia, hardhat],
      connectors: [metaMask()],
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      transports: {
        [sepolia.id]: http(sepoliaRpcUrl),
        [hardhat.id]: http(),
      },
    });
  }
  
  return createConfig({
    chains: [sepolia],
    connectors: [metaMask()],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [sepolia.id]: http(sepoliaRpcUrl),
    },
  });
}
