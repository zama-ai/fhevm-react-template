# 🔍 FHEVM Block Explorer

A comprehensive local blockchain explorer integrated into your FHEVM React template, providing real-time monitoring of your Hardhat development network.

## ✨ Features

### 📦 Live Blocks
- **Real-time block monitoring** with automatic refresh
- **Block details** including hash, timestamp, gas usage, and miner information
- **Transaction overview** for each block with function call decoding
- **Interactive block selection** for detailed inspection

### 💸 Transaction Viewer
- **Comprehensive transaction list** with search and filtering capabilities
- **Function call decoding** using deployed contract ABIs
- **Transaction status tracking** (Success/Failed/Pending)
- **Gas usage analysis** and efficiency metrics
- **Advanced filtering** by status, function, or address

### 👤 Address Analyzer
- **Address inspection** with balance and transaction count
- **Contract detection** (EOA vs Contract addresses)
- **Code inspection** for contract addresses
- **Quick actions** for copying addresses and viewing on external explorers
- **Sample address analysis** for testing

### 📋 Contract Inspector
- **Deployed contract overview** from your project's contract data
- **ABI inspection** with function and event listings
- **Contract interaction** capabilities for view functions
- **Function call interface** for testing contract methods
- **Event monitoring** and contract verification tools

## 🚀 Getting Started

### Prerequisites
- Local Hardhat node running (`pnpm chain`)
- Wallet connected to the application
- Deployed contracts (for contract inspection features)

### Usage

1. **Start your local node:**
   ```bash
   pnpm chain
   ```

2. **Deploy contracts:**
   ```bash
   pnpm deploy:localhost
   ```

3. **Start the frontend:**
   ```bash
   pnpm start
   ```

4. **Navigate to the explorer:**
   - Click "🔍 Explorer" in the navigation menu
   - Or visit `http://localhost:3000/explorer`

## 🔧 Technical Details

### Architecture
- **React + Next.js** for the frontend framework
- **Wagmi + Viem** for blockchain interaction
- **DaisyUI + Tailwind CSS** for styling
- **Real-time updates** using Wagmi's polling capabilities

### Key Components

#### BlockExplorer (`BlockExplorer.tsx`)
Main orchestrator component that manages:
- Tab navigation between different explorer views
- State management for selected blocks and transactions
- Real-time block number monitoring
- Network status display

#### LiveBlocks (`LiveBlocks.tsx`)
- Fetches and displays recent blocks
- Shows transaction summaries with function decoding
- Provides block selection for detailed views
- Auto-refreshes when new blocks arrive

#### TransactionViewer (`TransactionViewer.tsx`)
- Comprehensive transaction listing and filtering
- Function call decoding using contract ABIs
- Transaction receipt fetching and status display
- Search capabilities across multiple fields

#### AddressAnalyzer (`AddressAnalyzer.tsx`)
- Address validation and analysis
- Balance and transaction count fetching
- Contract code inspection
- Quick action buttons for common operations

#### ContractInspector (`ContractInspector.tsx`)
- Integration with deployed contracts from `deployedContracts.ts`
- ABI parsing and function/event display
- Contract interaction interface
- Contract verification tools

#### BlockDetails (`BlockDetails.tsx`)
- Detailed block information modal
- Complete transaction list with receipts
- Gas usage analysis
- Raw block data display

#### TransactionDetails (`TransactionDetails.tsx`)
- Comprehensive transaction information
- Function call details with decoded arguments
- Transaction receipt analysis
- Event log inspection

### Data Flow
1. **Block Monitoring**: `useBlockNumber` hook provides real-time block updates
2. **Data Fetching**: Public client fetches block and transaction data
3. **Decoding**: Transaction data is decoded using deployed contract ABIs
4. **State Management**: React state manages UI interactions and selections
5. **Real-time Updates**: Automatic refresh when new blocks are mined

## 🎯 Use Cases

### Development
- **Debug transactions** by inspecting function calls and arguments
- **Monitor contract interactions** in real-time
- **Analyze gas usage** for optimization
- **Track deployment status** of contracts

### Testing
- **Verify transaction execution** and status
- **Inspect contract state** changes
- **Monitor event emissions** from contracts
- **Debug failed transactions** with detailed error information

### Learning
- **Understand blockchain mechanics** through visual exploration
- **Learn about transaction structure** and gas mechanics
- **Explore contract interactions** and function calls
- **Study real-world blockchain data** in a controlled environment

## 🔍 Advanced Features

### Transaction Decoding
The explorer automatically decodes function calls using your deployed contract ABIs:
- **Function name** extraction from transaction input data
- **Argument decoding** with proper type conversion
- **Parameter names** from ABI definitions
- **Fallback handling** for unknown functions

### Real-time Updates
- **Automatic block refresh** when new blocks are mined
- **Live transaction status** updates
- **Real-time gas price** monitoring
- **Dynamic network status** display

### Search and Filtering
- **Multi-field search** across transaction hashes, functions, and addresses
- **Status filtering** (Success/Failed/Pending)
- **Function-based filtering** for specific contract interactions
- **Address-based filtering** for transaction history

## 🛠️ Customization

### Adding New Features
The modular architecture makes it easy to extend:

1. **Create new components** in `_components/` directory
2. **Add new tabs** to the `BlockExplorer` component
3. **Implement custom hooks** for specific blockchain interactions
4. **Extend the UI** with additional information displays

### Styling
- Uses **DaisyUI components** for consistent styling
- **Tailwind CSS** for custom styling needs
- **Responsive design** for mobile and desktop
- **Dark/light theme** support through DaisyUI

### Integration
- **Seamless integration** with existing FHEVM functionality
- **Contract ABI integration** from deployed contracts
- **Wallet connection** through RainbowKit
- **Network switching** support for multiple chains

## 📊 Performance Considerations

- **Efficient data fetching** with Promise.all for parallel requests
- **Optimized re-renders** using React hooks and state management
- **Lazy loading** of transaction receipts
- **Debounced search** to prevent excessive API calls
- **Pagination** for large transaction lists (future enhancement)

## 🔮 Future Enhancements

- **Event monitoring** with real-time event streams
- **Contract verification** integration
- **Advanced analytics** and charts
- **Export functionality** for transaction data
- **Multi-chain support** for different networks
- **Custom ABI upload** for external contracts
- **Transaction simulation** before execution
- **Gas estimation** tools

## 🐛 Troubleshooting

### Common Issues

1. **No blocks showing**: Ensure your Hardhat node is running
2. **Transaction decoding fails**: Check that contracts are deployed and ABIs are available
3. **Slow loading**: Reduce the number of blocks fetched or increase polling interval
4. **Wallet not connected**: Connect your wallet through the header button

### Debug Mode
Enable debug logging by opening browser dev tools and checking the console for detailed information about:
- Block fetching status
- Transaction decoding results
- Error messages and stack traces
- Network connection status

---

This block explorer provides a powerful tool for understanding and debugging your FHEVM applications, making blockchain development more accessible and transparent.
