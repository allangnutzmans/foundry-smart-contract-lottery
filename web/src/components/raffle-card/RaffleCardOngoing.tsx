"use client";

import React from 'react';

import {Coins} from "lucide-react";
import { type UseBalanceReturnType } from 'wagmi'
import { formatEther } from 'viem';
import { TimeObject } from '@/hooks/useRaffleState';
import CountUp from '@/components/ui/counter-up';
import { EnterRaffleDD } from '../enter-raffle/EnterRaffleDD';
import { EntranceFee } from '@/components/raffle-card/RaffleCard';

const RaffleCardOngoing = ({
  timeLeft,
  entranceFee,
  balance,
  roundId
}: {
  timeLeft: TimeObject;
  entranceFee?: EntranceFee;
  balance: UseBalanceReturnType['data']
  roundId: number
}) => {
  const formattedBalance = balance?.value ? formatEther(balance.value) : '0';
  const formattedFee = entranceFee?.value ? formatEther(entranceFee.value) : '0';

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
                <h2 className="text-3xl font-bold text-white tracking-wide">{formattedBalance} {balance?.symbol}</h2>
                <span className="text-purple-200 text-sm font-medium">Raffle Prize</span>
                {/*TODO FIX THE ENTRANCE FEE HERE*/}
                {/*<p className="text-purple-200 text-sm font-medium">Entrance Fee: {entranceFee.value.toString()} {entranceFee.symbol.toString()}</p>*/}
              </div>
            </div>

            
            {/* Button */}
            {/* Enter Raffle */}
            <div className="flex space-x-[0.1em]">
              <EnterRaffleDD />
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-purple-200/50 text-8xl font-semibold tracking-wider pe-16">
              ROUND <CountUp to={roundId} className="count-up-text" />
            </div>
          </div>
          
          {/* Right Section - Countdown */}
          <div className="flex flex-col items-center space-y-3">
            <div className="text-purple-200 text-sm font-semibold tracking-wider">
              PRIZE IN
            </div>
            
            {/* Countdown Timer */}
            <div className="flex space-x-[0.1em]">
              {/* Hours */}
              <div className="bg-purple-900/60 backdrop-blur-sm rounded-l-lg py-3 px-6 border border-purple-700/50">
                <div className="text-2xl font-bold text-white text-center">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-purple-300 text-center font-medium">
                  Hour
                </div>
              </div>
              
              {/* Minutes */}
              <div className="bg-purple-900/60 backdrop-blur-sm py-3 px-6 border border-purple-700/50">
                <div className="text-2xl font-bold text-white text-center">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-purple-300 text-center font-medium">
                  Min
                </div>
              </div>
              
              {/* Seconds */}
              <div className="bg-purple-900/60 backdrop-blur-sm rounded-r-lg py-3 px-6 border border-purple-700/50">
                <div className="text-2xl font-bold text-white text-center">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-purple-300 text-center font-medium">
                  Sec
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleCardOngoing;
