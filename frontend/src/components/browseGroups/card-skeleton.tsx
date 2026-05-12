import { Skeleton } from '../ui/skeleton';

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-1.5 w-full rounded-full mt-1" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-8 w-full rounded-md mt-1" />
    </div>
  );
}

export default CardSkeleton;
