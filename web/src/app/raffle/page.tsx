import RaffleCard from "@/components/raffle-card/RaffleCard";
import Leaderboard from "@/components/Leaderboard";

export default function RaffleHome() {
  return (
      <div className="p-8">
          <RaffleCard />
          <div className="mt-5">
            <Leaderboard />
        </div>
      </div>
  );
}
