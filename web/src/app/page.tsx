import RaffleCardNew from "@/components/RaffleCardNew";
import Leaderboard from "@/components/Leaderboard";
import React from "react";

export default function Home() {
  return (
      <>
          <div className="relative w-full h-[calc(100vh-2rem)] rounded-xl p-px shadow-2xl overflow-hidden">
              <div className="card-border-animated"></div>
              <div className="relative z-10 h-full w-full rounded-[15px] bg-card p-8 overflow-auto">
                  <RaffleCardNew />
                  <div className="mt-8">
                      <Leaderboard />
                  </div>
              </div>
          </div>
      </>

  );
}
