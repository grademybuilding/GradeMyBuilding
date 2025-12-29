import { Skeleton } from "@/components/ui/skeleton";

export function RecentInspectionsSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg"
        >
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-md self-end sm:self-auto" />
        </div>
      ))}
    </div>
  );
}
