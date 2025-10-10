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
  return <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-elevated", variant === 'accent' && "border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10", variant === 'success' && "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-300">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", variant === 'accent' && "text-accent", variant === 'success' && "text-emerald-600", variant === 'default' && "text-primary")} />
      </CardHeader>
      <CardContent className="bg-emerald-100">
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">
            <span className={cn("font-medium", trend.value > 0 ? "text-emerald-600" : "text-red-600")}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {' '}
            {trend.label}
          </p>}
      </CardContent>
    </Card>;
}