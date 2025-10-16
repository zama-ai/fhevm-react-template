// Universal FHEVM contract interaction utility
// Framework-agnostic
import { ethers } from 'ethers';

export async function submitEncryptedBid({
  contractAddress,
  abi,
  encryptedBid,
  entryFee,
  signer
}: {
  contractAddress: string;
  abi: any;
  encryptedBid: any; // Can be string or {handles, inputProof} object
  entryFee: number;
  signer: ethers.Signer;
}) {
  const contract = new ethers.Contract(contractAddress, abi, signer);
  
  // Handle both string and object formats
  let bidDataBytes: string;
  if (typeof encryptedBid === 'object' && encryptedBid.handles && encryptedBid.inputProof) {
    // Convert {handles, inputProof} object to bytes for contract
    // InputProof is Uint8Array - convert to hex
    const inputProofHex = Array.from(encryptedBid.inputProof as Uint8Array)
      .map((b: number) => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Handles array - each handle is typically Uint8Array, hex string or BigInt
    // We'll encode them as packed hex data
    const handlesArray = (encryptedBid.handles as any[]).map((h: any) => {
      if (h instanceof Uint8Array) {
        // Convert Uint8Array to hex
        return Array.from(h)
          .map((b: number) => b.toString(16).padStart(2, '0'))
          .join('');
      }
      if (typeof h === 'string') {
        // Remove 0x prefix if exists
        return h.startsWith('0x') ? h.slice(2) : h;
      }
      // Assume it's a BigInt
      return BigInt(h).toString(16).padStart(64, '0');
    });
    
    // Create final bytes: combine handles + inputProof as packed hex
    // Format: 0x + allHandlesHex + inputProofHex
    const allHandlesHex = handlesArray.join('');
    const finalBytes = '0x' + allHandlesHex + inputProofHex;
    
    bidDataBytes = finalBytes;
  } else {
    // Already a string (hex format)
    bidDataBytes = typeof encryptedBid === 'string' ? encryptedBid : '0x';
  }
  
  console.log('[CONTRACT] Submitting encrypted bid, bytes length:', bidDataBytes.length);
  
  // FHEVM-compatible contract: submitEncryptedBid(encrypted data as bytes)
  const tx = await contract.submitEncryptedBid(bidDataBytes);
  await tx.wait();
  return tx.hash;
}

// Usage:
// await submitEncryptedBid({ contractAddress, abi, encryptedBid, entryFee, signer });
