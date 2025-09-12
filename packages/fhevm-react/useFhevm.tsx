import { ethers } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FhevmInstance } from "./fhevmTypes";
import { createFhevmInstance } from "./internal/fhevm";

function _assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    const m = message ? `Assertion failed: ${message}` : `Assertion failed.`;
    console.error(m);
    throw new Error(m);
  }
}

export type FhevmGoState = "idle" | "loading" | "ready" | "error";

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

  const [instance, _setInstance] = useState<FhevmInstance | undefined>(
    undefined
  );
  const [status, _setStatus] = useState<FhevmGoState>("idle");
  const [error, _setError] = useState<Error | undefined>(undefined);
  const [_isRunning, _setIsRunning] = useState<boolean>(enabled);
  const [_providerChanged, _setProviderChanged] = useState<number>(0);
  const _abortControllerRef = useRef<AbortController | null>(null);
  const _providerRef = useRef<string | ethers.Eip1193Provider | undefined>(
    provider
  );
  const _chainIdRef = useRef<number | undefined>(chainId);
  const _mockChainsRef = useRef<Record<number, string> | undefined>(
    initialMockChains
  );

  const refresh = useCallback(() => {
    // Provider or chainId has changed. Abort immediately
    if (_abortControllerRef.current) {
      // Make sure _providerRef.current + _chainIdRef.current are undefined during abort
      _providerRef.current = undefined;
      _chainIdRef.current = undefined;

      _abortControllerRef.current.abort();
      _abortControllerRef.current = null;
    }

    _providerRef.current = provider;
    _chainIdRef.current = chainId;

    // Nullify instance immediately
    _setInstance(undefined);
    _setError(undefined);
    _setStatus("idle");

    if (provider !== undefined) {
      // Force call main useEffect
      _setProviderChanged((prev) => prev + 1);
    }

    // Do not modify the running flag.
  }, [provider, chainId]);

  // Merge in main useEffect!!!
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    _setIsRunning(enabled);
  }, [enabled]);

  // Main useEffect
  useEffect(() => {
    // is _providerRef.current valid here ?
    // even if the first useEffect is rendered in the same render-cycle ?
    if (_isRunning === false) {
      // cancelled
      console.log("cancelled");
      if (_abortControllerRef.current) {
        _abortControllerRef.current.abort();
        _abortControllerRef.current = null;
      }
      // May already be null if provider was changed in the previous render-cycle
      _setInstance(undefined);
      _setError(undefined);
      _setStatus("idle");
      return;
    }

    if (_isRunning === true) {
      if (_providerRef.current === undefined) {
        // instance should be undefined
        // this code below should be unecessary
        _setInstance(undefined);
        _setError(undefined);
        _setStatus("idle");
        return;
      }

      if (!_abortControllerRef.current) {
        _abortControllerRef.current = new AbortController();
      }

      _assert(
        !_abortControllerRef.current.signal.aborted,
        "!controllerRef.current.signal.aborted"
      );

      // Keep old instance
      // Was set to undefined if provider changed
      _setStatus("loading");
      _setError(undefined);

      const thisSignal = _abortControllerRef.current.signal;
      const thisProvider = _providerRef.current;
      // Can be undefined, if so, call eth_chainId
      const thisRpcUrlsByChainId = _mockChainsRef.current;

      createFhevmInstance({
        signal: thisSignal,
        provider: thisProvider,
        mockChains: thisRpcUrlsByChainId,
        onStatusChange: (s) =>
          console.log(`[useFhevm] createFhevmInstance status changed: ${s}`),
      })
        .then((i) => {
          console.log(`[useFhevm] createFhevmInstance created!`);
          //console.log(`completed (runId=${thisRunId})...`);
          if (thisSignal.aborted) return;

          // is there a edge case where the assert below would fail ?
          // it's not possible to have a _providerRef modified without a prior abort
          _assert(
            thisProvider === _providerRef.current,
            "thisProvider === _providerRef.current"
          );

          _setInstance(i);
          _setError(undefined);
          _setStatus("ready");
        })
        .catch((e) => {
          console.log(`Error Was thrown !!! error... ` + e.name);
          if (thisSignal.aborted) return;

          // it's not possible to have a _providerRef modified without a prior abort
          _assert(
            thisProvider === _providerRef.current,
            "thisProvider === _providerRef.current"
          );

          _setInstance(undefined);
          _setError(e);
          _setStatus("error");
        });
    }
  }, [_isRunning, _providerChanged]);

  return { instance, refresh, error, status };
}
