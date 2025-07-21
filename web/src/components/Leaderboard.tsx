import React from 'react';
import LeaderboardCard from './LeaderboardCard';
import LeaderboardTable from './LeaderboardTable';

const Leaderboard = () => {
  const leaderboardData = [
    {
      rank: 1,
      username: "dingzhexiong",
      timeAgo: "2s ago",
      wager: "16,601,535.07",
      avatarColors: ["#a855f7", "#ec4899", "#3b82f6"] // purple, pink, blue
    },
    {
      rank: 2,
      username: "zhanghong",
      timeAgo: "3s ago",
      wager: "4,954,952.08",
      avatarColors: ["#fbbf24", "#f97316", "#ef4444"] // yellow, orange, red
    },
    {
      rank: 3,
      username: "wangxin",
      timeAgo: "2s ago",
      wager: "16,601,535.07",
      avatarColors: ["#06b6d4", "#10b981", "#8b5cf6"] // light blue, green, purple
    }
  ];

  return (
    <div className="space-y-3">
      {/* Title */}
      <h2 className="text-xl font-bold text-white">Leaderboard</h2>
      
      {/* Cards Container */}
      <div className="flex space-x-4">
        {leaderboardData.map((player, index) => (
          <div key={index} className="flex-1">
            <LeaderboardCard
              rank={player.rank}
              username={player.username}
              timeAgo={player.timeAgo}
              wager={player.wager}
              avatarColors={player.avatarColors}
            />
          </div>
        ))}
      </div>
      <LeaderboardTable />
    </div>
  );
};

export default Leaderboard; 