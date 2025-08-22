'use client'

import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/utils'
import { Wallet } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'

export function ButtonGroup({
    balance,
    symbol = 'ETH'
}:{
    balance: string,
    symbol?: string
}) {
    const { isConnected } = useAccount()
    const { openConnectModal } = useConnectModal()

    if (!isConnected) {
        return (
            <button
                onClick={() => openConnectModal?.()}
                className="flex items-center gap-2 w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white cursor-pointer"
            >
                <Wallet className="h-4 w-4" />
                Connect Wallet
            </button>
        )
    }

    return (
        <ToggleGroup.Root
            type="single"
            className="inline-flex items-center justify-between w-full rounded-md bg-[#2b2d42]"
            defaultValue="balance"
        >
            <ToggleGroup.Item
                value="balance"
                className={cn(
                    'flex-1 px-3 py-2 text-sm font-semibold text-white text-left transition-colors',
                    'data-[state=on]:bg-[#2b2d42] data-[state=on]:text-white',
                    'rounded-l-md'
                )}
            >
        <span className="flex items-center gap-2">
          🎖 <span>{Number(balance).toFixed(5)} {symbol}</span>
        </span>
            </ToggleGroup.Item>

            <ToggleGroup.Item
                value="wallet"
                className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-colors',
                    'bg-purple-600 data-[state=on]:text-white',
                    'rounded-r-md'
                )}
            >
                <Wallet className="h-4 w-4" />
                Wallet
            </ToggleGroup.Item>
        </ToggleGroup.Root>
    )
}
