import WalletWagerSide from '@/components/wallet-history-side/WalletWagerSide';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function RaffleLayout({ children } : { children: React.ReactNode}) {
  return (
    <div className="flex h-[calc(100vh-2rem)]">
      <div className="relative w-full  rounded-xl p-px shadow-2xl overflow-hidden">
        <div className="card-border-animated"></div>
        <ScrollArea className="relative z-10 h-full w-full rounded-[15px] bg-card overflow-auto">
          {children}
        </ScrollArea>
      </div>
      <WalletWagerSide />
    </div>
  );
}
