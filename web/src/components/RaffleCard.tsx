"use client";

import React from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { lotteryContract } from '@/lib/lotteryContract';
import RaffleCardOngoing from './RaffleCardOngoing';
import RaffleCardNew from './RaffleCardNew';
import { RAFLLE_STATE, useRaffleState } from '@/hooks/useRaffleState';

export type EntranceFee = {
  value?: bigint,
  symbol: string,
}

const RaffleCard = () => {
  const { chain } = useAccount();
  const symbol = chain?.nativeCurrency.symbol ?? 'ETH';
  const { data } = useReadContract(
    { ...lotteryContract, functionName: 'getEntranceFee' },
  );

  const entranceFee = {
    value: data,
    symbol,
  };

  const  { timeLeft, raffleState } = useRaffleState();

  const { data: balance } = useBalance({
    address: lotteryContract.address,
    watch: true,
  })

  console.log(timeLeft)

  return (
    <>
      {raffleState === RAFLLE_STATE.OPEN ? (
        <RaffleCardOngoing balance={balance} timeLeft={timeLeft} entranceFee={entranceFee} />
      ) : (
        <RaffleCardNew balance={balance} entranceFee={entranceFee} />
      )}
    </>
  );
};


export default RaffleCard;
