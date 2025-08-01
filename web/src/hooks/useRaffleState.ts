import { useReadContracts } from 'wagmi';
import { useEffect, useState } from 'react';
import { lotteryContract } from '@/lib/lotteryContract';
import { useQueryClient } from '@tanstack/react-query';

function secondsToHms(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return { hours, minutes, seconds };
}

export type TimeObject = {
  hours: number;
  minutes: number;
  seconds: number;
}

export enum RAFLLE_STATE {
  OPEN,
  CALCULATING
}

export function useRaffleState() {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState<TimeObject>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const { data } = useReadContracts({
    contracts: [
      { ...lotteryContract, functionName: 'getInterval' },
      { ...lotteryContract, functionName: 'getLastTimestamp' },
      { ...lotteryContract, functionName: 'getRflleState' },
    ],
  });

  const interval = data?.[0]?.result;
  const lastTimestamp = data?.[1]?.result;
  const raffleState = data?.[2]?.result as RAFLLE_STATE;

  const isTimeRunning = timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0;

  useEffect(() => {
    if (!interval || !lastTimestamp) return;

    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const target = Number(lastTimestamp) + Number(interval);
      let diff = target - now;
      if (diff < 0) diff = 0;
      setTimeLeft(secondsToHms(diff));

      if (diff === 0) {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['balance'] });
          queryClient.invalidateQueries({ queryKey: ['readContracts'] });
        }, 4000); // delay for the contract make the transaction
      }

    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [interval, lastTimestamp, queryClient]);


  return {
    raffleState,
    isTimeRunning,
    timeLeft,
  };
}
