// React adapter for FHEVM Relayer
import { useEffect, useState } from 'react';
import { FHEVMRelayer } from '../core/relayer';

export function useFHEVMRelayer(trace?: (msg: string) => void) {
  const [sdk, setSdk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const relayer = new FHEVMRelayer(trace);
    relayer.init()
      .then(() => {
        setSdk(relayer.getSDK());
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [trace]);

  return { sdk, loading, error };
}

// Usage in React:
// const { sdk, loading, error } = useFHEVMRelayer();
