import { computed, onScopeDispose, ref, shallowRef, unref, watch } from "vue";
import type { Ref } from "vue";
import type { FhevmInstance } from "../fhevmTypes.js";
import { createFhevmInstance } from "../internal/fhevm.js";

function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    const m = message ? `Assertion failed: ${message}` : `Assertion failed.`;
    throw new Error(m);
  }
}

export type FhevmGoState = "idle" | "loading" | "ready" | "error";

type MaybeRef<T> = T | Ref<T>;
type ProviderLike = string | { request?: (...args: any[]) => Promise<unknown> } | undefined;

export interface UseFhevmParameters {
  provider: MaybeRef<ProviderLike>;
  chainId: MaybeRef<number | undefined>;
  enabled?: MaybeRef<boolean | undefined>;
  initialMockChains?: MaybeRef<Readonly<Record<number, string>> | undefined>;
}

export const useFhevm = (parameters: UseFhevmParameters) => {
  const providerValue = computed(() => unref(parameters.provider));
  const chainIdValue = computed(() => unref(parameters.chainId));
  const enabledValue = computed(() => {
    const raw = parameters.enabled === undefined ? undefined : unref(parameters.enabled);
    return raw ?? true;
  });
  const mockChainsValue = computed(() =>
    parameters.initialMockChains === undefined ? undefined : unref(parameters.initialMockChains) ?? undefined,
  );

  const instance = shallowRef<FhevmInstance | undefined>(undefined);
  const status = ref<FhevmGoState>("idle");
  const error = shallowRef<Error | undefined>(undefined);

  const isRunning = ref<boolean>(enabledValue.value ?? true);
  const providerVersion = ref(0);

  const abortController = shallowRef<AbortController | null>(null);
  const providerRef = shallowRef<ProviderLike>(undefined);
  const chainIdRef = ref<number | undefined>(undefined);
  const mockChainsRef = shallowRef<Record<number, string> | undefined>(undefined);

  const refresh = () => {
    if (abortController.value) {
      providerRef.value = undefined;
      chainIdRef.value = undefined;
      abortController.value.abort();
      abortController.value = null;
    }

    providerRef.value = providerValue.value;
    chainIdRef.value = chainIdValue.value;
    mockChainsRef.value = mockChainsValue.value ? { ...mockChainsValue.value } : undefined;

    instance.value = undefined;
    error.value = undefined;
    status.value = "idle";

    if (providerValue.value !== undefined) {
      providerVersion.value += 1;
    }
  };

  watch(
    [providerValue, chainIdValue, mockChainsValue],
    () => {
      refresh();
    },
    { immediate: true },
  );

  watch(
    enabledValue,
    (value: boolean | undefined) => {
      isRunning.value = value ?? true;
    },
    { immediate: true },
  );

  watch(
    [isRunning, providerVersion],
    async ([running]: [boolean, number]) => {
      if (!running) {
        if (abortController.value) {
          abortController.value.abort();
          abortController.value = null;
        }
        instance.value = undefined;
        error.value = undefined;
        status.value = "idle";
        return;
      }

      if (providerRef.value === undefined) {
        instance.value = undefined;
        error.value = undefined;
        status.value = "idle";
        return;
      }

      if (!abortController.value || abortController.value.signal.aborted) {
        abortController.value = new AbortController();
      }

  const controller = abortController.value;
  assert(controller !== null, "AbortController not initialized");
  assert(!controller.signal.aborted, "!controller.signal.aborted");

      status.value = "loading";
      error.value = undefined;

      const currentProvider = providerRef.value;
      const currentMockChains = mockChainsRef.value;

      try {
        const inst = await createFhevmInstance({
          signal: controller.signal,
          provider: currentProvider as any,
          mockChains: currentMockChains as any,
          onStatusChange: s => console.log(`[useFhevm][vue] createFhevmInstance status changed: ${s}`),
        });

        if (controller.signal.aborted) return;
        assert(currentProvider === providerRef.value, "currentProvider === providerRef.value");

        instance.value = inst;
        status.value = "ready";
      } catch (err) {
        if (controller.signal.aborted) return;
        assert(currentProvider === providerRef.value, "currentProvider === providerRef.value");

        instance.value = undefined;
        error.value = err instanceof Error ? err : new Error(String(err));
        status.value = "error";
      }
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
  });

  return {
    instance,
    refresh,
    error,
    status,
  } as const;
};
