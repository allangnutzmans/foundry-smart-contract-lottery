"use client";

import React, { useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { lotteryContract } from '@/lib/lotteryContract';
import RaffleCardOngoing from './RaffleCardOngoing';
import RaffleCardNew from './RaffleCardNew';
import { RAFLLE_STATE, useRaffleState } from '@/hooks/useRaffleState';
import { api } from '@/lib/trpc';
import { type Address } from 'viem'; // Import Address type

export type EntranceFee = {
  value?: bigint,
  symbol: string,
}

const RaffleCard = () => {
  const { address, chain, isConnected } = useAccount();
  const symbol = chain?.nativeCurrency.symbol ?? 'ETH';

  const { data } = useReadContract(
    { ...lotteryContract, address: lotteryContract.address as Address, functionName: 'getEntranceFee' },
  );

  const entranceFee = {
    value: data,
    symbol,
  };

  const  { timeLeft, raffleState } = useRaffleState();
  const { data: balance } = useBalance({
    address: lotteryContract.address as Address,
  })


  //TODO Move this logic to auth
  const { data: existingWallet, refetch } = api.wallet.getByAddress.useQuery(
    { address: address as Address },
    {
      enabled: !!address,
      refetchOnWindowFocus: false,
      refetchInterval: 10000,
    }
  )

  const { mutate: createWallet } = api.wallet.create.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (!isConnected || !address) return;
    if (existingWallet === undefined) return; // loading state
    if (!existingWallet) {
      createWallet({ address: address });
    }
  }, [isConnected, address, existingWallet, createWallet]);


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
