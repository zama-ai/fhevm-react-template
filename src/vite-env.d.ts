/// <reference types="vite/client" />

interface Window {
  ethereum: {
    request<T = any>(request: { method: string; params?: Array<any> | Record<string, any> }): Promise<T>;
  };
}
