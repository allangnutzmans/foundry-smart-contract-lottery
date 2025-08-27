'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/trpc';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatTimeAgo } from '@/lib/date';
import { Skeleton } from './ui/skeleton';

export default function WagerHistoryTable() {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const { data: history, isLoading } = api.wagerHistory.getHistoryByUserId.useQuery(
        { userId: userId! },
        { enabled: !!userId }
    );

    if (isLoading) {
        return <WagerHistoryTableSkeleton />;
    }

    return (
        <div className="w-full rounded-lg overflow-hidden ">
            <Table>
                <TableHeader className="rounded-lg bg-card-foreground/20 mb-2">
                    <TableRow className="border-none">
                        <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider pl-6">
                            Date
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider">
                            Wager Amount
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider">
                            Prize Amount
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider pr-6 text-right">
                            End Date
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <tr className="h-2 border-none"></tr>
                <TableBody className="[&>tr:nth-child(even)]:bg-card [&>tr:nth-child(odd)]:bg-card-foreground/20 [&>tr:hover]:!bg-card-foreground/30">
                    {history?.map((entry) => (
                        <React.Fragment key={entry.id}>
                            <TableRow
                                className="border-none rounded-lg transition-colors first:rounded-t-lg last:rounded-b-lg my-2"
                            >
                                <TableCell className="pl-6 py-4 rounded-l-lg text-slate-300">
                                    {formatTimeAgo(entry.createdAt.toISOString())}
                                </TableCell>
                                <TableCell className="py-4 text-slate-300">
                                    {entry.wagerAmount}
                                </TableCell>
                                <TableCell className="py-4 text-slate-300">
                                    {entry.raffleRound.prizeAmount}
                                </TableCell>
                                <TableCell className="py-4 pr-6 text-right rounded-r-lg text-slate-300">
                                    {entry.raffleRound.endedAt ? formatTimeAgo(entry.raffleRound.endedAt.toISOString()) : ''}
                                </TableCell>
                            </TableRow>
                            <tr className="h-2 border-none"></tr>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function WagerHistoryTableSkeleton() {
    return (
      <div className="w-full rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="rounded-lg bg-card-foreground/20 mb-2">
            <TableRow className="border-none">
              <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider pl-6">Date</TableHead>
              <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider">Wager Amount</TableHead>
              <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider">Prize Amount</TableHead>
              <TableHead className="text-slate-400 font-medium text-sm uppercase tracking-wider pr-6 text-right">End Date</TableHead>
            </TableRow>
          </TableHeader>
          <tr className="h-2 border-none"></tr>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <React.Fragment key={index}>
                <TableRow className="border-none">
                  <TableCell className="pl-6 py-4 rounded-l-lg"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="py-4 pr-6 text-right rounded-r-lg"><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
                <tr className="h-2 border-none"></tr>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
