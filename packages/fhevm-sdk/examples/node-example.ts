import { ethers } from 'ethers';
import { createFHEVMNode, createProviderAndSigner, createSepoliaConfig } from '../src';

/**
 * Example Node.js usage of FHEVM SDK
 */
async function nodeExample() {
  try {
    // Create FHEVM Node instance
    const fhevmNode = createFHEVMNode();

    // Create provider and signer
    const { provider, signer } = createProviderAndSigner(
      'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      'YOUR_PRIVATE_KEY'
    );

    // Initialize FHEVM
    await fhevmNode.initialize(createSepoliaConfig(), provider, signer);

    console.log('FHEVM initialized successfully');

    // Encrypt values
    const contractAddress = '0x1234567890123456789012345678901234567890';
    const values = [42, 100, true];

    console.log('Encrypting values:', values);
    const encryptedResult = await fhevmNode.encrypt(contractAddress, values);
    console.log('Encrypted result:', encryptedResult);

    // Decrypt handles
    console.log('Decrypting handles...');
    const decryptedResult = await fhevmNode.decrypt(
      encryptedResult.handles,
      contractAddress
    );
    console.log('Decrypted result:', decryptedResult);

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example with custom storage
 */
async function nodeExampleWithStorage() {
  // Custom storage implementation
  const customStorage = {
    get: async (key: string) => {
      // Implement your storage logic here
      console.log(`Getting ${key}`);
      return null;
    },
    set: async (key: string, value: string) => {
      // Implement your storage logic here
      console.log(`Setting ${key}: ${value}`);
    },
    remove: async (key: string) => {
      // Implement your storage logic here
      console.log(`Removing ${key}`);
    },
  };

  const fhevmNode = createFHEVMNode(customStorage);
  
  // ... rest of the implementation
}

// Run example
if (require.main === module) {
  nodeExample();
}
