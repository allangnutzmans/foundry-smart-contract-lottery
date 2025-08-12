'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Stepper } from '@/components/stepper/Stepper';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EnterRaffleCard() {
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const router = useRouter();
  const [hasInitiatedConnect, setHasInitiatedConnect] = useState(false);

  const handleEnterRaffle = () => {
    if (isConnected) {
      router.push('/raffle');
    } else {
      setHasInitiatedConnect(true);
      openConnectModal?.();
    }
  };

  useEffect(() => {
    if (isConnected && hasInitiatedConnect) {
      router.push('/raffle');
      setHasInitiatedConnect(false); // Reset the state after navigation
    }
  }, [isConnected, hasInitiatedConnect, router]);

  return (
    <>
      {/* Header Section */}
      <div className="relative">
        <div className="h-[490px] overflow-hidden">
          <Image
            src="/raffle-enter.png"
            alt="Enter raffle card"
            width={1200}
            height={550} // Match parent height
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, #1d1e2c 0%, rgba(29, 30, 44, 0.7) 40%, transparent 100%)',
          }}
        ></div>
        <div className="absolute bottom-0 w-full p-8 text-center pb-24">
          <h2 className="text-3xl font-bold">On-chain Raffle Experience</h2>
          <p className="text-gray-300 mt-2 max-w-xl mx-auto">
            Join a verifiable on-chain raffle. Pay the entry fee and, after the set interval, Chainlink VRF selects a winner automatically.
          </p>
          <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold"  onClick={handleEnterRaffle}>
            Enter Raffle
          </Button>
        </div>
      </div>

      <div className="p-8 pt-0 mt-5">
        <h3 className="text-lg font-semibold mb-4 ">How to Participate</h3>
        <Stepper
          steps={[
            { title: "Connect Wallet", description: "Connect your wallet to the supported network." },
            { title: "Enter Raffle Amount", description: "Check the entry fee shown in the UI and enter your desired amount." },
            { title: "Confirm Transaction", description: "Click Enter Raffle and confirm the transaction." },
            { title: "Wait for Draw", description: "After the interval, Chainlink Automation triggers the winner selection." },
            { title: "Auto-Claim Prize", description: "If you win, the prize is automatically sent to your wallet." },
          ]}
        />
      </div>
    </>
  );
}
