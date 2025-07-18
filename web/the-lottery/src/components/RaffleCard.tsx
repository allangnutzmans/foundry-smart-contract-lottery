import React from 'react';
import { Button } from './ui/button';
import { Gem } from 'lucide-react';

const RaffleCard = () => {
  return (
    <div className="relative w-full rounded-xl p-px shadow-2xl overflow-hidden">
      <div className="card-border-animated"></div>
      <div className="relative z-10 h-full w-full rounded-[15px] bg-background p-4">
        <div className="flex items-center space-x-4">
          <Gem className="h-16 w-16 text-brand-purple" />
          <div>
            <h2 className="text-4xl font-bold text-white">$20</h2>
            <p className="text-muted-foreground">Raffle Price</p>
          </div>
        </div>
        <Button className="w-full mt-6 bg-brand-purple hover:bg-brand-purple/90">
          How it Works
        </Button>
      </div>
    </div>
  );
};

export default RaffleCard;
