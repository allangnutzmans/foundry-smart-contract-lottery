"use client";

import React, { useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { lotteryContract } from '@/lib/lotteryContract';
import RaffleCardOngoing from './RaffleCardOngoing';
import RaffleCardNew from './RaffleCardNew';
import { RAFLLE_STATE, useRaffleState } from '@/hooks/useRaffleState';
import { api } from '@/lib/trpc';

export type EntranceFee = {
  value?: bigint,
  symbol: string,
}

const RaffleCard = () => {
  const { address, chain, isConnected } = useAccount();
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

  const { data: existingUser, refetch } = api.user.getByWallet.useQuery(
    { wallet: address },
    {
      enabled: !!address,
      refetchOnWindowFocus: false,
      refetchInterval: 10000,
    }
  )

  const { mutate: createUser } = api.user.create.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (isConnected && address && !existingUser) {
      createUser({ wallet: address });
    }
  }, [isConnected, address, existingUser, createUser]);

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
