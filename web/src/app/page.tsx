import RaffleCard from "@/components/RaffleCard";
import Leaderboard from "@/components/Leaderboard";
import React from "react";
import { UserCard } from "@/components/UserCard";
import { WagerHistory } from "@/components/WagerHistory";

export default function Home() {
    return (
        <div className="flex h-[calc(100vh-2rem)]">
            <div className="relative w-full  rounded-xl p-px shadow-2xl overflow-hidden">
                <div className="card-border-animated"></div>
                <div className="relative z-10 h-full w-full rounded-[15px] bg-card p-8 overflow-auto">
                    <RaffleCard />
                    <div className="mt-5">
                        <Leaderboard />
                    </div>
                </div>
            </div>
            <div className="relative w-[20%] rounded-xl ps-4 overflow-hidden">
                <UserCard />
                <WagerHistory />
            </div>
        </div>
    );
}
