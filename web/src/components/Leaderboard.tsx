import React from 'react';
import LeaderboardCard from './LeaderboardCard';
import LeaderboardTable from './LeaderboardTable';
import { appRouter } from '@/server/api/_root'; // Import the server router
import { createTRPCContext } from '@/server/trpc';

export type WagerRecord = {
  walletId: string,
  totalWager: number,
  address: string | null
  user:
    {
      id: string,
      nickname: string | null,
      avatar: string | null,
    } | null,
  timeLastWager: Date,
}

const Leaderboard = async () => {

    const defaultAvatarColors = ["#a855f7", "#ec4899", "#3b82f6"];

    // Create a tRPC caller for server-side calls
    const caller = appRouter.createCaller(await createTRPCContext({ req: new Request("http://localhost") }));

    // Directly call the tRPC procedure on the server
    const wagers: WagerRecord[] = await caller.wallet.getTop10Wagers();
    console.log(wagers)
    const wagers_static: WagerRecord[] = [
        {
            walletId: "1",
            address: "0x123",
            user: {
                id: "1",
                nickname: "dingzhexiong",
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
                nickname: "fanjiezhi",
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
                nickname: "xaur.eth",
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
                nickname: "empe_0",
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
                nickname: "quazawer",
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
                nickname: "Vaxziz",
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
                nickname: "Cheng_qt",
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
                nickname: "LuckyUser8",
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
                nickname: "LuckyUser9",
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
                nickname: "FinalUser",
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
              username={player.user?.nickname || player.address || ''}
              timeAgo={player.timeLastWager.toDateString()}
              wager={player.totalWager.toString()}
              avatarColors={player.user?.avatar ? [player.user.avatar] : defaultAvatarColors}
            />
          </div>
          )
        ))}
      </div>
      <LeaderboardTable players={players} />
    </div>
  );
};

export default Leaderboard; 