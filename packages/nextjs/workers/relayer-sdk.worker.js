/**
 * Self-contained FHE Web Worker for @zama-fhe/sdk.
 *
 * This file mirrors the SDK's relayer-sdk.worker.js but inlines the small
 * utility helpers so that webpack can bundle it without resolving the SDK's
 * private chunk files.  The worker is referenced from next.config.ts via
 * NormalModuleReplacementPlugin so that the SDK's `new Worker(new URL(…))`
 * resolves here instead of into node_modules.
 */

// ---------------------------------------------------------------------------
// Inlined utilities (from @zama-fhe/sdk chunks)
// ---------------------------------------------------------------------------

function assertObject(value, context) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${context} must be an object, got ${typeof value}`);
  }
}

function assertString(value, context) {
  if (typeof value !== "string") {
    throw new TypeError(`${context} must be a string, got ${typeof value}`);
  }
}

function convertToBigIntRecord(result) {
  const clearValues = {};
  for (const [handle, value] of Object.entries(result)) {
    if (typeof value === "bigint") {
      clearValues[handle] = value;
    } else if (typeof value === "boolean") {
      clearValues[handle] = value ? BigInt(1) : BigInt(0);
    } else if (typeof value === "string" || typeof value === "number") {
      clearValues[handle] = BigInt(value);
    } else {
      throw new TypeError(
        `Unexpected decrypted value type for handle ${handle}: ${typeof value}`,
      );
    }
  }
  return clearValues;
}

// ---------------------------------------------------------------------------
// Worker implementation (mirrors @zama-fhe/sdk/dist/relayer-sdk.worker.js)
// ---------------------------------------------------------------------------

var sdkInstance = null;
var sdkGlobal = null;
var relayerUrlBase = "";
var csrfTokenBase = "";
var CSRF_HEADER_NAME = "x-csrf-token";
var MUTATING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

function sendSuccess(id, type, data, transfer) {
  const response = { id, type, success: true, data };
  return transfer ? self.postMessage(response, transfer) : self.postMessage(response);
}

function sendError(id, type, error, statusCode) {
  const response = { id, type, success: false, error };
  if (statusCode !== void 0) {
    response.statusCode = statusCode;
  }
  self.postMessage(response);
}

var originalFetch = fetch;
var ALLOWED_CDN_HOSTS = new Set(["cdn.zama.org"]);

function validateCdnUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Invalid CDN URL");
  }
  if (url.protocol !== "https:") {
    throw new Error("CDN URL must use https");
  }
  if (!ALLOWED_CDN_HOSTS.has(url.hostname)) {
    throw new Error(`CDN URL host is not allowed: ${url.hostname}`);
  }
  return url.toString();
}

function setupFetchInterceptor() {
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method?.toUpperCase() ?? "GET";
    if (relayerUrlBase && url.startsWith(relayerUrlBase)) {
      const headers = new Headers(init?.headers);
      if (MUTATING_METHODS.has(method) && csrfTokenBase) {
        headers.set(CSRF_HEADER_NAME, csrfTokenBase);
      }
      return originalFetch(input, { ...init, headers, credentials: "include" });
    }
    return originalFetch(input, init);
  };
}

function isBrowserExtension() {
  try {
    const g = globalThis;
    for (const ns of [g.chrome, g.browser]) {
      assertObject(ns, "ns");
      assertObject(ns.runtime, "runtime");
      assertString(ns.runtime.id, "id");
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function verifyIntegrity(content, expectedHash) {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-384", encoder.encode(content));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (hashHex !== expectedHash) {
    throw new Error(`CDN integrity check failed: expected SHA-384 ${expectedHash}, got ${hashHex}`);
  }
}

async function fetchScript(cdnUrl) {
  const response = await originalFetch(cdnUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch SDK: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function loadSdkScript(cdnUrl, integrity) {
  if (isBrowserExtension()) {
    if (integrity) {
      await verifyIntegrity(await fetchScript(cdnUrl), integrity);
    }
    return self.importScripts(cdnUrl);
  }
  const scriptContent = await fetchScript(cdnUrl);
  if (integrity) {
    await verifyIntegrity(scriptContent, integrity);
  }
  const blob = new Blob([scriptContent], { type: "application/javascript" });
  const blobUrl = URL.createObjectURL(blob);
  try {
    self.importScripts(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

async function handleInit(request) {
  const { id, type, payload } = request;
  const { cdnUrl, fhevmConfig, csrfToken, integrity } = payload;
  try {
    validateCdnUrl(cdnUrl);
    relayerUrlBase = fhevmConfig.relayerUrl ?? "";
    csrfTokenBase = csrfToken;
    setupFetchInterceptor();
    await loadSdkScript(cdnUrl, integrity);
    if (!self.relayerSDK) {
      throw new Error("Failed to load relayerSDK from CDN");
    }
    sdkGlobal = self.relayerSDK;
    await sdkGlobal.initSDK();
    const config = { ...fhevmConfig, batchRpcCalls: false };
    sdkInstance = await sdkGlobal.createInstance(config);
    sendSuccess(id, type, { initialized: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] Init error:", message);
    sendError(id, type, message);
  }
}

async function handleEncrypt(request) {
  const { id, type, payload } = request;
  const { values, contractAddress, userAddress } = payload;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const input = sdkInstance.createEncryptedInput(contractAddress, userAddress);
    for (const value of values) {
      input.add64(value);
    }
    const encrypted = await input.encrypt();
    const response = { handles: encrypted.handles, inputProof: encrypted.inputProof };
    const transferList = [encrypted.inputProof.buffer, ...encrypted.handles.map((h) => h.buffer)];
    sendSuccess(id, type, response, transferList);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] Encrypt error:", message);
    sendError(id, type, message);
  }
}

function extractHttpStatus(error) {
  if (error == null || typeof error !== "object") return void 0;
  const e = error;
  if (typeof e.statusCode === "number") return e.statusCode;
  if (typeof e.status === "number") return e.status;
  if (e.cause != null && typeof e.cause === "object") {
    const cause = e.cause;
    if (typeof cause.statusCode === "number") return cause.statusCode;
    if (typeof cause.status === "number") return cause.status;
  }
  return void 0;
}

async function handleUserDecrypt(request) {
  const { id, type, payload } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const handleContractPairs = payload.handles.map((handle) => ({
      handle,
      contractAddress: payload.contractAddress,
    }));
    const result = await sdkInstance.userDecrypt(
      handleContractPairs,
      payload.privateKey,
      payload.publicKey,
      payload.signature,
      payload.signedContractAddresses,
      payload.signerAddress,
      payload.startTimestamp,
      payload.durationDays,
    );
    sendSuccess(id, type, { clearValues: convertToBigIntRecord(result) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = extractHttpStatus(error);
    console.error("[Worker] UserDecrypt error:", message);
    sendError(id, type, message, statusCode);
  }
}

async function handlePublicDecrypt(request) {
  const { id, type, payload } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const result = await sdkInstance.publicDecrypt(payload.handles);
    sendSuccess(id, type, {
      clearValues: convertToBigIntRecord(result.clearValues),
      abiEncodedClearValues: result.abiEncodedClearValues,
      decryptionProof: result.decryptionProof,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] PublicDecrypt error:", message);
    sendError(id, type, message);
  }
}

function handleGenerateKeypair(request) {
  const { id, type } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const keypair = sdkInstance.generateKeypair();
    sendSuccess(id, type, { publicKey: keypair.publicKey, privateKey: keypair.privateKey });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] GenerateKeypair error:", message);
    sendError(id, type, message);
  }
}

function handleCreateEIP712(request) {
  const { id, type, payload } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const eip712 = sdkInstance.createEIP712(
      payload.publicKey,
      payload.contractAddresses,
      payload.startTimestamp,
      payload.durationDays,
    );
    sendSuccess(id, type, {
      domain: {
        name: eip712.domain.name,
        version: eip712.domain.version,
        chainId: Number(eip712.domain.chainId),
        verifyingContract: eip712.domain.verifyingContract,
      },
      types: {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification.map(
          (field) => ({ name: field.name, type: field.type }),
        ),
      },
      message: {
        publicKey: eip712.message.publicKey,
        contractAddresses: [...eip712.message.contractAddresses],
        startTimestamp: BigInt(eip712.message.startTimestamp),
        durationDays: BigInt(eip712.message.durationDays),
        extraData: eip712.message.extraData,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] CreateEIP712 error:", message);
    sendError(id, type, message);
  }
}

function handleCreateDelegatedEIP712(request) {
  const { id, type, payload } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const result = sdkInstance.createDelegatedUserDecryptEIP712(
      payload.publicKey,
      payload.contractAddresses,
      payload.delegatorAddress,
      payload.startTimestamp,
      payload.durationDays,
    );
    sendSuccess(id, type, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] CreateDelegatedEIP712 error:", message);
    sendError(id, type, message);
  }
}

async function handleDelegatedUserDecrypt(request) {
  const { id, type, payload } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const handleContractPairs = payload.handles.map((handle) => ({
      handle,
      contractAddress: payload.contractAddress,
    }));
    const result = await sdkInstance.delegatedUserDecrypt(
      handleContractPairs,
      payload.privateKey,
      payload.publicKey,
      payload.signature,
      payload.signedContractAddresses,
      payload.delegatorAddress,
      payload.delegateAddress,
      payload.startTimestamp,
      payload.durationDays,
    );
    sendSuccess(id, type, { clearValues: convertToBigIntRecord(result) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] DelegatedUserDecrypt error:", message);
    sendError(id, type, message);
  }
}

async function handleRequestZKProofVerification(request) {
  const { id, type, payload } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const result = await sdkInstance.requestZKProofVerification(payload.zkProof);
    const transferList = [result.inputProof.buffer, ...result.handles.map((h) => h.buffer)];
    sendSuccess(id, type, result, transferList);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] RequestZKProofVerification error:", message);
    sendError(id, type, message);
  }
}

function handleGetPublicKey(request) {
  const { id, type } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const result = sdkInstance.getPublicKey();
    sendSuccess(id, type, { result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] GetPublicKey error:", message);
    sendError(id, type, message);
  }
}

function handleGetPublicParams(request) {
  const { id, type, payload } = request;
  try {
    if (!sdkInstance) throw new Error("SDK not initialized. Call INIT first.");
    const result = sdkInstance.getPublicParams(payload.bits);
    sendSuccess(id, type, { result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Worker] GetPublicParams error:", message);
    sendError(id, type, message);
  }
}

function handleUpdateCsrf(request) {
  const { id, type, payload } = request;
  csrfTokenBase = payload.csrfToken;
  sendSuccess(id, type, { updated: true });
}

self.onmessage = async (event) => {
  const request = event.data;
  try {
    switch (request.type) {
      case "INIT":
        await handleInit(request);
        break;
      case "UPDATE_CSRF":
        handleUpdateCsrf(request);
        break;
      case "ENCRYPT":
        await handleEncrypt(request);
        break;
      case "USER_DECRYPT":
        await handleUserDecrypt(request);
        break;
      case "PUBLIC_DECRYPT":
        await handlePublicDecrypt(request);
        break;
      case "GENERATE_KEYPAIR":
        handleGenerateKeypair(request);
        break;
      case "CREATE_EIP712":
        handleCreateEIP712(request);
        break;
      case "CREATE_DELEGATED_EIP712":
        handleCreateDelegatedEIP712(request);
        break;
      case "DELEGATED_USER_DECRYPT":
        await handleDelegatedUserDecrypt(request);
        break;
      case "REQUEST_ZK_PROOF_VERIFICATION":
        await handleRequestZKProofVerification(request);
        break;
      case "GET_PUBLIC_KEY":
        handleGetPublicKey(request);
        break;
      case "GET_PUBLIC_PARAMS":
        handleGetPublicParams(request);
        break;
      default:
        console.error("[Worker] Unknown request type:", request.type);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    sendError(request?.id ?? "unknown", request?.type ?? "UNKNOWN", message);
  }
};
