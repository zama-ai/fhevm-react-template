import { Product } from './types';

// NOTE: Images are now hosted via direct, user-provided links to ensure they load correctly.
// This is the definitive solution to prevent broken image links.

export const PRODUCTS: Product[] = [
  {
    id: 'iphone_17_pro',
    name: "iPhone 17 Pro Max",
    imageUrl: 'https://i.hizliresim.com/omywtou.png', // Corrected user-provided link
    targetPrice: 12455,
    entryFee: 0.01,
    prizeEth: 0.3,
  },
  {
    id: 'macbook_pro_16',
    name: "MacBook Pro 16\"",
    imageUrl: 'https://i.hizliresim.com/gi3twe8.png', // Corrected user-provided link
    targetPrice: 14899, // Updated to be within the MAX_BID range
    entryFee: 0.013,
    prizeEth: 0.6,
  },
  {
    id: 'imac_27',
    name: "iMac 27\"",
    imageUrl: 'https://i.hizliresim.com/45fso3y.png', // User-provided link
    targetPrice: 14550, // Updated to be within the MAX_BID range
    entryFee: 0.012,
    prizeEth: 0.55,
  }
];

export const MAX_PARTICIPANTS = 100;
export const AUCTION_DURATION_SECONDS = 300; // 5 minutes

export const MIN_BID = 100;
export const MAX_BID = 15000; // Adjusted to match user's requirement for consistency.