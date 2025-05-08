import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect,
} from '@reown/appkit/react';
import { sepolia } from '@reown/appkit/networks';
import { networks } from '@/config';

export function useWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [displayAddress, setDisplayAddress] = useState<string>('');
  const { disconnect } = useDisconnect();
  const { caipNetwork, caipNetworkId, chainId, switchNetwork } =
    useAppKitNetwork();

  useEffect(() => {
    if (address) {
      setDisplayAddress(`${address.slice(0, 6)}...${address.slice(-4)}`);
    } else {
      setDisplayAddress('');
    }
  }, [address]);

  const isSepoliaChain = chainId === sepolia.id;

  const openConnectModal = () => {
    try {
      open();
    } catch (error) {
      console.error('Failed to open wallet connection:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to open wallet connection',
        variant: 'destructive',
      });
    }
  };

  // TODO: Add function to switch accounts
  const switchToSepolia = async () => {
    try {
      switchNetwork(sepolia);
    } catch (error) {
      console.error('Failed to connect to sepolia:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to switch network to sepolia',
        variant: 'destructive',
      });
    }
  };

  return {
    chainId,
    isConnected,
    isSepoliaChain,
    address,
    displayAddress,
    openConnectModal,
    switchToSepolia,
    disconnect,
    caipNetwork,
    caipNetworkId,
    switchNetwork,
    supportedNetworks: networks,
  };
}
