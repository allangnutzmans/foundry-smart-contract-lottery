'use client';
import { useSession } from 'next-auth/react';
import { api as trpc } from '@/lib/trpc';
import { WagerHistory as WagerHistoryType } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { WagerHistoryCard } from './WagerHistoryCard';
import { Button } from '@/components/ui/button';
import { WagerHistoryCardSkeleton } from '@/components/wallet-history-side/WagerHistoryCardSkeleton';

export const WagerHistory = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const { data: wagerHistory, isLoading, isError } = trpc.wagerHistory.getHistoryByUserId.useQuery(
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
      {loadSkeleton ? (
        Array.from({ length: 7 }).map((_, index) => (
          <WagerHistoryCardSkeleton loading={isLoading} key={index} />
        ))
      ) : (
          <div className="grid gap-3">
            {wagerHistory?.map((wager: WagerHistoryType) => (
              <WagerHistoryCard key={wager.id} wager={wager} />
            ))}
          </div>
      )}
    </div>
  );
}