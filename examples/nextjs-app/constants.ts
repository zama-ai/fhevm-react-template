import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'iphone_17_pro',
    name: "iPhone 17 Pro Max",
  imageUrl: '/assets/iphone.png',
    targetPrice: 12455,
  entryFee: 0.001,
    prizeEth: 0.3,
  },
  {
    id: 'macbook_pro_16',
    name: "MacBook Pro 16\"",
  imageUrl: '/assets/macbook.png',
    targetPrice: 14899,
  entryFee: 0.001,
    prizeEth: 0.6,
  },
  {
    id: 'imac_27',
    name: "iMac 27\"",
  imageUrl: '/assets/imac.png',
    targetPrice: 14550,
  entryFee: 0.001,
    prizeEth: 0.55,
  }
];

export const MAX_PARTICIPANTS = 10;
export const AUCTION_DURATION_SECONDS = 600;
export const MIN_BID = 100;
export const MAX_BID = 15000;
