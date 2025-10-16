// Universal FHEVM winner read utility
// Framework-agnostic
import { ethers } from 'ethers';

export async function readEncryptedWinner({
  contractAddress,
  abi,
  signer
}: {
  contractAddress: string;
  abi: any;
  signer: ethers.Signer;
}) {
  const contract = new ethers.Contract(contractAddress, abi, signer);
  // FHEVM-compatible contract: getWinner() returns encrypted winner data
  const encryptedWinner = await contract.getWinner();
  return encryptedWinner;
}

// Usage:
// const encryptedWinner = await readEncryptedWinner({ contractAddress, abi, signer });
