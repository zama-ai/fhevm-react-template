import { useCallback, useMemo } from 'react';
import { FhevmClient } from '../core/FhevmClient';

export type FHEDecryptRequest = { handle: string };

export const useFHEDecryption = (params: {
  client: FhevmClient | undefined;
}) => {
  const { client } = params;

  const canDecrypt = useMemo(() => Boolean(client), [client]);

  const decrypt = useCallback(
    async (handle: string): Promise<string | bigint | boolean | undefined> => {
      if (!client) return undefined;

      return await client.userDecrypt(handle);
    },
    [client],
  );

  return {
    canDecrypt,
    decrypt,
  } as const;
};
