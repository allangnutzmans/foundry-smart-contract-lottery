'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { lotteryContract } from "@/lib/lotteryContract";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { api as trpc } from "@/lib/trpc";
import { parseEther } from "viem";
import { revalidateLeaderboard } from "@/app/actions";

const RAFFLE_PRICE = "0.01";

export function EnterRaffleDD() {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();

  const createWagerHistory = trpc.wagerHistory.create.useMutation();
  const getWallet = trpc.wallet.getByAddress.useQuery(
    { address: address ?? "" },
    { enabled: Boolean(address) }
  );

  const { data: txHash, isPending, error, writeContract } = useWriteContract();

  // Confirmation Receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Hash generated
  useEffect(() => {
    if (txHash) {
      toast.info("Transaction sent! Waiting for confirmation...");
      setIsOpen(false);
    }
  }, [txHash]);

  // quando confirmada -> sucesso
  useEffect(() => {
    if (isConfirmed) {
      toast.success('You have successfully entered the raffle!');
      if (getWallet.data) {
        createWagerHistory.mutate({
          walletId: getWallet.data.id,
          wagerAmount: parseFloat(RAFFLE_PRICE),
          prizeAmount: 0, // TODO: calculate prize amount
          endDate: new Date(), // TODO: replace with real raffle date (contract)
        });
      }
      revalidateLeaderboard();
    }
  }, [isConfirmed, getWallet.data, createWagerHistory]);
  useEffect(() => {
    if (error) {
      const msg = error?.message ?? "Transaction failed";
      toast.error("Transaction failed", { description: msg });
      setIsOpen(false);
    }
  }, [error]);

  const handleEnterRaffle = async () => {
    try {
      writeContract({
        address: lotteryContract.address,
        abi: lotteryContract.abi,
        functionName: "enterRaffle",
        value: parseEther(RAFFLE_PRICE),
      });
    } catch (err: unknown) {
      toast.error("Transaction request failed", {
        description: (err as Error)?.message ?? String(err)
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* Button */}
            <Button
              variant="secondary"
              className="text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
              onClick={() => handleEnterRaffle}
            >
              {isConfirming ? 'JOINING...' : isConfirmed ? 'JOINED!' : 'JOIN RAFFLE'}
            </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Raffle</DialogTitle>
          <DialogDescription>
            Are you sure you want to enter the raffle? The entry fee is {RAFFLE_PRICE} ETH.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            onClick={handleEnterRaffle}
            disabled={typeof writeContract !== "function" || isPending || isConfirming}
          >
            {isPending || isConfirming ? "Confirming..." : "Enter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
