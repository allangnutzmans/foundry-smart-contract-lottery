import RaffleCardNew from "@/components/RaffleCardNew";
import Leaderboard from "@/components/Leaderboard";

export default function Home() {
  return (
    <div className="h-[calc(100vh-2rem)] rounded-xl border p-8">
        <RaffleCardNew />
        <div className="mt-8">
          <Leaderboard />
        </div>
    </div>
  );
}
