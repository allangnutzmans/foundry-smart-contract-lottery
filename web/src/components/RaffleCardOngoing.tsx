"use client";

import React from 'react';

import {Coins} from "lucide-react";
import {Button} from "@/components/ui/button";
import { EntranceFee } from '@/components/RaffleCard';
import { type UseBalanceReturnType } from 'wagmi'
import { formatEther } from 'viem';
import { TimeObject } from '@/hooks/useRaffleState';

const RaffleCardOngoing = ({
  timeLeft,
  entranceFee,
  balance
}: {
  timeLeft: TimeObject;
  entranceFee?: EntranceFee;
  balance: UseBalanceReturnType['data']
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
                <span className="text-purple-200 text-sm font-medium">Raffle Price</span>
                {/*<p className="text-purple-200 text-sm font-medium">Entrance Fee: {entranceFee} {currency}</p>*/}
              </div>
            </div>

            
            {/* Button */}
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
              How it Works
            </Button>
          </div>
          
          {/* Right Section - Countdown */}
          <div className="flex flex-col items-center space-y-3">
            <div className="text-purple-200 text-sm font-semibold tracking-wider">
              RESETS IN
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
