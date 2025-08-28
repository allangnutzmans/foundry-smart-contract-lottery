'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { singleEntryRaffle } from "@/lib/contract/singleEntryRaffle";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { toast } from "sonner";
import { api } from "@/lib/trpc";
import { parseEther, formatEther } from "viem";
import { RAFLLE_STATE, useRaffleState } from "@/hooks/useRaffleState";
import { TxError } from '@/lib/contract/errorHandler';
import { type EntranceFee } from '../raffle-card/RaffleCard';

const RAFFLE_PRICE = "0.01";

export function EnterRaffleDD({ entranceFee }: { entranceFee?: EntranceFee }) {
  const [isOpen, setIsOpen] = useState(false);
  const [wagerAmount, setWagerAmount] = useState(
    entranceFee?.value ? formatEther(entranceFee.value) : RAFFLE_PRICE
  );
  const { address } = useAccount();
  const { raffleState, roundId } = useRaffleState();
  const processedTxRef = useRef<string | null>(null);

  const { refetch: refetchContractBalance } = useBalance({
    address: singleEntryRaffle.address,
  });

  const utils = api.useUtils();
  const createWagerHistory = api.wagerHistory.create.useMutation();
  const upsertRaffleRound = api.wagerHistory.upsertRaffleRound.useMutation();
  
  const getWallet = api.wallet.getByAddress.useQuery(
    { address: address ?? "" },
    { enabled: Boolean(address) }
  );

  const { data: txHash, isPending, writeContract, error: txError } = useWriteContract();

  // Confirmation Receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Add OK mesage to the toast
  useEffect(() => {
    if (isConfirming) {
      toast.info("Transaction sent! Waiting for confirmation...");
      setIsOpen(false);
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed && txHash && processedTxRef.current !== txHash) {
      processedTxRef.current = txHash;
      toast.success('You have successfully entered the raffle!');
      const updateData = async () => {
        // refetch to correctly create the wager history
        const { data: freshBalance } = await refetchContractBalance();
        const prizeAmount = freshBalance?.value
          ? parseFloat(formatEther(freshBalance.value))
          : 0;
  
        if (getWallet.data && roundId > 0) {
          upsertRaffleRound.mutate(
            {
              roundId,
              prizeAmount,
            },
            {
              onSuccess: (round) => {
                createWagerHistory.mutate(
                  {
                    walletId: getWallet.data!.id,
                    wagerAmount: parseFloat(wagerAmount),
                    raffleRoundId: round.id,
                    
                  },
                  {
                    onSuccess: () => {
                      void utils.wallet.getTop10Wagers.invalidate();
                      void utils.wagerHistory.getHistoryByUserId.invalidate();
                      void utils.wagerHistory.getCurrentRoundWallets.invalidate();
                    },
                  }
                );
              },
            }
          );
        }
      };
  
      void updateData();
    }
  }, [
    isConfirmed,
    txHash,
    getWallet.data,
    roundId,
    refetchContractBalance,
    createWagerHistory,
    upsertRaffleRound,
    utils,
    wagerAmount,
  ]);
  

  useEffect(() => {
    if (txError || (isError && error)) {
      toast.error('Transaction failed', { description: 'Could not enter the raffle, maybe you already participated in this round?'}  )
    }
  }, [txError, isError, error]);
  
  const handleEnterRaffle = useCallback(() => {
    if (!address) return;

    if (Number(wagerAmount) < Number(formatEther(entranceFee?.value ?? 0n))) {
        toast.error(TxError.Raffle__SendMoreToEnterRaffle);
        return;
      }
  
    writeContract({
      address: singleEntryRaffle.address,
      abi: singleEntryRaffle.abi,
      functionName: 'enterRaffle',
      value: parseEther(wagerAmount),
    });
  }, [writeContract, wagerAmount, address, entranceFee]);

  const getButtonText = () => {
    if (isConfirming) return 'JOINING...';
    if (isConfirmed) return 'JOIN AGAIN';
    if (raffleState === RAFLLE_STATE.CALCULATING) return 'CALCULATING...';
    return 'JOIN RAFFLE';
  };

  const getButtonDisabled = () => {
    if (raffleState !== RAFLLE_STATE.OPEN) return true;
    if (isPending) return true;
    if (isConfirming) return true;
    return false;
  };

  const openDialog = () => {
    if (!address) {
        toast.error("Please connect your wallet to enter the raffle");
        return;
    }
    setIsOpen(true);
  };

  return (
    <>
      {/* Button */}
      <Button
        variant="secondary"
        className="text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
        onClick={openDialog}
        disabled={getButtonDisabled()}
      >
        {getButtonText()}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Enter Raffle</DialogTitle>
            <DialogDescription>
                Are you sure you want to enter the raffle? The entry fee is {entranceFee?.value ? formatEther(entranceFee.value) : RAFFLE_PRICE} {entranceFee?.symbol}.
            </DialogDescription>
            <div className="grid gap-4 py-4">
                <Input
                    id="wager"
                    type="number"
                    step="0.01"
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(e.target.value)}
                    className="col-span-3"
                />
            </div>
            </DialogHeader>

            <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button
                onClick={handleEnterRaffle}
                disabled={isPending || isConfirming}
            >
                {isPending || isConfirming ? "Confirming..." : "Enter"}
            </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
