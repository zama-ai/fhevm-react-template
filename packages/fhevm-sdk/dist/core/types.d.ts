export declare enum AuctionState {
    LIVE = 0,
    ENDED = 1,
    REVEALED = 2
}
export declare enum UserState {
    CAN_JOIN = 0,
    CAN_BID = 1,
    BID_SUBMITTED = 2
}
export interface Bid {
    address: string;
    encryptedBid: string;
    originalBid: number;
}
export interface Winner {
    address: string;
    bid: number;
    difference: number;
}
export interface Product {
    id: string;
    name: string;
    imageUrl: string;
    targetPrice: number;
    entryFee: number;
    prizeEth: number;
}
