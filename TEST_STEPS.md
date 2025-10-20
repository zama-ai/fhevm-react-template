# FHEVM Bid Encryption Testing Steps

## 1. Open Browser Console
- Press F12 to open Developer Tools
- Click on the Console tab

## 2. Check SDK
```javascript
console.log('[TEST] window.relayerSDK:', typeof window.relayerSDK);
```
Expected output: `object`

## 3. Initialize SDK
```javascript
await window.relayerSDK.initSDK();
```
Expected output: `undefined` (success if no error)

## 4. Get Config
```javascript
const config = window.relayerSDK.SepoliaConfig;
console.log('Config relayerUrl:', config.relayerUrl);
console.log('Config contract:', config.verifyingContractAddressDecryption);
```

## 5. Create Instance
```javascript
const instance = await window.relayerSDK.createInstance(config);
console.log('Instance keys:', Object.keys(instance));
```

## 6. Get User Address
```javascript
const accounts = await window.ethereum.request({ method: 'eth_accounts' });
const userAddress = accounts[0];
console.log('User address:', userAddress);
```

## 7. Create Encrypted Input
```javascript
const encryptedInput = instance.createEncryptedInput(
  config.verifyingContractAddressDecryption,
  userAddress
);
console.log('Encrypted input created');
```

## 8. Add Bid Value and Encrypt
```javascript
const encrypted = await encryptedInput.add256(BigInt(555)).encrypt();
console.log('Encrypted bid:', encrypted);
console.log('Handles:', encrypted.handles);
console.log('InputProof length:', encrypted.inputProof.length);
```

## Expected Results
- `handles`: Array with one or more elements
- `inputProof`: 100-byte Uint8Array
- If no errors, encryption is successful!

## 9. Test from UI
1. Click "Join Auction" button
2. Enter a bid amount (e.g., 555)
3. Click "Submit My Encrypted Bid" button
4. Monitor the console for debug messages

Common errors:
- ❌ "submitEncryptedBid is not a function" → Contract ABI issue
- ❌ "publicKey must be a Uint8Array" → SDK not initialized
- ❌ "createEncryptedInput is not a function" → Wrong SDK version
