"use client";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {ButtonGroup} from "@/components/buttonGroup";
import {useAccount, useBalance, useDisconnect} from "wagmi";
import {emojiAvatarForAddress} from "@/lib/emojiAvatarForAddress";
import {useAccountModal, useChainModal } from "@rainbow-me/rainbowkit";
import {useEffect, useRef, useMemo} from "react";
import {formatBalance} from "@/lib/helpers";

export function UserCard() {
    const { isConnecting, address, isConnected, chain } = useAccount();
    const { data } = useBalance({
        address: address,
    })

    const formattedBalance = useMemo(() => {
        if (!data || data?.decimals == null) return '0';
        return formatBalance(data.value, data.decimals);
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
            <div className="px-4 pt-4 space-y-3">
                {/* Top Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            role="button"
                            tabIndex={1}
                            className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer"
                            style={{
                                backgroundColor,
                                boxShadow: "0px 2px 2px 0px rgba(81, 98, 255, 0.20)",
                            }}
                            onClick={async () => openAccountModal?.()}
                        >
                            {emoji}
                        </div>
                        <div>
                            <div className="font-semibold text-sm">
                                {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ''}
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-1 h-1.5 w-24 rounded-full bg-[#333]">
                                <div className="h-full w-2/5 rounded-full bg-pink-500" />
                            </div>
                        </div>
                    </div>

                    {/* Dropdown com o MoreHorizontal */}
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Balance Row */}
                <ButtonGroup balance={formattedBalance} symbol={data?.symbol} />

            </div>
            {/* Rakeback */}
            <div className="flex items-center justify-between text-xs text-gray-400 border-t p-3 px-4 bg-card-foreground rounded-b-[15px]">
                <span>Rakeback</span>
                <span className="rounded-md bg-green-900/40 px-2 py-1 text-green-400 font-semibold text-sm">
                  🪙 0.001 {data?.symbol}
                </span>
            </div>
        </div>
    );
}
