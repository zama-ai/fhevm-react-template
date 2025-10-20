import { useCallback, useEffect, useRef, useState } from "react";
import type { FhevmInstance } from "../fhevmTypes.js";
import { FhevmClient, FhevmClientStatus } from "../core/FhevmClient.js";
import { ethers } from "ethers";

function _assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    const m = message ? `Assertion failed: ${message}` : `Assertion failed.`;
    throw new Error(m);
  }
}

export type FhevmGoState = "idle" | "loading" | "ready" | "error";

/**
 * Map FhevmClientStatus to FhevmGoState for backward compatibility
 */
function mapClientStatusToGoState(status: FhevmClientStatus): FhevmGoState {
  switch (status) {
    case "idle":
      return "idle";
    case "sdk-loading":
    case "sdk-loaded":
    case "sdk-initializing":
    case "sdk-initialized":
    case "creating":
      return "loading";
    case "ready":
      return "ready";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

export function useFhevm(parameters: {
  provider: string | ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  enabled?: boolean;
  initialMockChains?: Readonly<Record<number, string>>;
}): {
  instance: FhevmInstance | undefined;
  refresh: () => void;
  error: Error | undefined;
  status: FhevmGoState;
} {
  const { provider, chainId, initialMockChains, enabled = true } = parameters;

  const [instance, _setInstance] = useState<FhevmInstance | undefined>(undefined);
  const [status, _setStatus] = useState<FhevmGoState>("idle");
  const [error, _setError] = useState<Error | undefined>(undefined);
  const [_isRunning, _setIsRunning] = useState<boolean>(enabled);
  const [_providerChanged, _setProviderChanged] = useState<number>(0);
  const _clientRef = useRef<FhevmClient | null>(null);
  const _providerRef = useRef<string | ethers.Eip1193Provider | undefined>(provider);
  const _chainIdRef = useRef<number | undefined>(chainId);
  const _mockChainsRef = useRef<Record<number, string> | undefined>(initialMockChains as any);

  const refresh = useCallback(() => {
    if (_clientRef.current) {
      _providerRef.current = undefined;
      _chainIdRef.current = undefined;

      _clientRef.current.abort();
      _clientRef.current.dispose();
      _clientRef.current = null;
    }

    _providerRef.current = provider;
    _chainIdRef.current = chainId;

    _setInstance(undefined);
    _setError(undefined);
    _setStatus("idle");

    if (provider !== undefined) {
      _setProviderChanged(prev => prev + 1);
    }
  }, [provider, chainId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    _setIsRunning(enabled);
  }, [enabled]);

  useEffect(() => {
    if (_isRunning === false) {
      if (_clientRef.current) {
        _clientRef.current.abort();
        _clientRef.current.dispose();
        _clientRef.current = null;
      }
      _setInstance(undefined);
      _setError(undefined);
      _setStatus("idle");
      return;
    }

    if (_isRunning === true) {
      if (_providerRef.current === undefined) {
        _setInstance(undefined);
        _setError(undefined);
        _setStatus("idle");
        return;
      }

      const thisProvider = _providerRef.current;
      const thisRpcUrlsByChainId = _mockChainsRef.current as any;

      // Create new client
      const client = new FhevmClient({
        provider: thisProvider as any,
        mockChains: thisRpcUrlsByChainId as any,
        onStatusChange: (clientStatus) => {
          console.log(`[useFhevm] FhevmClient status changed: ${clientStatus}`);
          _setStatus(mapClientStatusToGoState(clientStatus));
        },
      });

      _clientRef.current = client;
      _setStatus("loading");
      _setError(undefined);

      // Initialize client
      client
        .initialize()
        .then(() => {
          _assert(thisProvider === _providerRef.current, "thisProvider === _providerRef.current");

          const inst = client.getInstance();
          _setInstance(inst);
          _setError(undefined);
          _setStatus("ready");
        })
        .catch((e) => {
          _assert(thisProvider === _providerRef.current, "thisProvider === _providerRef.current");

          _setInstance(undefined);
          _setError(e as any);
          _setStatus("error");
        });
    }
  }, [_isRunning, _providerChanged]);

  return { instance, refresh, error, status };
}

