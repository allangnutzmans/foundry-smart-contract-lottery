'use client';

import { RaffleCardBase } from './RaffleCardBase';
import { type EntranceFee } from './RaffleCard';
import { Button } from '@/components/ui/button';
import { type UseBalanceReturnType } from 'wagmi';
import GlareHover from '../ui/glare-hover';
import { useReadContract } from 'wagmi';
import { singleEntryRaffle } from '@/lib/contract/singleEntryRaffle';
import { useRaffleState } from '@/hooks/useRaffleState';

export const RaffleCardCalculating = ({
  balance,
  roundId,
  entranceFee,
}: {
  entranceFee?: EntranceFee;
  balance: UseBalanceReturnType['data'];
  roundId: number;
}) => {
  const { data: numberOfPlayers } = useReadContract({
    abi: singleEntryRaffle.abi,
    address: singleEntryRaffle.address,
    functionName: 'getNumberOfPlayers',
  });

  const { winnerAddress } = useRaffleState();

  const button = (
    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
      How it Works
    </Button>
  );

  const rightSection = (
    <div className="flex flex-col items-center space-y-4 text-purple-200/50">
      {winnerAddress ? `WINNER: ${winnerAddress}` : 'PICKING WINNER...'}
      {numberOfPlayers && (
        <div className="text-purple-200/30 text-sm">{numberOfPlayers} players</div>
      )}
    </div>
  );

  return (
    <GlareHover
      playOnHover={false}
      transitionDuration={2000}
      width="100%"
      height="100%"
      className="rounded-2xl overflow-hidden"
    >
      <RaffleCardBase
        balance={balance}
        entranceFee={entranceFee}
        roundId={roundId}
        button={button}
        rightSection={rightSection}
      />
    </GlareHover>
  );
};
