import RaffleCardRender from '@/components/raffle-card/RaffleCardRender';
import Leaderboard from '@/components/Leaderboard';
import WalletWagerSide from '@/components/wallet-history-side/WalletWagerSide';

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-2rem)]">
      <div className="relative w-full  rounded-xl p-px shadow-2xl overflow-hidden">
        <div className="card-border-animated"></div>
        <div className="relative z-10 h-full w-full rounded-[15px] bg-card p-4 overflow-auto">
          <RaffleCardRender />
          <div className="mt-5">
            <Leaderboard />
          </div>
        </div>
      </div>
      <WalletWagerSide />
    </div>
  );
}
