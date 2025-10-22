import React, { createContext, useContext, useEffect, useState } from 'react';
import { FHEVMConfig, FHEVMInstance, FHEVMComponentProps } from '../../types';
import { getFHEVMClient } from '../../core/fhevm-client';

interface FHEVMContextType {
  instance: FHEVMInstance | undefined;
  isInitialized: boolean;
  isLoading: boolean;
  error?: string;
  initialize: (config: FHEVMConfig) => Promise<void>;
}

const FHEVMContext = createContext<FHEVMContextType | undefined>(undefined);

/**
 * FHEVM Provider component for React applications
 * Provides FHEVM instance to child components
 */
export function FHEVMProvider({ children, config, onError, onReady }: FHEVMComponentProps) {
  const [instance, setInstance] = useState<FHEVMInstance | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const client = getFHEVMClient();

  const initialize = async (initConfig: FHEVMConfig) => {
    try {
      setIsLoading(true);
      setError(undefined);

      const fhevmInstance = await client.initialize(initConfig);

      if (fhevmInstance.status === 'error') {
        const errorMessage = fhevmInstance.error || 'Failed to initialize FHEVM';
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      setInstance(fhevmInstance);
      setIsInitialized(true);
      onReady?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-initialize if config is provided
  useEffect(() => {
    if (config && !isInitialized && !isLoading) {
      initialize(config);
    }
  }, [config, isInitialized, isLoading]);

  const contextValue: FHEVMContextType = {
    instance,
    isInitialized,
    isLoading,
    error,
    initialize,
  };

  return (
    <FHEVMContext.Provider value={contextValue}>
      {children}
    </FHEVMContext.Provider>
  );
}

/**
 * Hook to use FHEVM context
 */
export function useFHEVMContext(): FHEVMContextType {
  const context = useContext(FHEVMContext);
  if (context === undefined) {
    throw new Error('useFHEVMContext must be used within a FHEVMProvider');
  }
  return context;
}

/**
 * Higher-order component for FHEVM
 */
export function withFHEVM<P extends object>(
  Component: React.ComponentType<P>,
  config: FHEVMConfig
) {
  return function WithFHEVMComponent(props: P) {
    return (
      <FHEVMProvider config={config}>
        <Component {...props} />
      </FHEVMProvider>
    );
  };
}
