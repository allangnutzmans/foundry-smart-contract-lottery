'use client';

import { RaffleCardBase } from './RaffleCardBase';
import { type EntranceFee } from './RaffleCard';
import { EnterRaffleDD } from '../enter-raffle/EnterRaffleDD';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { type UseBalanceReturnType } from 'wagmi';

export const RaffleCardNew = ({
  balance,
  entranceFee,
  roundId,
}: {
  entranceFee?: EntranceFee;
  balance: UseBalanceReturnType['data'];
  roundId: number;
}) => {
  const router = useRouter();

  const button = (
    <Button
      onClick={() => router.push('/raffle/enter')}
      className="bg-purple-600/40 hover:bg-purple-700/40 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 hover:shadow-purple-500/25"
    >
      How it Works
    </Button>
  );

  const rightSection = (
    <div className="flex flex-col items-center space-y-3">
      <div className="text-purple-200 text-sm font-semibold tracking-wider">START HERE</div>
      <div className="flex space-x-[0.1em]">
        <EnterRaffleDD entranceFee={entranceFee} />
      </div>
    </div>
  );

  return (
    <RaffleCardBase
      balance={balance}
      entranceFee={entranceFee}
      roundId={roundId}
      button={button}
      rightSection={rightSection}
    />
  );
};
