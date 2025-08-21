import { useReadContracts } from 'wagmi';
import { useEffect, useState, useRef, useCallback } from 'react';
import { singleEntryRaffle } from '@/lib/contract/singleEntryRaffle';
import { useQueryClient } from '@tanstack/react-query';

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

/**
 * Hook para gerenciar o estado da raffle
 *
 * IMPORTANTE: O countdown acontece DURANTE a raffle, não depois!
 * - getTimeUntilNextDraw() retorna quanto tempo falta para ENCERRAR a raffle atual
 * - Quando countdown = 0, a raffle pode ser encerrada (performUpkeep pode ser chamado)
 * - O countdown começa a contar assim que a raffle é criada (s_lastTimestamp)
 * - É baseado no intervalo configurado no contrato (i_interval)
 *
 * PROBLEMAS POTENCIAIS COM BLOCKCHAIN TIMER:
 * - Latência de RPC (100ms-2s)
 * - Falhas de rede temporárias
 * - Dessincronização entre countdown local e blockchain
 * - Rate limiting do provider
 */

//TODO
// Não iniciar o countdown até que haja algum player na raffle
// Ao final do countdown, caso hajam players na raffle, o estado da raffle deve ser CALCULATING independentemente do getRaffleState, pois pode haver um delay na atualização do estado da raffle
export function useRaffleState() {
  const [timeLeft, setTimeLeft] = useState<TimeObject>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { data } = useReadContracts({
    contracts: [
      {
        address: singleEntryRaffle.address,
        abi: singleEntryRaffle.abi,
        functionName: 'getTimeUntilNextDraw',
      },
      {
        address: singleEntryRaffle.address,
        abi: singleEntryRaffle.abi,
        functionName: 'getRaffleState',
      },
    ],
    query: {
      refetchInterval: 5000, // refaz a leitura a cada 5 segundos
    },
  });
  const raffleState = data?.[1]?.result as number | undefined;

  useEffect(() => {
    if (!data?.[0]?.result) return;

    let totalSeconds = Number(data[0].result);
    setTimeLeft(secondsToTimeObject(totalSeconds));

    const interval = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds -= 1;
        setTimeLeft(secondsToTimeObject(totalSeconds));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  return { timeLeft, raffleState };
}
