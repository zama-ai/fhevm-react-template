import { mainnet, sepolia } from 'wagmi/chains';
import {
  VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
  VITE_AUCTION_TOKEN_CONTRACT_ADDRESS,
} from '@/config/env';

// Get the default native token based on chainId
export const getNativeToken = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return {
        id: '1',
        symbol: 'ETH',
        name: 'Ethereum',
        address: 'native',
        decimals: 18,
        isEncrypted: false,
        isDecrypted: false,
        logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
      };
    case sepolia.id:
      return {
        id: '1',
        symbol: 'ETH',
        name: 'Sepolia ETH',
        address: 'native',
        decimals: 18,
        isEncrypted: false,
        isDecrypted: false,
        logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
      };
    default:
      return {
        id: '1',
        symbol: 'ETH',
        name: 'Ethereum',
        address: 'native',
        decimals: 18,
        isEncrypted: false,
        isDecrypted: false,
        logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
      };
  }
};

// Get the rest of the default tokens (non-native) based on chain
export const getDefaultTokens = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return [
        {
          id: '2',
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
        {
          id: '3',
          symbol: 'WBTC',
          name: 'Wrapped Bitcoin',
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          decimals: 8,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
        },
      ];
    case sepolia.id:
      return [
        {
          id: '2',
          symbol: 'USDC',
          name: 'USD Coin (Sepolia)',
          address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
          decimals: 6,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
        {
          id: '3',
          symbol: 'WETH',
          name: 'Wrapped Ether (Sepolia)',
          address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
          decimals: 18,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
        },
        {
          id: '4',
          symbol: 'WETHc',
          name: 'Confidential Wrapped Ether',
          address: VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
          decimals: 6,
          isAuctionPaymentToken: true,
          isEncrypted: true,
          isDecrypted: false,
          isConfidential: true,
          logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
        },
        {
          id: '5',
          symbol: 'AT',
          name: 'Auction Token',
          address: VITE_AUCTION_TOKEN_CONTRACT_ADDRESS,
          decimals: 6,
          isAuctionToken: true,
          isEncrypted: true,
          isDecrypted: false,
          isConfidential: true,
          logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
      ];
    default:
      return [
        {
          id: '2',
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          isEncrypted: false,
          isDecrypted: false,
          logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
      ];
  }
};
