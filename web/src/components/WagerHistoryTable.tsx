'use client';
import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/trpc';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatTimeAgo } from '@/lib/date';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { WagerHistoryEntry } from '@/server/api/routers/wagerHistory';

export default function WagerHistoryTable() {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const { data: history, isLoading } = api.wagerHistory.getHistoryByUserId.useQuery(
        { userId: userId! },
        { enabled: !!userId }
    );

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');

    const filteredHistory = useMemo(() => {
        if (!history) return [];

        return history.filter((entry: WagerHistoryEntry) => {
            const matchesSearch =
                entry.wagerAmount.toString().includes(search) ||
                entry.raffleRound.prizeAmount.toString().includes(search) ||
                formatTimeAgo(entry.createdAt.toISOString()).toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                filter === 'all'
                    ? true
                    : filter === 'active'
                        ? !entry.raffleRound.endedAt
                        : !!entry.raffleRound.endedAt;

            return matchesSearch && matchesFilter;
        });
    }, [history, search, filter]);

    if (isLoading) {
        return <WagerHistoryTableSkeleton loading={isLoading} />;
    }

    return (
        <div className="w-full rounded-lg overflow-hidden">
            {/* 🔎 Search & Filters */}
            <div className="flex items-center justify-between gap-4 mb-4">
                <Input
                    placeholder="Search wagers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={filter} onValueChange={(val: 'all' | 'active' | 'ended') => setFilter(val)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 📝 Table or Empty State */}
            {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border rounded-lg">
                    <p className="text-sm">No wagers found.</p>
                </div>
            ) : (
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
                        {filteredHistory.map((entry) => (
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
            )}
        </div>
    );
}

function WagerHistoryTableSkeleton({ loading }: { loading: boolean }) {
    return ( <div className="w-full rounded-lg overflow-hidden">
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
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <React.Fragment key={index}>
                <TableRow className="border-none">
                  <TableCell className="pl-6 py-4 rounded-l-lg">
                    <Skeleton
                      className={`h-4 w-24 bg-muted ${loading ? '' : 'animate-none'}`}
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton
                      className={`h-4 w-16 bg-muted ${loading ? '' : 'animate-none'}`}
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton
                      className={`h-4 w-16 bg-muted ${loading ? '' : 'animate-none'}`}
                    />
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right rounded-r-lg">
                    <Skeleton
                      className={`h-4 w-24 bg-muted ${loading ? '' : 'animate-none'}`}
                    />
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
