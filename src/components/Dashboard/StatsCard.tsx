import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'accent' | 'success';
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default'
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-elevated border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6 bg-primary/10 dark:bg-primary/20">
        <CardTitle className="text-xs sm:text-sm font-medium text-foreground/80">
          {title}
        </CardTitle>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
          <Icon className={cn(
            "h-4 w-4 sm:h-5 sm:w-5",
            variant === 'accent' && "text-primary",
            variant === 'success' && "text-primary",
            variant === 'default' && "text-primary"
          )} />
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 pt-3 bg-card">
        <div className="text-lg sm:text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={cn(
              "font-medium",
              trend.value > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {' '}
            <span className="hidden sm:inline">{trend.label}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
