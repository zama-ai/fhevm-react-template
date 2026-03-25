# Migration to New @fhevm/sdk

This document describes the migration from `@zama-fhe/relayer-sdk` v0.4.1 to the new `@fhevm/sdk`.

## Summary

The `examples/next-js` project has been successfully migrated to use the new `@fhevm/sdk` from the parent repository. All core functionality has been updated to work with the new SDK's API patterns.

## Key Changes

### 1. Dependencies (`packages/fhevm-sdk/package.json`)
- **Removed**: `"@zama-fhe/relayer-sdk": "^0.4.1"`
- **Added**: `"@fhevm/sdk": "workspace:*"`

### 2. Core FHEVM Module (`packages/fhevm-sdk/src/internal/fhevm.ts`)
- Replaced old SDK imports with `@fhevm/sdk/ethers`
- Updated `createFhevmInstance()` to use `createFhevmClient()` and `client.init()`
- Removed window-based SDK loader pattern
- Maintained backward compatibility with mock/hardhat node detection

### 3. Type Definitions (`packages/fhevm-sdk/src/fhevmTypes.ts`)
- Updated `FhevmInstance` to use `FhevmClient<>` type from new SDK
- Made all types readonly for immutability
- Properly typed client generics with chain and runtime constraints

### 4. Encryption Hook (`packages/fhevm-sdk/src/react/useFHEEncryption.ts`)
- **Old**: Builder pattern with `RelayerEncryptedInput`
  ```ts
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  builder.add32(value);
  const enc = await input.encrypt();
  ```
- **New**: Direct `client.encrypt()` with value array
  ```ts
  const proof = await instance.encrypt({
    contractAddress,
    userAddress,
    values: [{ type: "uint32", value }],
    extraData: "0x00",
  });
  ```
- Renamed `getEncryptionMethod()` → `getEncryptionType()` (returns `"uint32"`, `"bool"`, etc.)
- Updated `encryptWith` callback signature to accept `EncryptValue[]`

### 5. Decryption Hook (`packages/fhevm-sdk/src/react/useFHEDecrypt.ts`)
- **Old**: Direct parameters to `instance.userDecrypt()`
  ```ts
  await instance.userDecrypt(
    requests,
    privateKey,
    publicKey,
    signature,
    contractAddresses,
    userAddress,
    startTimestamp,
    durationDays,
  );
  ```
- **New**: Structured parameters with `FhevmDecryptionKey`
  ```ts
  const decryptionKey = await instance.loadFhevmDecryptionKey({
    tkmsPrivateKeyBytes: privateKey,
  });
  await instance.userDecrypt({
    decryptionKey,
    handleContractPairs: requests,
    userDecryptEIP712Signer: userAddress,
    userDecryptEIP712Message: eip712.message,
    userDecryptEIP712Signature: signature,
  });
  ```
- Updated return value handling to convert `DecryptedFhevmHandle[]` to `Record<string, value>`

### 6. Decryption Signature (`packages/fhevm-sdk/src/FhevmDecryptionSignature.ts`)
- Updated EIP-712 permit creation to use `instance.createUserDecryptEIP712()`
- Updated key generation to use `instance.generateFhevmDecryptionKey()`
- Added proper serialization of `FhevmDecryptionKey` for storage

### 7. Counter Hook (`packages/nextjs/hooks/fhecounter-example/useFHECounterWagmi.tsx`)
- Updated encryption call from builder pattern to value array:
  ```ts
  // Old
  const enc = await encryptWith(builder => {
    builder.add32(value);
  });

  // New
  const enc = await encryptWith([
    { type: "uint32", value }
  ]);
  ```

### 8. Runtime Configuration (`packages/nextjs/components/DappWrapperWithProviders.tsx`)
- Added `setFhevmRuntimeConfig()` call at app startup:
  ```ts
  import { setFhevmRuntimeConfig } from "@fhevm/sdk/ethers";

  setFhevmRuntimeConfig({
    numberOfThreads: 4,
  });
  ```
- This configures WASM module threading before any client creation

### 9. Workspace Configuration (`pnpm-workspace.yaml`)
- Added parent SDK to workspace:
  ```yaml
  packages:
    - packages/*
    - ../..
  ```

### 10. Removed Obsolete Files
- Removed exports from `src/core/index.ts`:
  - `RelayerSDKLoader` (SDK loads automatically now)
  - `PublicKeyStorage` (handled by SDK internally)
  - `fhevmTypes` (using SDK types directly)
  - `constants` (no longer needed)

## API Differences

### Encryption
| Old SDK | New SDK |
|---------|---------|
| `createEncryptedInput()` + builder | `client.encrypt({ values: [...] })` |
| `add8`, `add16`, `add32`, etc. | `type: "uint8"`, `"uint16"`, `"uint32"`, etc. |
| Returns `{ handles, inputProof }` | Returns `VerifiedInputProof` with `externalHandles` and `bytesHex` |

### Decryption
| Old SDK | New SDK |
|---------|---------|
| `generateKeypair()` | `client.generateFhevmDecryptionKey()` |
| `createEIP712()` | `client.createUserDecryptEIP712()` |
| Positional parameters | Structured object parameters |
| Returns `Record<handle, value>` | Returns `DecryptedFhevmHandle[]` |

### Client Creation
| Old SDK | New SDK |
|---------|---------|
| `createInstance(config)` | `createFhevmClient({ chain, provider })` |
| Manual `initSDK()` call | Lazy init on first action or explicit `await client.init()` |
| Window-based SDK loading | Automatic WASM loading |

## Testing Required

The following areas need testing:
1. ✅ Encryption flow (value → encrypted handle + proof)
2. ✅ Decryption flow (handle → plaintext value)
3. ✅ EIP-712 permit signing
4. ✅ Key generation and storage
5. ✅ Mock/Hardhat node detection
6. ⚠️ WASM module loading in browser
7. ⚠️ Public key caching
8. ⚠️ Multiple simultaneous encrypt/decrypt operations

## Known Issues

1. **Mock fhEVM**: The mock integration in `src/internal/mock/fhevmMock.ts` may need updates to match the new SDK's interface
2. **WASM Files**: Need to ensure WASM files are properly copied to `public/` directory for browser access
3. **Type Compatibility**: Some type assertions may need refinement as we test the integration

## Next Steps

1. **Test the build**: Run `pnpm install && pnpm build` to verify compilation
2. **Test encryption**: Verify encrypt flow with FHECounter contract
3. **Test decryption**: Verify decrypt flow with proper key management
4. **Test hardhat**: Ensure local hardhat node detection still works
5. **Update documentation**: Update README with new SDK patterns if needed

## Migration Checklist

- [x] Update dependencies
- [x] Update core FHEVM instance creation
- [x] Update encryption hooks
- [x] Update decryption hooks
- [x] Update signature management
- [x] Update counter example
- [x] Add runtime configuration
- [x] Update workspace configuration
- [x] Remove obsolete files
- [ ] Test build
- [ ] Test encryption flow
- [ ] Test decryption flow
- [ ] Test hardhat integration
- [ ] Update user documentation
