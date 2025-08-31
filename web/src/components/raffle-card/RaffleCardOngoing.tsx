'use client';

import React from 'react';

import { type UseBalanceReturnType } from 'wagmi';
import { type TimeObject } from '@/hooks/useRaffleState';
import { EnterRaffleDD } from '../enter-raffle/EnterRaffleDD';
import { type EntranceFee } from '@/components/raffle-card/RaffleCardBase';
import ContdownTimer from '../countdow-timer/CountdownTimer';
import { RaffleCardBase } from './RaffleCardBase';

const RaffleCardOngoing = ({
  timeLeft,
  entranceFee,
  balance,
  roundId,
}: {
  timeLeft: TimeObject;
  entranceFee?: EntranceFee;
  balance: UseBalanceReturnType['data'];
  roundId: number;
}) => {
  const rightSection = (
    <div className="flex flex-col items-center space-y-3">
      <div className="text-purple-200 text-sm font-semibold tracking-wider">PRIZE IN</div>
      <ContdownTimer timeLeft={timeLeft} />
    </div>
  );

  return (
    <RaffleCardBase
      balance={balance}
      entranceFee={entranceFee}
      roundId={roundId}
      button={<EnterRaffleDD entranceFee={entranceFee} />}
      rightSection={rightSection}
    />
  );
};

export default RaffleCardOngoing;
