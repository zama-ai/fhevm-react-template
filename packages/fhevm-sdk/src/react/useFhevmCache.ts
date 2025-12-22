/**
 * Caching utilities for FHEVM React Hooks
 * 
 * Provides memoization and caching strategies to improve Hook performance
 */

import { useMemo, useRef } from "react";

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /**
   * Cache timeout in milliseconds
   * @default 300000 (5 minutes)
   */
  timeout?: number;
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Hook for memoizing values with timeout-based cache invalidation
 * 
 * @param value - Value to cache
 * @param dependencies - Dependencies array (like useMemo)
 * @param options - Cache configuration
 * @returns Cached value
 * 
 * @example
 * ```typescript
 * const cachedInstance = useCachedValue(
 *   instance,
 *   [provider, chainId],
 *   { timeout: 60000 } // 1 minute cache
 * );
 * ```
 */
export function useCachedValue<T>(
  value: T,
  dependencies: React.DependencyList,
  options: CacheOptions = {}
): T {
  const { timeout = 300000, debug = false } = options;
  
  const cacheRef = useRef<CacheEntry<T> | null>(null);
  
  return useMemo(() => {
    const now = Date.now();
    
    // Check if cache is valid
    if (cacheRef.current) {
      const elapsed = now - cacheRef.current.timestamp;
      
      if (elapsed < timeout) {
        if (debug) {
          console.log("[useCachedValue] Cache hit", { elapsed, timeout });
        }
        return cacheRef.current.value;
      }
    }
    
    // Cache miss or expired
    if (debug) {
      console.log("[useCachedValue] Cache miss or expired");
    }
    
    cacheRef.current = {
      value,
      timestamp: now,
    };
    
    return value;
  }, dependencies);
}

/**
 * Hook for stable callback references with dependency tracking
 * 
 * Similar to useCallback but with better memoization for complex dependencies
 * 
 * @param callback - Callback function
 * @param dependencies - Dependencies array
 * @returns Memoized callback
 * 
 * @example
 * ```typescript
 * const stableEncrypt = useStableCallback(
 *   (data) => encryptWith((input) => input.add32(data)),
 *   [encryptWith]
 * );
 * ```
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  const callbackRef = useRef<T>(callback);
  const depsRef = useRef<React.DependencyList>(dependencies);
  
  // Update ref if dependencies changed
  const depsChanged = useMemo(() => {
    if (depsRef.current.length !== dependencies.length) {
      return true;
    }
    
    return dependencies.some((dep, index) => dep !== depsRef.current[index]);
  }, dependencies);
  
  if (depsChanged) {
    callbackRef.current = callback;
    depsRef.current = dependencies;
  }
  
  // Return stable reference
  const stableCallback = useRef<T>(((...args: any[]) => {
    return callbackRef.current(...args);
  }) as T);
  
  return stableCallback.current;
}

/**
 * Hook for debouncing values
 * 
 * @param value - Value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced value
 * 
 * @example
 * ```typescript
 * const debouncedChainId = useDebouncedValue(chainId, 500);
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  React.useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook for creating a stable object reference based on JSON serialization
 * 
 * Useful for objects that should be compared by value, not reference
 * 
 * @param obj - Object to stabilize
 * @returns Stable object reference
 * 
 * @example
 * ```typescript
 * const stableMockChains = useStableObject({ 31337: "http://localhost:8545" });
 * // Reference only changes if content changes
 * ```
 */
export function useStableObject<T extends object>(obj: T | undefined): T | undefined {
  const objRef = useRef<T | undefined>(obj);
  const jsonRef = useRef<string>(obj ? JSON.stringify(obj) : "");
  
  return useMemo(() => {
    if (!obj) {
      return undefined;
    }
    
    const currentJson = JSON.stringify(obj);
    
    if (currentJson === jsonRef.current) {
      return objRef.current;
    }
    
    jsonRef.current = currentJson;
    objRef.current = obj;
    return obj;
  }, [obj]);
}

/**
 * Hook for computing derived values with caching
 * 
 * @param compute - Computation function
 * @param dependencies - Dependencies array
 * @param options - Cache options
 * @returns Computed value
 * 
 * @example
 * ```typescript
 * const contractAddresses = useComputedValue(
 *   () => requests.map(r => r.contractAddress),
 *   [requests],
 *   { timeout: 60000 }
 * );
 * ```
 */
export function useComputedValue<T>(
  compute: () => T,
  dependencies: React.DependencyList,
  options: CacheOptions = {}
): T {
  const computed = useMemo(compute, dependencies);
  return useCachedValue(computed, dependencies, options);
}

// Re-export React for convenience
import * as React from "react";

