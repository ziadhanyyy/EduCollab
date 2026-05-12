import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
export default ListSkeleton;
