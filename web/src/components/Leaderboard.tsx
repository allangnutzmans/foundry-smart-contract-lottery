'use client';

import React from 'react';
import LeaderboardCard from './LeaderboardCard';
import LeaderboardTable from './LeaderboardTable';
import { api } from '@/lib/trpc';
import { singleEntryRaffle } from '@/lib/contract/singleEntryRaffle';
import { useWatchContractEvent } from 'wagmi';

export type WagerRecord = {
  walletId: string,
  totalWager: number,
  address: string | null
  user:
    {
      id: string,
      name: string | null,
      avatar: string | null,
      image?: string | null,
    } | null,
  timeLastWager: Date,
  roundId?: number,
}

const Leaderboard = () => {
    const defaultAvatarColors = ["#a855f7", "#ec4899", "#3b82f6"];

    const { data: wagers = [], refetch } = api.wallet.getTop10Wagers.useQuery();
    
    useWatchContractEvent({
        address: singleEntryRaffle.address,
        abi: singleEntryRaffle.abi,
        eventName: 'RaffleEntered',
        onLogs() {
            void refetch();
        },
    });

    // Listener para evento WinnerPicked
    useWatchContractEvent({
        address: singleEntryRaffle.address,
        abi: singleEntryRaffle.abi,
        eventName: 'WinnerPicked',
        onLogs() {
            void refetch();
        },
    });
    
    
    const wagers_static: WagerRecord[] = [
        {
            walletId: "1",
            address: "0x123",
            user: {
                id: "1",
                name: "dingzhexiong",
                avatar: "🎮",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "2",
            address: "0x123",
            user: {
                id: "2",
                name: "fanjiezhi",
                avatar: "🎯",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "3",
            address: "0x123",
            user: {
                id: "3",
                name: "xaur.eth",
                avatar: "🎲",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "4",
            address: "0x123",
            user: {
                id: "4",
                name: "empe_0",
                avatar: "🎨",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "5",
            address: "0x123",
            user: {
                id: "5",
                name: "quazawer",
                avatar: "",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "6",
            address: "0x123",
            user: {
                id: "6",
                name: "Vaxziz",
                avatar: "🎭",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "7",
            address: "0x123",
            user: {
                id: "7",
                name: "Cheng_qt",
                avatar: "🎸",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "8",
            address: "0x123",
            user: {
                id: "8",
                name: "LuckyUser8",
                avatar: "🍀",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "9",
            address: "0x123",
            user: {
                id: "9",
                name: "LuckyUser9",
                avatar: "🎉",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
        {
            walletId: "10",
            address: "0x123",
            user: {
                id: "10",
                name: "FinalUser",
                avatar: "🌟",
            },
            totalWager: 0,
            timeLastWager: new Date(),
        },
    ]

    const players: WagerRecord[] = [ ...wagers ];
    if (players.length < 10) {
        const remainingSlots = 10 - players.length;
        players.push(...wagers_static.slice(0, remainingSlots));
    }

  return (
    <div className="space-y-3">
      {/* Title */}
      <h2 className="text-xl font-bold text-white">Leaderboard</h2>
      {/* Cards Container */}
      <div className="flex space-x-4">
        {players?.map((player, index) => (
            index < 3 && (  // Only show top 3 cards
          <div key={index} className="flex-1">
            <LeaderboardCard
              rank={index + 1}
              username={player.user?.name || player.address || ''}
              timeAgo={player.timeLastWager.toISOString()}
              wager={player.totalWager.toString()}
              avatarEmoji={getAvatarEmoji(player)}
              avatarImage={player.user?.image || undefined}
              avatarColors={defaultAvatarColors}
            />
          </div>
          )
        ))}
      </div>
      <LeaderboardTable players={players} />
    </div>
  );
};

// GETTERS
function getAvatarEmoji(player: WagerRecord): string {
    return player.user?.avatar 
        ?? player.user?.name?.[0]?.toUpperCase() 
        ?? '';
}


export default Leaderboard; 