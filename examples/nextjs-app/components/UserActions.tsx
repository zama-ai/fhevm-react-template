import React from 'react';
import { UserState, Product } from '../types';
import { MIN_BID, MAX_BID } from '../constants';

interface UserActionsProps {
  userState: UserState;
  auctionEnded: boolean;
  bid: string;
  isLoading: boolean;
  setBid: (value: string) => void;
  onJoin: () => void;
  onSubmitBid: () => void;
  onReveal: () => void;
  onSimulate: () => void;
  product: Product;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean; className?: string }> = ({ onClick, children, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-lg font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${className}`}
  >
    {children}
  </button>
);

const UserActions: React.FC<UserActionsProps> = ({ userState, auctionEnded, bid, setBid, onJoin, onSubmitBid, onReveal, onSimulate, isLoading, product }) => {
  if (auctionEnded) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">Auction Has Ended!</h3>
        <p className="text-gray-600 mt-2 mb-6">The bidding period is over. Click below to see the winner.</p>
        <Button onClick={onReveal} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
          {isLoading ? 'Revealing...' : 'Reveal Winner'}
        </Button>
      </div>
    );
  }

  switch (userState) {
    case UserState.CAN_JOIN:
      return (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pay the entry fee to place your secret bid.</p>
          <Button onClick={onJoin} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? 'Processing...' : `Pay ${product.entryFee} ETH to Join`}
          </Button>
        </div>
      );
    case UserState.CAN_BID:
      return (
        <div>
          <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md mb-4">
             <p className="font-semibold">Bidding Rules:</p>
             <ul className="list-disc list-inside mt-1">
                <li>Your bid must be between ${MIN_BID.toLocaleString()} and ${MAX_BID.toLocaleString()}.</li>
                <li>The closest bid to the secret price wins.</li>
             </ul>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input
              type="number"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              placeholder="e.g., 12500"
              className="w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-lg py-3 pl-8 pr-4 text-gray-900 text-lg outline-none transition-colors"
            />
          </div>
          <Button onClick={onSubmitBid} disabled={isLoading || !bid} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? 'Encrypting & Submitting...' : 'Submit My Encrypted Bid'}
          </Button>
        </div>
      );
    case UserState.BID_SUBMITTED:
      return (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-green-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-green-600 mt-4">Bid Submitted Successfully!</h3>
          <p className="text-gray-600 mt-2 mb-6">Your encrypted bid is secure. Wait for the auction to end or simulate to see an instant result.</p>
          <Button 
            onClick={onSimulate} 
            disabled={isLoading} 
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? 'Simulating...' : 'Simulate Remaining Bids'}
          </Button>
        </div>
      );
    default:
      return null;
  }
};

export default UserActions;
