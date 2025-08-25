"use client";

import React, { useState } from 'react';

import {Coins} from "lucide-react";
import {Button} from "@/components/ui/button";
import { EntranceFee } from './RaffleCard';
import { useReadContract, type UseBalanceReturnType } from 'wagmi'
import { formatEther } from 'viem';

import { singleEntryRaffle } from "@/lib/contract/singleEntryRaffle";
import { useWatchContractEvent } from 'wagmi';
import GlareHover from '../ui/glare-hover';

const RaffleCardCalculating = ({
  balance,
  roundId
}: {

  entranceFee?: EntranceFee;
  balance: UseBalanceReturnType['data']
  roundId: number
}) => {
const { data: numberOfPlayers } = useReadContract({
    abi: singleEntryRaffle.abi,
    address: singleEntryRaffle.address,
    functionName: 'getNumberOfPlayers',
});

  // TODO: UPDATE TO SHOW THE WINNER IN THE UI
  const [winner, setWinner] = useState<string | null>(null);


  // Listener para evento WinnerPicked
  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'WinnerPicked',
    onLogs(logs) {
      if (logs.length > 0) {
        const log = logs[0] as { args?: { player?: string } }; // Type assertion para acessar args
        const winnerAddress = log.args?.player as string;
        setWinner(winnerAddress);
      }
    },
  });

  // Total balance of contract

  const formattedBalance = balance?.value ? formatEther(balance.value) : '0';

  return (
    <div className="relative w-full h-40 shadow-xl rounded-2xl overflow-hidden">
        <GlareHover 
            playOnHover={false} 
            transitionDuration={2000} 
            width="100%" 
            height="100%" 
            className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900 via-purple-700 to-purple-500"
        >    
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-20 animate-pulse"></div>
      
      {/* Main card content */}
      <div className="relative z-10 h-full w-full rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900/90 via-purple-800/80 to-purple-700/70 backdrop-blur-sm p-6">
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
                {/*<p className="text-purple-200 text-sm font-medium">Entrance Fee: {entranceFee} {currency}</p>*/}
              </div>
            </div>

            
            {/* Button */}
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
              How it Works
            </Button>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="text-purple-200/50 text-2xl font-semibold tracking-wider">
              {winner ? 'WINNER:' : 'PICKING WINNER...'}
            </div>
            {numberOfPlayers?.toString() && (
              <div className="text-purple-200/30 text-sm">
                {numberOfPlayers?.toString()} players
              </div>
            )}
          </div>
          
          {/* Right Section - Countdown */}
          <div className="flex flex-col items-center space-y-3">
                ROUND {roundId}
          </div>
        </div>
      </div>
    </GlareHover>
    </div>
  );
};

export default RaffleCardCalculating;
