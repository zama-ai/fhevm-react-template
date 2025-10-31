import { useEffect, useRef } from 'react';
import { FhevmClient, type FhevmClientInitOptions } from '../core/FhevmClient';

export function useFhevmClient(options: FhevmClientInitOptions) {
  const ref = useRef<FhevmClient>(new FhevmClient());

  useEffect(() => {
    ref.current.init(options);
  }, [options.contractAddress, options.durationDays, options.walletClient, options.sdkUrl]);

  return ref.current;
}
