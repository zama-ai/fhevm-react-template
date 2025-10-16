export enum AuctionState {
	LIVE,
	ENDED,
	REVEALED
}

export enum UserState {
	CAN_JOIN,
	CAN_BID,
	BID_SUBMITTED
}

export interface Bid {
	address: string;
	encryptedBid: string; // Simulated encrypted value: "0x_encrypted_12500_0.1234"
	originalBid: number; // For simulation purposes only
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
