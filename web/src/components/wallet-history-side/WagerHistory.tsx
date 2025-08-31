'use client';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/trpc';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WagerHistoryCardSkeleton } from '@/components/wallet-history-side/WagerHistoryCardSkeleton';
import { WagerHistoryCard } from './WagerHistoryCard';
import { cn } from '@/lib/utils';

export interface WagerHistoryItem {
  id: string;
  walletId: string;
  wagerAmount: number;
  createdAt: Date;
  raffleRoundId: string;
  wallet: {
    address: string;
  };
  raffleRound: {
    roundId: number;
    prizeAmount: number;
    winner: string | null;
    endedAt: Date | null;
    createdAt: Date;
  };
}

export const WagerHistory = ({ isSmall }: { isSmall: boolean }) => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const {
    data: wagerHistory,
    isLoading,
    isError,
  } = api.wagerHistory.getHistoryByUserId.useQuery(
    { userId: userId || '' },
    {
      enabled: status === 'authenticated' && !!userId,
    }
  );

  if (status === 'loading')
    return <div className="text-center text-gray-500">Loading authentication status...</div>;

  if (status === 'unauthenticated') {
    return (
      <div className="mt-5 flex justify-center">
        <Button onClick={() => signIn('google')} variant="secondary" className="w-full max-w-xs">
          Login to see your history
        </Button>
      </div>
    );
  }
  const loadSkeleton = isLoading || isError || !wagerHistory || wagerHistory.length === 0;
  return (
    <div className="mt-5 flex flex-col h-full">
      <h3 className="text-sm font-semibold mb-3">Your Wager History</h3>
      <ScrollArea className="h-[calc(100vh-240px)] overflow-y-auto">
        {loadSkeleton ? (
          Array.from({ length: 7 }).map((_, index) => (
            <WagerHistoryCardSkeleton loading={isLoading} key={index} />
          ))
        ) : wagerHistory && wagerHistory.length > 0 ? (
          <div className="grid gap-3 p-2">
            {wagerHistory.map((wager: WagerHistoryItem) => (
              <WagerHistoryCard key={wager.id} wager={wager} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <span
              className={cn(
                'text-muted-foreground font-semibold text-center border rounded-lg bg-card/70',
                !isSmall ? 'mx-8' : 'mx-2'
              )}
            >
              No wagers yet. Join the raffle to get started! 🎯
            </span>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
