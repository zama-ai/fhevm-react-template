import dotenv from 'dotenv'
import { ethers } from 'ethers'

dotenv.config()

/**
 * FHEVM Node.js Example
 * 
 * Shows how to use the FHEVM SDK in a backend/CLI context
 * Useful for:
 * - Batch processing
 * - Server-side encryption
 * - CI/CD pipelines
 * - Data preparation workflows
 */

async function main() {
  console.log('🚀 FHEVM Node.js Backend Example\n')

  try {
    // Step 1: Check environment
    console.log('📋 Environment Setup:')
    console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
    console.log(`  - Platform: ${process.platform}`)
    console.log(`  - Node.js: ${process.version}\n`)

    // Step 2: Example data
    const bidValues = [1500, 2300, 3100, 4200, 5000]
    console.log('📊 Example Bid Values:')
    bidValues.forEach((bid, i) => console.log(`  ${i + 1}. $${bid}`))
    console.log('')

    // Step 3: Simulated encryption (without WASM in Node)
    console.log('🔐 Encryption Simulation (Without Browser Context):')
    console.log('  ⚠️  Note: Full FHEVM encryption requires browser/WASM context')
    console.log('  ℹ️  Node.js use case: Data preparation, key management, etc.\n')

    // Step 4: Data processing example
    console.log('📝 Data Processing Example:')
    const processedBids = bidValues.map(bid => ({
      original: bid,
      scaled: bid * 100,
      hash: hashValue(bid),
      timestamp: new Date().toISOString()
    }))

    processedBids.forEach(bid => {
      console.log(`  Bid: $${bid.original} → Hash: ${bid.hash}`)
    })
    console.log('')

    // Step 5: Contract preparation
    console.log('📋 Contract Interaction Setup:')
    const contractAddress = '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1'
    const chainId = 11155111 // Sepolia
    console.log(`  Contract: ${contractAddress}`)
    console.log(`  Chain ID: ${chainId}`)
    console.log(`  Network: Sepolia Testnet\n`)

    // Step 6: Best practices
    console.log('✅ Node.js FHEVM Best Practices:')
    console.log('  1. Use for batch data preparation')
    console.log('  2. Store encryption keys securely (env vars)')
    console.log('  3. Prepare data for browser submission')
    console.log('  4. Monitor and log encryption metrics')
    console.log('  5. Implement error handling and retries\n')

    console.log('🎯 Next: Run batch-encrypt.ts for advanced scenarios')
    console.log('📚 Docs: See README.md for more information')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

function hashValue(value: number): string {
  // Simple hash for demonstration
  return '0x' + value.toString(16).padStart(64, '0')
}

main()
