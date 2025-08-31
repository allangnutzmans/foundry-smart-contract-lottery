import { Skeleton } from '@/components/ui/skeleton';

export const RaffleCardSkeleton: React.FC = () => {
    return (
        <div className="relative w-full rounded-2xl p-px shadow-2xl overflow-hidden mb-4">
            {/* Fundo claro do card */}
            <div className="relative z-10 h-40 w-full rounded-2xl bg-card p-6 flex justify-between">
                {/* Left Section */}
                <div className="flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-center space-x-4">
                        {/* Coin icon placeholder */}
                        <Skeleton className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                        <div className="flex flex-col space-y-2">
                            <Skeleton className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
                            <Skeleton className="h-3 w-34 rounded-lg bg-muted animate-pulse" />
                        </div>
                    </div>
                    {/* Button placeholder */}
                    <Skeleton className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
                </div>

                {/* Right Section placeholders */}
                <div className="flex flex-col justify-center items-center h-full">
                    <Skeleton className="w-20 h-4 rounded bg-muted animate-pulse mb-4" />
                    <Skeleton className="w-30 h-8 rounded-lg bg-muted animate-pulse" />
                </div>
            </div>
        </div>
    );
};
