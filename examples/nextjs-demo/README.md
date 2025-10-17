# Cloak SDK Next.js Demo

A comprehensive demonstration of the Cloak SDK showcasing confidential dApps with FHEVM encryption.

## 🚀 Features

- **Confidential Counter**: Encrypt and interact with a counter contract
- **Confidential Voting**: Cast private votes on proposals
- **Confidential Banking**: Manage encrypted balances with private transactions
- **Real-time SDK Status**: Monitor SDK initialization and status
- **Wallet Integration**: Connect with RainbowKit and Wagmi

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- A local FHEVM node running on `http://localhost:3000`
- Deployed example contracts (see deployment section)

### Installation

```bash
# Navigate to the demo directory
cd examples/nextjs-demo

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Demo Components

### 1. SDK Status
- Shows real-time SDK initialization status
- Displays network information
- Error handling and debugging

### 2. Confidential Counter
- Encrypt counter values using FHEVM
- Interact with smart contracts privately
- Visual feedback for encryption process

### 3. Confidential Voting
- Cast encrypted votes on proposals
- Generate decryption signatures
- View voting results (when decrypted)

### 4. Confidential Banking
- Deposit encrypted amounts
- Withdraw with privacy
- Transfer between addresses
- Encrypted balance management

## 🔧 Configuration

### Contract Addresses

Update the contract addresses in the component files:

```typescript
// In CounterDemo.tsx
const COUNTER_ADDRESS = '0x...' // Your deployed FHECounter address

// In VotingDemo.tsx  
const VOTING_ADDRESS = '0x...' // Your deployed FHEVoting address

// In BankDemo.tsx
const BANK_ADDRESS = '0x...' // Your deployed FHEBank address
```

### Network Configuration

The demo is configured for local development. To use with testnets:

1. Update `wagmi-config.tsx` with your network configuration
2. Update the `chainId` in `providers.tsx`
3. Deploy contracts to your target network

## 🏗️ Contract Deployment

Deploy the example contracts using the Cloak SDK CLI:

```bash
# From the cloak-sdk root directory
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed contract addresses to the demo components.

## 🎨 Customization

### Styling
The demo uses Tailwind CSS. Customize the appearance by modifying:
- `tailwind.config.js` - Theme configuration
- `globals.css` - Global styles
- Component files - Individual component styles

### Adding New Features
1. Create new components in the `components/` directory
2. Use Cloak SDK hooks for encryption/decryption
3. Add contract interactions as needed
4. Update the main page to include new components

## 🔍 Understanding the Code

### SDK Integration
```typescript
import { useCloakSDK, useCloakEncryption } from '@cloak-sdk/react'

// Initialize SDK
const { sdk, isReady } = useCloakSDK()

// Use encryption
const { encrypt } = useCloakEncryption({
  sdk,
  signer,
  contractAddress: '0x...'
})
```

### Encryption Flow
1. User inputs data
2. Data is encrypted using `encrypt()`
3. Encrypted data is sent to smart contract
4. Contract processes encrypted data
5. Results can be decrypted by authorized users

### Error Handling
All components include comprehensive error handling:
- SDK initialization errors
- Encryption/decryption failures
- Contract interaction errors
- Network connectivity issues

## 🚨 Troubleshooting

### Common Issues

1. **SDK not initializing**
   - Check if FHEVM node is running
   - Verify network configuration
   - Check browser console for errors

2. **Encryption failing**
   - Ensure wallet is connected
   - Verify contract address is correct
   - Check if SDK is ready

3. **Contract calls failing**
   - Verify contract is deployed
   - Check contract ABI
   - Ensure sufficient gas

### Debug Mode
Enable debug logging by adding to your environment:

```bash
NEXT_PUBLIC_DEBUG=true
```

## 📚 Learn More

- [Cloak SDK Documentation](../../docs/)
- [FHEVM Documentation](https://docs.fhevm.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.
