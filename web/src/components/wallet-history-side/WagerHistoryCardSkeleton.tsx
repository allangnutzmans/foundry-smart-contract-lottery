import { Skeleton } from '@/components/ui/skeleton';

export const WagerHistoryCardSkeleton = ({ loading }: { loading: boolean }) => {
  return (
    <div
      className={`relative w-full rounded-xl p-px shadow-2xl overflow-hidden mb-3 ${
        loading ? '' : 'opacity-70'
      }`}
    >
      <div className="relative z-10 h-full w-full rounded-[15px] bg-card p-4">
        <div className="flex flex-col space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <Skeleton className={`h-4 w-[100px] bg-muted ${loading ? '' : 'animate-none'}`} />
              <Skeleton className={`h-4 w-[80px] bg-muted ${loading ? '' : 'animate-none'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
