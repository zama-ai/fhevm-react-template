import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const metadata = {
  name: 'Token Portfolio App',
  description: 'Token Portfolio App',
  url: 'https://www.zama.ai/', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [mainnet, sepolia] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
