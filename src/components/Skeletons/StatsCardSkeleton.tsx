import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6 bg-primary/10 dark:bg-primary/20">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 pt-3 bg-card">
        <Skeleton className="h-7 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}
