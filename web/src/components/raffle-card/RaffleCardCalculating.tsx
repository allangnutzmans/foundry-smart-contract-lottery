'use client';

import { RaffleCardBase, type EntranceFee } from './RaffleCardBase';
import { Button } from '@/components/ui/button';
import { type UseBalanceReturnType } from 'wagmi';
import { useReadContract } from 'wagmi';
import { singleEntryRaffle } from '@/lib/contract/singleEntryRaffle';
import { useRaffleState } from '@/hooks/useRaffleState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { LinkedinIcon, Github, Instagram, Mail } from 'lucide-react';

const CONTACT_MESSAGE =
  "Hi Allan, I'm reaching out regarding the raffle project. Could you help me with the Chainlink VRF or provide more LINK tokens?";

const CONTACT_LINKS = {
  linkedin: `https://www.linkedin.com/in/allan-gnutzmans-5424191b5/`,
  github: `https://github.com/allangnutzmans/foundry-smart-contract-lottery/issues/new?title=Raffle%20Issue&body=${encodeURIComponent(
    CONTACT_MESSAGE
  )}`,
  instagram: `https://www.instagram.com/direct/t/340282366841710300949128137692850971592?text=${encodeURIComponent(
    CONTACT_MESSAGE
  )}`, // funciona se tiver DM liberado
  email: `mailto:allan.sgnutzmans@gmail.com?subject=Raffle%20Support&body=${encodeURIComponent(
    CONTACT_MESSAGE
  )}`,
};

export const RaffleCardCalculating = ({
  balance,
  entranceFee,
}: {
  entranceFee?: EntranceFee;
  balance: UseBalanceReturnType['data'];
}) => {
  const { data: numberOfPlayers } = useReadContract({
    abi: singleEntryRaffle.abi,
    address: singleEntryRaffle.address,
    functionName: 'getNumberOfPlayers',
  });

  const { winnerAddress } = useRaffleState();
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!winnerAddress) {
      timer = setTimeout(
        () => {
          setShowWarningDialog(true);
        },
        5 * 60 * 1000
      ); // 5 minutes
    }

    return () => clearTimeout(timer);
  }, [winnerAddress]);

  const button = (
    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/25 ">
      How it Works
    </Button>
  );

  const rightSection = (
    <div className="flex flex-col items-center space-y-1 text-purple-200/100">
      {winnerAddress ? (
        `WINNER: ${winnerAddress}`
      ) : (
        <>
          <span className="text-center font-bold text-2xl">PICKING WINNER...</span>
          <span className="text-sm text-purple-200/80 text-center max-w-4/6">
            This may take a moment, as the winner is chosen via Chainlink VRF
          </span>
        </>
      )}
      {numberOfPlayers ? (
        <div className="text-purple-200/70 text-sm">{numberOfPlayers as string} players</div>
      ) : (
        <div className="text-purple-200/50 text-sm">Loading players...</div>
      )}
    </div>
  );

  return (
    <>
      <RaffleCardBase
        balance={balance}
        entranceFee={entranceFee}
        button={button}
        rightSection={rightSection}
        glare
      />
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raffle Calculation Taking Too Long</DialogTitle>
            <DialogDescription>
              It looks like the raffle is taking longer than expected to determine a winner.
            </DialogDescription>
          </DialogHeader>
          <div>
            This might be due to a delay in Chainlink VRF or insufficient LINK tokens. Please
            contact me if for more LINK tokens in the VRF subscription. If the issue persists,
            please contact me:
          </div>
          <div className="flex gap-2 py-4 justify-center">
            <Button variant="outline" size="icon">
              <a href={CONTACT_LINKS.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon">
              <a href={CONTACT_LINKS.github} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon">
              <a href={CONTACT_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon">
              <a href={CONTACT_LINKS.email}>
                <Mail className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowWarningDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
