import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export default function LeaderboardTable() {
    const players = [
        {
            rank: 4,
            name: "dingzhexiong",
            avatar: "🎮",
            time: "10mins ago",
            wager: "3,312,858.06"
        },
        {
            rank: 5,
            name: "fanjiezhi",
            avatar: "🎯",
            time: "2 hrs ago",
            wager: "2,800,740.97"
        },
        {
            rank: 6,
            name: "xaur.eth",
            avatar: "🎲",
            time: "3 hrs ago",
            wager: "1,612,515.84"
        },
        {
            rank: 7,
            name: "Josiah",
            avatar: "🎪",
            time: "10 hrs ago",
            wager: "2,800,740.97"
        },
        {
            rank: 8,
            name: "empe_0",
            avatar: "🎨",
            time: "11 hrs ago",
            wager: "1,612,515.84"
        },
        {
            rank: 9,
            name: "Vaxziz",
            avatar: "🎭",
            time: "12 hrs ago",
            wager: "2,800,740.97"
        },
        {
            rank: 10,
            name: "Cheng_qt",
            avatar: "🎸",
            time: "13 hrs ago",
            wager: "1,612,515.84"
        },
    ]
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
                    {players.map((player) => (
                        <>
                            <TableRow
                                key={`${player.rank}-${player.name}-${player.wager}`}
                                className="border-none rounded-lg transition-colors first:rounded-t-lg last:rounded-b-lg my-2"
                            >
                                <TableCell className="pl-6 py-2 rounded-l-lg">
                                    <div className="flex items-center gap-3">
                                    <span className="text-slate-500 text-sm font-medium w-6 rounded-full bg-card-foreground/60 flex items-center justify-center">
                                        {player.rank}
                                    </span>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                                            {player.avatar}
                                        </div>
                                        <span className="text-white font-medium">
                                            {player.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 text-slate-300">
                                    {player.time}
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
                        </>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
