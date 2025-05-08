import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { createFhevmInstance, getFhevmStatus } from '@/lib/fhevm/fhevmjs';
import { init } from '@/lib/fhevm/fhevmjs';
import { useWallet } from '@/hooks/wallet/useWallet';
import { FhevmStatus } from '@/lib/fhevm/fhevmjs';

interface FhevmContextType {
  isInitialized: boolean;
  instanceStatus: FhevmStatus;
}

export const FhevmContext = createContext<FhevmContextType | undefined>(
  undefined,
);

export function FhevmProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [instanceStatus, setInstanceStatus] =
    useState<FhevmStatus>('uninitialized');
  const { isConnected, isSepoliaChain } = useWallet();
  const [loading, setLoading] = useState(true);

  // Handle initial FHEVM library initialization
  useEffect(() => {
    if (window.fhevmjsInitialized) return;
    window.fhevmjsInitialized = true;

    init()
      .then(() => setIsInitialized(true))
      .catch((e) => {
        console.error('Failed to initialize FHEVM:', e);
        setIsInitialized(false);
      });
  }, []); // Only run once on mount

  // Handle instance creation/cleanup based on wallet state
  useEffect(() => {
    if (!isInitialized) return;

    if (isConnected && isSepoliaChain) {
      createFhevmInstance()
        .then(() => setInstanceStatus(getFhevmStatus()))
        .catch((error) => {
          console.error('Failed to create FHEVM instance:', error);
          setInstanceStatus('error');
        });
    }

    return () => {
      // Cleanup previous instance if necessary
      setInstanceStatus('uninitialized');
    };
  }, [isInitialized, isConnected, isSepoliaChain]);

  // if (!isInitialized) return <div>Initializing Fhevm</div>;

  return (
    <FhevmContext.Provider value={{ isInitialized, instanceStatus }}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (context === undefined) {
    throw new Error('useFhevm must be used within a FhevmProvider');
  }
  return context;
}
