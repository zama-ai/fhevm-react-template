import { useCallback, useEffect, useRef, useState } from "react";
import { createFhevmInstance } from "../internal/fhevm";
function _assert(condition, message) {
    if (!condition) {
        const m = message ? `Assertion failed: ${message}` : `Assertion failed.`;
        throw new Error(m);
    }
}
export function useFhevm(parameters) {
    const { provider, chainId, initialMockChains, enabled = true } = parameters;
    const [instance, _setInstance] = useState(undefined);
    const [status, _setStatus] = useState("idle");
    const [error, _setError] = useState(undefined);
    const [_isRunning, _setIsRunning] = useState(enabled);
    const [_providerChanged, _setProviderChanged] = useState(0);
    const _abortControllerRef = useRef(null);
    const _providerRef = useRef(provider);
    const _chainIdRef = useRef(chainId);
    const _mockChainsRef = useRef(initialMockChains);
    const refresh = useCallback(() => {
        if (_abortControllerRef.current) {
            _providerRef.current = undefined;
            _chainIdRef.current = undefined;
            _abortControllerRef.current.abort();
            _abortControllerRef.current = null;
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
            if (_abortControllerRef.current) {
                _abortControllerRef.current.abort();
                _abortControllerRef.current = null;
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
            if (!_abortControllerRef.current) {
                _abortControllerRef.current = new AbortController();
            }
            _assert(!_abortControllerRef.current.signal.aborted, "!controllerRef.current.signal.aborted");
            _setStatus("loading");
            _setError(undefined);
            const thisSignal = _abortControllerRef.current.signal;
            const thisProvider = _providerRef.current;
            const thisRpcUrlsByChainId = _mockChainsRef.current;
            createFhevmInstance({
                signal: thisSignal,
                provider: thisProvider,
                mockChains: thisRpcUrlsByChainId,
                onStatusChange: (s) => console.log(`[useFhevm] createFhevmInstance status changed: ${s}`),
            })
                .then((i) => {
                if (thisSignal.aborted)
                    return;
                _assert(thisProvider === _providerRef.current, "thisProvider === _providerRef.current");
                _setInstance(i);
                _setError(undefined);
                _setStatus("ready");
            })
                .catch((e) => {
                if (thisSignal.aborted)
                    return;
                _assert(thisProvider === _providerRef.current, "thisProvider === _providerRef.current");
                _setInstance(undefined);
                _setError(e);
                _setStatus("error");
            });
        }
    }, [_isRunning, _providerChanged]);
    return { instance, refresh, error, status };
}
