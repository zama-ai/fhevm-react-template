// Browser-safe wasmBaseUrl — always uses import.meta.url (ESM path).
// This replaces the SDK's wasmBaseUrl.js which tries require("node:url")
// in CJS mode, which doesn't work in webpack browser bundles.
export const wasmBaseUrl = import.meta.url;
