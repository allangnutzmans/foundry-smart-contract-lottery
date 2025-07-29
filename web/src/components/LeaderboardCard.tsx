import React from 'react';
import { Coins } from 'lucide-react'
import { formatTimeAgo } from '@/lib/date';
interface LeaderboardCardProps {
  rank: number;
  username: string;
  timeAgo: string; // Changed to string as it comes from API as ISO string
  wager: string;
  avatarColors: string[];
}

const LeaderboardCard = ({ rank, username, timeAgo, wager, avatarColors }: LeaderboardCardProps) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-br from-orange-400 to-orange-600 text-white";
      default:
        return "bg-purple-600 text-white";
    }
  };

  return (
    <div className="relative">
      {/* Rank Badge */}
      <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full ${getRankBadge(rank)} flex items-center justify-center z-10 shadow-lg`}>
        <span className="text-sm font-bold">{rank}</span>
      </div>
      
      {/* Card */}
      <div className="bg-card-foreground/80 backdrop-blur-sm rounded-xl p-4 border border-card-foreground/50 shadow-lg">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div 
            className="w-10 h-10 rounded-full flex-shrink-0"
            style={{
              background: `linear-gradient(45deg, ${avatarColors[0]}, ${avatarColors[1]}, ${avatarColors[2]})`
            }}
          />
          
          {/* Username */}
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">{username}</h3>
          </div>
        </div>

        <div className="border-b my-2 mx-1"></div>
        
        {/* Time and Wager */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex flex-col items-start space-x-1">
            <span className="text-purple-300 font-medium">TIME</span>
            <span className="text-white">{formatTimeAgo(timeAgo)}</span>
          </div>
          
          <div className="flex flex-col items-end space-x-1">
            <span className="text-purple-300 font-medium">WAGER</span>
            <div className="inline-flex items-center space-x-1">
              <Coins className="w-3 h-3 text-yellow-400" />
              <span className="text-white">{wager}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;