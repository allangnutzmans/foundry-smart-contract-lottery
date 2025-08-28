import { useReadContracts, useWatchContractEvent } from 'wagmi';
import { useEffect, useState, useCallback, useRef } from 'react';
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
  const targetRef = useRef<number | null>(null);
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
    onLogs(logs: unknown[]) {
      // @ts-ignore
      const args = logs[0]?.args as { player?: string } | undefined;
      const player = args?.player;
      if (player !== address) {
        notify('info', '🎲 New player entered the raffle!');
      }
      void handleRefetch();
    },
  });

  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'WinnerPicked',
    onLogs(logs: unknown[]) {
      // @ts-ignore
      const args = logs[0]?.args as { player?: string } | undefined;
      const winner = args?.player;
      setWinnerAddress(winner);
      if (winner !== address) {
        notify('success', `🏆 Winner chosen! Congratulations to ${winner}!`);
      }
      void handleRefetch();
    },
  });

  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'RaffleStarted',
    onLogs() {
      notify('info', '🚀 New round started!');
      void handleRefetch();
    },
  });

  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'RequestRaffleWinner',
    onLogs() {
      void handleRefetch();
    },
  });

  const contractTimeSeconds = Number(data?.[0]?.result ?? 0);
  const currentPlayers = Number(data?.[2]?.result ?? 0);

  useEffect(() => {
    // If there are no players, always show 0 and clear target
    if (currentPlayers === 0) {
      targetRef.current = null;
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    // Create an absolute timestamp for when the raffle should finish
    const now = Date.now();
    const newTarget = now + contractTimeSeconds * 1000;

    // Only update the target if it changed by more than ~1.5s to avoid jitter from refetches
    if (!targetRef.current || Math.abs((targetRef.current || 0) - newTarget) > 1500) {
      targetRef.current = newTarget;
      // initialize shown time immediately
      setTimeLeft(secondsToTimeObject(contractTimeSeconds));
    }

    // tick uses the absolute target to compute remaining seconds
    const tick = () => {
      if (!targetRef.current) return;
      const remaining = Math.max(0, Math.round((targetRef.current - Date.now()) / 1000));
      setTimeLeft(secondsToTimeObject(remaining));

      // if time is up and there are players, try to sync immediately
      if (remaining === 0 && currentPlayers > 0) {
        void handleRefetch();
      }
    };

    // do an immediate tick so UI updates without waiting 1s
    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [contractTimeSeconds, currentPlayers, handleRefetch]);

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
