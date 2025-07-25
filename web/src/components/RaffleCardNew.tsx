'use client';

import React, { useEffect } from 'react';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { type UseBalanceReturnType } from 'wagmi'
import { lotteryContract } from '@/lib/lotteryContract';
import { formatEther } from 'viem';
import { EntranceFee } from '@/components/RaffleCard';
import { useQueryClient } from '@tanstack/react-query';

const RaffleCardNew = ({
 balance,
 entranceFee,
}: {
  entranceFee?: EntranceFee;
  balance: UseBalanceReturnType['data'];
}) => {
  const formattedBalance = balance?.value ? formatEther(balance.value) : '0';
  const formattedFee = entranceFee?.value ? formatEther(entranceFee.value) : '0';

  const queryClient = useQueryClient();
  const { data: hash, writeContract } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({
        queryKey: ['balance'],
      });
    }
  }, [isConfirmed, queryClient]);

  const enterRaffle = async () => {
    writeContract({
      ...lotteryContract,
      functionName: 'enterRaffle',
      value: entranceFee?.value,
    });
  };


  return (
    <div className="relative w-full h-40 rounded-2xl p-px shadow-xl overflow-hidden bg-gradient-to-r from-purple-900 via-purple-700 to-purple-500">
      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-20 animate-pulse"></div>

      {/* Main card content */}
      <div className="relative z-10 h-full w-full rounded-2xl bg-gradient-to-r from-purple-900/90 via-purple-800/80 to-purple-700/70 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex-col items-center justify-between space-y-4 h-full">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Coin Icon */}
                <div className="w-16 h-16 rounded-full bg-purple-600/30 backdrop-blur-sm flex items-center justify-center border border-purple-400/30">
                  <Coins className="h-8 w-8 text-purple-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">S</span>
                </div>
              </div>

              {/* Price Info */}
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-wide">
                  {formattedBalance} {balance?.symbol}
                </h2>
                <p className="text-purple-200 text-sm font-medium">
                  Entrance Fee - {formattedFee} {entranceFee?.symbol}
                </p>
              </div>
            </div>

            <Button className="bg-purple-600/40 hover:bg-purple-700/40 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 hover:shadow-purple-500/25">
              How it Works
            </Button>
          </div>

          {/* Right Section - Countdown */}
          <div className="flex flex-col items-center space-y-3">
            <div className="text-purple-200 text-sm font-semibold tracking-wider">
              START HERE
            </div>

            {/* Countdown Timer */}
            <div className="flex space-x-[0.1em]">
              {/* Button */}
              <Button
                variant="secondary"
                className="text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                onClick={enterRaffle}
              >
                {isConfirming ? 'JOINING...' : isConfirmed ? 'JOINED!' : 'JOIN NEW RAFFLE'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleCardNew;
