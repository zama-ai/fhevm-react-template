import React from 'react';
import { MAX_PARTICIPANTS, AUCTION_DURATION_SECONDS } from '../constants';

interface AuctionStatusProps {
  timeLeft: number;
  participantCount: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const AuctionStatus = ({ timeLeft, participantCount }: AuctionStatusProps) => {
  const progressPercentage = (participantCount / MAX_PARTICIPANTS) * 100;
  const timeProgress = (timeLeft / AUCTION_DURATION_SECONDS) * 100;

  return (
    <div className="mt-4 space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 tracking-wide">AUCTION STATUS</h3>
      </div>
      <div>
        <div className="flex justify-between items-baseline text-gray-600 mb-1">
          <span className="text-lg font-medium">Time Remaining</span>
          <span className="text-2xl font-bold text-gray-900 tabular-nums">{formatTime(timeLeft)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${timeProgress}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-baseline text-gray-600 mb-1">
          <span className="text-lg font-medium">Participants</span>
          <span className="text-2xl font-bold text-gray-900">{participantCount} / {MAX_PARTICIPANTS}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AuctionStatus;
