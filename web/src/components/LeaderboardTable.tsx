'use client';

import { User } from '@/generated/prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatTimeAgo } from '@/lib/date';
import React from 'react';
import { lotteryContract } from '@/lib/lotteryContract';
import { useReadContract } from 'wagmi';

export default function LeaderboardTable({ players }: { players: User[] }) {
    players = players.slice(3, 10);
    const { data: numberOfPlayers } = useReadContract({
        abi: lotteryContract.abi,
        address: lotteryContract.address as `0x${string}`,
        functionName: 'getNumberOfPlayers',
    })
    return (
        <div className="w-full rounded-lg overflow-hidden ">
            <Table>
                <TableHeader className="rounded-lg bg-card-foreground/20 mb-2">
                    <TableRow className="border-none">
                        <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider pl-6">
                            Player
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider">
                            Time
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider pr-6 text-right">
                            Wager
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <div className="h-2"></div>
                <TableBody className="[&>tr:nth-child(even)]:bg-card [&>tr:nth-child(odd)]:bg-card-foreground/20 [&>tr:hover]:!bg-card-foreground/30">
                    {players.map((player, index) => (
                        <React.Fragment key={player.id}>
                            <TableRow
                                className="border-none rounded-lg transition-colors first:rounded-t-lg last:rounded-b-lg my-2"
                            >
                                <TableCell className="pl-6 py-2 rounded-l-lg">
                                    <div className="flex items-center gap-3">
                                    <span className="text-slate-500 text-sm font-medium w-6 rounded-full bg-card-foreground/60 flex items-center justify-center">
                                        {index + 1}
                                    </span>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                                            {player.avatar}
                                        </div>
                                        <span className="text-white font-medium">
                                            {player.nickname}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 text-slate-300">
                                    {formatTimeAgo(
                                        player.updatedAt.toISOString() ?? 
                                        player.createdAt.toISOString()
                                    )}
                                </TableCell>
                                <TableCell className="py-4 pr-6 text-right rounded-r-lg">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-yellow-700"></div>
                                        </div>
                                        <span className="text-white font-medium">
                                        {player.wager}
                                    </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <div className="h-2"></div>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
            <div className="text-white text-sm mt-4 text-center">
                Total Players: {numberOfPlayers?.toString() || "Loading..."}
            </div>
        </div>
    )
}
