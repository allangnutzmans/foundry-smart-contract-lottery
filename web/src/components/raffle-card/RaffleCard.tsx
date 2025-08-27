"use client";

import React, { useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWatchContractEvent } from 'wagmi';
import { singleEntryRaffle } from '@/lib/contract/singleEntryRaffle';
import RaffleCardOngoing from './RaffleCardOngoing';
import RaffleCardNew from './RaffleCardNew';
import { RAFLLE_STATE, useRaffleState } from '@/hooks/useRaffleState';
import { api } from '@/lib/trpc';
import { type Address } from 'viem'; // Import Address type
import RaffleCardCalculating from './RaffleCardCalculating';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GlareHover from '../ui/glare-hover';

export type EntranceFee = {
  value?: bigint,
  symbol: string,
}

const RaffleCard = () => {
  const { address, chain, isConnected } = useAccount();
  const symbol = chain?.nativeCurrency.symbol ?? 'ETH';

  const { data } = useReadContract(
    { ...singleEntryRaffle, address: singleEntryRaffle.address as Address, functionName: 'getEntranceFee' },
  );

  const entranceFee: EntranceFee = {
    value: data as bigint | undefined,
    symbol,
  };

  const  { timeLeft, raffleState, roundId, isWinner, winnerAddress, setWinnerAddress } = useRaffleState();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: singleEntryRaffle.address as Address,
  });

  // RaffleEntered === Update prize balance
  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'RaffleEntered',
    onLogs(logs) {
      console.log('RaffleEntered - updating prize balance:', logs);
      refetchBalance();
    },
  });

  // WinnerPicked === Update prize balance
  useWatchContractEvent({
    address: singleEntryRaffle.address,
    abi: singleEntryRaffle.abi,
    eventName: 'WinnerPicked',
    onLogs() {
      refetchBalance();
    },
  });


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
  
  const [showWinnerDialog, setShowWinnerDialog] = React.useState(false);

  useEffect(() => {
    if (isConnected && isWinner) {
      setShowWinnerDialog(true);
    }
  }, [isConnected, isWinner]);

  const handleDialogClose = () => {
    setShowWinnerDialog(false);
    setWinnerAddress(undefined);
  };

  const renderRaffleContent = () => {
        if (!isConnected || balance?.value === BigInt(0)) {
            return (
                <RaffleCardNew balance={balance} entranceFee={entranceFee} roundId={roundId} />
            )
        }

        if (raffleState === RAFLLE_STATE.CALCULATING || winnerAddress) {
            return (
                <RaffleCardCalculating balance={balance} entranceFee={entranceFee} roundId={roundId} />
            )
        }
    
        if (raffleState === RAFLLE_STATE.OPEN) {
            return (
                <RaffleCardOngoing balance={balance} timeLeft={timeLeft} entranceFee={entranceFee} roundId={roundId} />
            )
        }
    }
    

    return (
        <div className="relative">
        {renderRaffleContent()}
        <Dialog open={showWinnerDialog} onOpenChange={handleDialogClose}>
            <DialogContent className="p-0 bg-[#6f326a]">
                <GlareHover
                    width="100%"
                    height="auto"
                    playOnce={true}

                >
                    <div className="p-6 bg-[#6f326a]">
                        <DialogHeader>
                            <DialogTitle className="text-yellow-400">Congratulations! You are the lucky winner!</DialogTitle>
                            <DialogDescription className="text-white">Check your wallet and see your winnings!</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center">
                            <p className="text-white"></p>
                          <picture>
                            <img src="/jackpot.gif" alt="Jackpot Trophy" className="mt-4" />
                          </picture>
                        </div>
                    </div>
                </GlareHover>
            </DialogContent>
        </Dialog>
    </div>
    );
};


export default RaffleCard;
