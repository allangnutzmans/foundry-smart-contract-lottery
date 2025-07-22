import RaffleCardNew from "@/components/RaffleCardNew";
import Leaderboard from "@/components/Leaderboard";
import React from "react";
import {UserCard} from "@/components/UserCard";

export default function Home() {
    return (
      <div className="flex h-[calc(100vh-2rem)]">
          <div className="relative w-full  rounded-xl p-px shadow-2xl overflow-hidden">
              <div className="card-border-animated"></div>
              <div className="relative z-10 h-full w-full rounded-[15px] bg-card p-8 overflow-auto">
                  <RaffleCardNew />
                  <div className="mt-8">
                      <Leaderboard />
                  </div>
              </div>
          </div>
          <div className="relative w-[20%] rounded-xl ps-4 overflow-hidden">
              <UserCard />
          </div>
      </div>
    );
}
