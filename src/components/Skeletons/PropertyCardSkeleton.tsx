import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 w-20 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
