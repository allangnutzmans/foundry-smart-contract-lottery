'use client';
import { UserCard } from '@/components/wallet-history-side/UserCard';
import { WagerHistory } from '@/components/wallet-history-side/WagerHistory';
import { useWalletSync } from '@/hooks/useWalletSync';

export default function WalletWagerSide() {
  useWalletSync(); // Ensure wallet is synced with user account
  return (
    <div className="relative w-[20%] rounded-xl ps-4 overflow-hidden">
      <UserCard />
      <WagerHistory />
    </div>
  );
}