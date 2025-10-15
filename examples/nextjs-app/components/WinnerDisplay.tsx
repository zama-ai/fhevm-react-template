import React from 'react';
import { type Winner } from '../types';

interface WinnerDisplayProps {
  winner: Winner;
  targetPrice: number;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner, targetPrice }) => {
  return (
    <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-yellow-400">
      <div className="mb-4">
        <span className="text-5xl">🏆</span>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">We Have a Winner!</h2>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg space-y-3 text-left">
         <div className="flex justify-between items-baseline">
            <span className="text-md text-gray-600">Secret Target Price:</span>
            <span className="font-bold text-lg text-gray-900">${targetPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-baseline">
            <span className="text-md text-gray-600">Winning Bid:</span>
            <span className="font-bold text-lg text-yellow-600">${winner.bid.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-baseline">
            <span className="text-md text-gray-600">Difference:</span>
            <span className="font-bold text-lg text-gray-900">${winner.difference.toLocaleString()}</span>
        </div>
         <div className="pt-2 border-t border-gray-200">
            <span className="text-md text-gray-600 block">Winner's Address:</span>
            <span className="font-mono text-sm text-blue-600 break-all">{winner.address}</span>
        </div>
      </div>

      <p className="mt-6 text-gray-700">Congratulations to the winner!</p>
    </div>
  );
};

export default WinnerDisplay;