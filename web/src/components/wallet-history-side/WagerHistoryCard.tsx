import { type WagerHistoryItem } from './WagerHistory';

interface WagerHistoryCardProps {
  wager: WagerHistoryItem;
}

export const WagerHistoryCard: React.FC<WagerHistoryCardProps> = ({ wager }) => {
  return (
    <div className="shadow-2xl">
      <div className="z-10 h-full w-full rounded-[15px] bg-card p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Wager Amount:</span>
            <span className="font-semibold text-white">{wager.wagerAmount} ETH</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 text-sm">Prize Amount:</span>
            <span className="font-semibold text-white">{wager.raffleRound.prizeAmount} ETH</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 text-sm">Round:</span>
            <span className="font-semibold text-white">#{wager.raffleRound.roundId}</span>
          </div>
{/*         TODO: Add round status - NOT WORKING  
            <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 text-sm">Round Status:</span>
            <span className="font-semibold text-white">
              {wager.raffleRound.endedAt ? 'Finished' : 'Active'}
            </span>
          </div> */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 text-sm">Wallet:</span>
            <span className="font-semibold text-white">
            {
                wager.wallet.address ? 
                `${wager.wallet.address.slice(0, 7)}...${wager.wallet.address.slice(-7)}` 
                : ''
            }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 