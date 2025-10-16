import dotenv from 'dotenv'
import { ethers } from 'ethers'

dotenv.config()

/**
 * Batch Encryption Example
 * 
 * Process multiple bids in a batch scenario
 * Useful for:
 * - Auction preprocessing
 * - Data pipeline workflows
 * - Testing and validation
 */

interface BidData {
  userId: string
  bidAmount: number
  timestamp: string
}

interface ProcessedBid {
  userId: string
  originalAmount: number
  checksum: string
  status: 'pending' | 'processing' | 'ready'
}

async function main() {
  console.log('📦 Batch Encryption Workflow\n')

  try {
    // Step 1: Generate test data
    const bids: BidData[] = generateTestBids(10)
    console.log(`✅ Generated ${bids.length} test bids\n`)

    // Step 2: Validate
    console.log('🔍 Validation:')
    const validBids = validateBids(bids)
    console.log(`✅ ${validBids.length}/${bids.length} bids valid\n`)

    // Step 3: Process
    console.log('⚙️  Processing:')
    const processed = processBids(validBids)
    console.log(`✅ ${processed.length} bids processed\n`)

    // Step 4: Output
    console.log('📊 Results:')
    console.log('┌─────────┬──────────┬─────────────────────────────────────────────────┬──────────┐')
    console.log('│ User ID │ Amount   │ Checksum                                        │ Status   │')
    console.log('├─────────┼──────────┼─────────────────────────────────────────────────┼──────────┤')
    processed.forEach(bid => {
      const userId = bid.userId.substring(0, 7) + '...'
      console.log(
        `│ ${userId.padEnd(7)} │ $${bid.originalAmount.toString().padEnd(7)} │ ${bid.checksum} │ ${bid.status.padEnd(8)} │`
      )
    })
    console.log('└─────────┴──────────┴─────────────────────────────────────────────────┴──────────┘\n')

    // Step 5: Summary
    console.log('📈 Summary:')
    console.log(`  Total Bids: ${processed.length}`)
    console.log(`  Total Value: $${processed.reduce((sum, b) => sum + b.originalAmount, 0)}`)
    console.log(`  Average Bid: $${Math.round(processed.reduce((sum, b) => sum + b.originalAmount, 0) / processed.length)}`)
    console.log(`  Ready for Submission: ✅\n`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

function generateTestBids(count: number): BidData[] {
  const bids: BidData[] = []
  for (let i = 0; i < count; i++) {
    bids.push({
      userId: '0x' + Math.random().toString(16).slice(2, 42),
      bidAmount: Math.floor(Math.random() * 5000) + 1000,
      timestamp: new Date().toISOString()
    })
  }
  return bids
}

function validateBids(bids: BidData[]): BidData[] {
  return bids.filter(bid => {
    const isValid = bid.bidAmount >= 100 && bid.bidAmount <= 10000 && bid.userId.startsWith('0x')
    return isValid
  })
}

function processBids(bids: BidData[]): ProcessedBid[] {
  return bids.map(bid => ({
    userId: bid.userId,
    originalAmount: bid.bidAmount,
    checksum: generateChecksum(bid),
    status: 'ready'
  }))
}

function generateChecksum(bid: BidData): string {
  const data = JSON.stringify(bid)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return '0x' + Math.abs(hash).toString(16).padStart(40, '0')
}

main()
