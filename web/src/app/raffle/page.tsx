'use client';

import RaffleCardRender from "@/components/raffle-card/RaffleCardRender";
import Leaderboard from "@/components/Leaderboard";

export default function RaffleHome() {
  return (
    <div className="p-4">
      <RaffleCardRender />
      <div className="mt-5">
        <Leaderboard />
      </div>
    </div>
  );
}
