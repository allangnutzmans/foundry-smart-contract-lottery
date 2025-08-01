'use client';

import React from 'react';
import { WagerHistory as WagerHistoryType } from '@prisma/client';
import { formatTimeAgo } from '@/lib/date';

interface WagerHistoryCardProps {
  wager: WagerHistoryType; //TODO Add the the wallet address that made the wager (nthe
}

export const WagerHistoryCard: React.FC<WagerHistoryCardProps> = ({ wager }) => {
  return (
    <div className="relative w-full rounded-xl p-px shadow-2xl overflow-hidden mb-3">
{/*      <div className="card-border-animated"></div>*/}
      <div className="relative z-10 h-full w-full rounded-[15px] bg-card p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Wager Amount:</span>
            <span className="font-semibold text-white">{wager.wagerAmount} ETH</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 text-sm">Prize Amount:</span>
            <span className="font-semibold text-white">{wager.prizeAmount} ETH</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 text-sm">End Date:</span>
            <span className="font-semibold text-white">{formatTimeAgo(wager.endDate.toISOString())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 