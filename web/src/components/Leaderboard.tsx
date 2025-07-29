import React from 'react';
import LeaderboardCard from './LeaderboardCard';
import LeaderboardTable from './LeaderboardTable';
import { appRouter } from '@/server/api/_root'; // Import the server router
import { createTRPCContext } from '@/server/trpc';
import { User } from '@/generated/prisma';

const Leaderboard = async () => {

    const defaultAvatarColors = ["#a855f7", "#ec4899", "#3b82f6"];

    // Create a tRPC caller for server-side calls
    const caller = appRouter.createCaller(await createTRPCContext({ headers: new Headers() }));

    // Directly call the tRPC procedure on the server
    const wagers = await caller.user.getTop10Wagers();
    const wagers_static: User[] = [
        {
            id: "1",
            wallet: "0x123",
            nickname: "dingzhexiong",
            avatar: "🎮",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "2",
            wallet: "0x123",
            nickname: "fanjiezhi",
            avatar: "🎯",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "3",
            wallet: "0x123",
            nickname: "xaur.eth",
            avatar: "🎲",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "4",
            wallet: "0x123",
            nickname: "empe_0",
            avatar: "🎨",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "5",
            wallet: "0x123",
            nickname: "quazawer",
            avatar: "�",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "6",
            wallet: "0x123",
            nickname: "Vaxziz",
            avatar: "🎭",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "7",
            wallet: "0x123",
            nickname: "Cheng_qt",
            avatar: "🎸",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "8",
            wallet: "0x123",
            nickname: "LuckyUser8",
            avatar: "🍀",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "9",
            wallet: "0x123",
            nickname: "LuckyUser9",
            avatar: "🎉",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "10",
            wallet: "0x123",
            nickname: "FinalUser",
            avatar: "🌟",
            wager: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
    ]

    const players: User[] = [ ...wagers ];
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
              username={player.nickname || ''}
              timeAgo={player.updatedAt.toDateString()}
              wager={player.wager.toString()}
              avatarColors={player.avatar ? [player.avatar] : defaultAvatarColors}
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