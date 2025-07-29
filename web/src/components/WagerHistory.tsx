'use client';
import { useSession } from 'next-auth/react';
import { api as trpc } from '@/lib/trpc';
import { WagerHistory as WagerHistoryType } from '@/generated/prisma/client';
import { signIn } from 'next-auth/react';
import { WagerHistoryCard } from './WagerHistoryCard';
import { Button } from '@/components/ui/button';

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
          onClick={() => signIn()}
          variant="secondary"
          className="w-full max-w-xs"
        >
          Login to see your history
        </Button>
      </div>
    );
  }

  if (isLoading) return <div className="text-center text-gray-500">Loading wager history...</div>;
  if (isError) return <div className="text-center text-red-500">Error loading wager history.</div>;
  if (!wagerHistory || wagerHistory.length === 0) return <div className="text-center text-gray-500">No wager history found.</div>;

  return (
    <div className="mt-5">
      <h3 className="text-lg font-semibold mb-3">Your Wager History</h3>
      <div className="grid gap-3">
        {wagerHistory.map((wager: WagerHistoryType) => (
          <WagerHistoryCard key={wager.id} wager={wager} />
        ))}
      </div>
    </div>
  );
}; 