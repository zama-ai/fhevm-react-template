// Test script to verify bid encryption flow
// Run in browser console

console.log('[TEST] Başlamak üzere...');
console.log('[TEST] window.relayerSDK:', typeof window.relayerSDK);

async function testBidFlow() {
  try {
    const relayerSDK = window.relayerSDK;
    if (!relayerSDK) throw new Error('SDK bulunamadi!');
    
    console.log('[TEST] ✅ SDK bulundu');
    
    // Init
    await relayerSDK.initSDK();
    console.log('[TEST] ✅ SDK initialized');
    
    // Get config
    const config = relayerSDK.SepoliaConfig;
    console.log('[TEST] ✅ Config alındı:', {
      relayerUrl: config.relayerUrl,
      verifyingContractAddressDecryption: config.verifyingContractAddressDecryption
    });
    
    // Create instance
    const instance = await relayerSDK.createInstance(config);
    console.log('[TEST] ✅ Instance created');
    
    // Get user address
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const userAddress = accounts[0];
    console.log('[TEST] ✅ User address:', userAddress);
    
    // Create encrypted input
    const encryptedInput = instance.createEncryptedInput(
      config.verifyingContractAddressDecryption,
      userAddress
    );
    console.log('[TEST] ✅ Encrypted input created');
    
    // Add bid value (test with 555)
    const bidValue = 555;
    const inputWithBid = encryptedInput.add256(BigInt(bidValue));
    console.log('[TEST] ✅ Bid value added:', bidValue);
    
    // Encrypt
    const encrypted = await inputWithBid.encrypt();
    console.log('[TEST] ✅ Bid encrypted!');
    console.log('[TEST] Encrypted output:', {
      handles: encrypted.handles,
      inputProof: encrypted.inputProof,
      handlesLength: encrypted.handles.length,
      inputProofLength: encrypted.inputProof.length
    });
    
    return encrypted;
  } catch (err) {
    console.error('[TEST] ❌ Hata:', err);
    throw err;
  }
}

// Çalıştır
testBidFlow().then(result => {
  console.log('[TEST] ✅ Tüm testler başarılı!');
  window.lastEncryptedBid = result;
  console.log('[TEST] Sonuç window.lastEncryptedBid içinde saklandı');
}).catch(err => {
  console.error('[TEST] ❌ Test başarısız:', err);
});
