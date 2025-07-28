import { useEffect, useRef } from "react";

type LockInstance = {
  invalid: () => boolean;
  release: () => void;
};

export function useAsyncSymbolGuard() {
  const currentTokenRef = useRef<symbol | undefined>(undefined);

  // Unmount only
  useEffect(() => {
    return () => {
      currentTokenRef.current = Symbol();
    };
  }, []);

  const tryLock = (): LockInstance | undefined => {
    if (currentTokenRef.current !== undefined) {
      return undefined;
    }

    const token = Symbol();
    currentTokenRef.current = token;

    return {
      invalid: () => currentTokenRef.current !== token,
      release: () => {
        if (currentTokenRef.current === token) {
          currentTokenRef.current = undefined;
        }
      },
    };
  };

  const locked = () => {
    return currentTokenRef.current !== undefined;
  };

  return { tryLock, locked };
}
