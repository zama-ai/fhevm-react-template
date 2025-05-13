import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { VITE_PROJECT_ID } from './env';

// Get projectId from https://cloud.reown.com
export const projectId = VITE_PROJECT_ID;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const metadata = {
  name: 'Fhevm React Template',
  description:
    'React starter template that allows you to interact with Zama fhevm',
  url: 'https://www.zama.ai/', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/57671822?s=200&v=4'],
};

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [sepolia] as [AppKitNetwork, ...AppKitNetwork[]];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
