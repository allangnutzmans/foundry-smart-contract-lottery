"use client";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {ButtonGroup} from "@/components/wallet-history-side/buttonGroup";
import { useAccount, useBalance, useDisconnect, useEstimateFeesPerGas } from 'wagmi';
import {emojiAvatarForAddress} from "@/lib/emojiAvatarForAddress";
import {useAccountModal, useChainModal } from "@rainbow-me/rainbowkit";
import {useEffect, useRef, useMemo} from "react";
import { formatEther, formatGwei } from 'viem'
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image'

export function UserCard() {
    const { address } = useAccount(); 
    const { data: session } = useSession();
    const { data: gasFee } = useEstimateFeesPerGas()

    const { data } = useBalance({
        address: address,
    })

    const formattedBalance = useMemo(() => {
        if (!data || data?.decimals == null) return '0';
        return formatEther(data.value);
    }, [data]);

    const { color: backgroundColor, emoji } = emojiAvatarForAddress(
        address ?? ""
    );

    const { openAccountModal } = useAccountModal();
    const { openChainModal } = useChainModal();
    const { disconnect } = useDisconnect();

    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
    }, []);

    return (
        <div className="w-full max-w-xs rounded-[15px] bg-card  text-white shadow-lg space-y-3">
            <div className="px-4 pt-4 space-y-4">
              {/* Top Row */}
              <div className="ps-3 flex items-center justify-between relative transition-all duration-300">
                {/* Left: Avatar + Emoji + Info */}
                <div
                  className="flex items-center relative group"
                >
                  {/* Avatar (fica fixo) */}
                  {session?.user?.image && (
                    <Image
                      width={32}
                      height={32}
                      key={session.user.image}
                      src={session.user.image}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-full flex-shrink-0 z-10"
                    />
                  )}

                  {/* Emoji + Address */}
                  <div
                    className={`flex items-center gap-2 ml-[-20px] transition-transform duration-300 ${
                      session?.user?.image ? 'group-hover:translate-x-3' : ''
                    }`}
                  >
                    {/* Emoji Circle */}
                    <div
                      role="button"
                      tabIndex={1}
                      className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer transition-transform duration-300"
                      style={{
                        backgroundColor,
                        boxShadow: '0px 2px 2px 0px rgba(81, 98, 255, 0.20)',
                      }}
                      onClick={async () => {
                        if (session?.user) {
                          openAccountModal?.();
                        } else {
                          signIn('google');
                        }
                      }}
                    >
                      {emoji}
                    </div>

                    {/* Address and Progress */}
                    <div className="ps-3">
                      <div className="font-semibold text-sm">
                        {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ''}
                      </div>
                      <div className="mt-1 h-1.5 w-24 rounded-full bg-[#333]">
                        <div className="h-full w-2/5 rounded-full bg-pink-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer" aria-label="Open user menu">
                      <MoreHorizontal className="text-gray-400" size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom">
                    <DropdownMenuItem onClick={() => openChainModal?.()}>
                      Switch Network
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => disconnect()}>
                      Disconnect
                    </DropdownMenuItem>
                    {session?.user && (
                      <DropdownMenuItem onClick={() => signOut()}>
                        Disconnect Google Account
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
                {/* Balance Row */}
                <ButtonGroup balance={formattedBalance} symbol={data?.symbol} />
            </div>

            {/* Gas */}
            <div className="flex items-center justify-between text-xs text-gray-400 p-3 px-4 bg-card-foreground rounded-b-[15px]">
                <span>Gas Fee</span>
                <span className="rounded-md bg-green-900/40 px-2 py-1 text-green-400 font-semibold text-sm">
                  🪙  {gasFee ? `${formatGwei(gasFee.maxPriorityFeePerGas).slice(0, 6)} - ${formatGwei(gasFee.maxFeePerGas).slice(0, 6)} Gwei` : '...'}
                </span>
            </div>
        </div>
    );
}
