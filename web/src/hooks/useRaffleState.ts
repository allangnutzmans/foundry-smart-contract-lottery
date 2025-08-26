import { useReadContracts, useWatchContractEvent } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { singleEntryRaffle } from '@/lib/contract/singleEntryRaffle';
import { useNotification } from '@/contexts/NotificationContext';
import { useAccount } from 'wagmi';

function secondsToTimeObject(seconds: number) {
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
};

export enum RAFLLE_STATE {
  OPEN,
  CALCULATING,
}

export function useRaffleState() {
  const { notify } = useNotification();
  const [timeLeft, setTimeLeft] = useState<TimeObject>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [winnerAddress, setWinnerAddress] = useState<string | undefined>(undefined);
  const [lastContractTime, setLastContractTime] = useState<number>(0);
  const { address } = useAccount();

  // prettier-ignore
  const { data, refetch } = useReadContracts({
    contracts: [
      { ...singleEntryRaffle, functionName: 'getTimeUntilNextDraw' },
      { ...singleEntryRaffle, functionName: 'getRaffleState' },
      { ...singleEntryRaffle, functionName: 'getNumberOfPlayers' },
      { ...singleEntryRaffle, functionName: 'getRoundId' },
    ],
    query: { refetchInterval: 5000 },
  });

  const contractRaffleState: RAFLLE_STATE =
    (data?.[1]?.result as RAFLLE_STATE) ?? RAFLLE_STATE.OPEN;
  const numberOfPlayers = Number(data?.[2]?.result || 0);
  const roundId = Number(data?.[3]?.result || 0);

  // Callback para atualizar dados
  const handleRefetch = useCallback(() => refetch(), [refetch]);

  // Event listeners apenas para refetch - sem modificar estados locais //
  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'RaffleEntered',
    onLogs(logs) {
      const player = logs[0].args?.player as string;
      if (player !== address) {
        notify('info', '🎲 New player entered the raffle!');
      }
      handleRefetch();
    },
  });

  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'WinnerPicked',
    onLogs(logs) {
      const winner = logs[0].args?.player as string;
      setWinnerAddress(winner);
      if (winner !== address) {
        notify('success', `🏆 Winner chosen! Congratulations to ${winner}!`);
      }
      handleRefetch();
    },
  });

  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'RaffleStarted',
    onLogs() {
      notify('info', '🚀 New round started!');
      handleRefetch();
    },
  });

  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'RequestRaffleWinner',
    onLogs() {
      handleRefetch();
    },
  });

  useEffect(() => {
    if (!data?.[0]?.result) return;

    const contractTimeSeconds = Number(data[0].result);
    const currentPlayers = Number(data?.[2]?.result || 0);

    // If there are no players, always show 0
    if (currentPlayers === 0) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      setLastContractTime(0);
      return;
    }

    // Update the base time only when necessary (avoid unnecessary reset)
    if (contractTimeSeconds !== lastContractTime) {
      setLastContractTime(contractTimeSeconds);
      setTimeLeft(secondsToTimeObject(contractTimeSeconds));
    }

    if (contractTimeSeconds === 0 && currentPlayers > 0) {
      handleRefetch(); // try to synchronize immediately with the chain
    }

    // Local countdown synchronized with the contract
    let currentSeconds = contractTimeSeconds;
    const interval = setInterval(() => {
      if (currentSeconds > 0) {
        currentSeconds -= 1;
        setTimeLeft(secondsToTimeObject(currentSeconds));
      } else {
        // Stop at 0 and wait for the contract to update
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data, lastContractTime, handleRefetch]);

  const raffleState: RAFLLE_STATE = (() => {
    // If the chain already says CALCULATING
    if (contractRaffleState === RAFLLE_STATE.CALCULATING) return RAFLLE_STATE.CALCULATING;

    // If the time is up and there are players, force local calculation
    if (
      contractRaffleState === RAFLLE_STATE.OPEN &&
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0 &&
      numberOfPlayers > 0
    ) {
      return RAFLLE_STATE.CALCULATING;
    }

    return contractRaffleState;
  })();

  const isWinner = address ? winnerAddress === address : false;

  // Show winner address for 30 seconds for non-winner
  useEffect(() => {
    if (!winnerAddress) return;
    if (isWinner) return; // do not auto-clear for the winner

    const timeout = setTimeout(() => {
      setWinnerAddress(undefined);
    }, 30_000); // 30 seconds

    return () => clearTimeout(timeout);
  }, [winnerAddress, isWinner]);

  return {
    timeLeft,
    raffleState,
    numberOfPlayers,
    roundId,
    isWinner,
    winnerAddress,
    setWinnerAddress,
  };
}
