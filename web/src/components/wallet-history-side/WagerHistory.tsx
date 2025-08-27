'use client';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/trpc';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WagerHistoryCardSkeleton } from '@/components/wallet-history-side/WagerHistoryCardSkeleton';
import { WagerHistoryCard } from './WagerHistoryCard';

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

export const WagerHistory = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const { data: wagerHistory, isLoading, isError } = api.wagerHistory.getHistoryByUserId.useQuery(
    { userId: userId || '' },
    {
      enabled: status === "authenticated" && !!userId,
    }
  );

  if (status === "loading") return <div className="text-center text-gray-500">Loading authentication status...</div>;

  if (status === "unauthenticated") {
    return (
      <div className="mt-5 flex justify-center">
        <Button
          onClick={() => signIn('google')}
          variant="secondary"
          className="w-full max-w-xs"
        >
          Login to see your history
        </Button>
      </div>
    );
  }
  const loadSkeleton = isLoading || isError || !wagerHistory || wagerHistory.length === 0;
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold mb-3">Your Wager History</h3>
      {/* TODO: Fix - In small screens scroll overflow the box and becomes hidden */}
      <ScrollArea className='h-175'>
        {loadSkeleton ? (
          Array.from({ length: 7 }).map((_, index) => (
            <WagerHistoryCardSkeleton loading={isLoading} key={index} />
          ))
        ) : (

            <div className="grid gap-3">
              {wagerHistory?.map((wager) => (
                <WagerHistoryCard key={wager.id} wager={wager} />
              ))}
            </div>
        )}
      </ScrollArea>
    </div>
  );
}