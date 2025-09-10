import { StatsCard } from "@/components/Dashboard/StatsCard";
import { RecentInspections } from "@/components/Dashboard/RecentInspections";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { Building, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export function Dashboard({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">BuildMyBuilding- dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Inspector</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Inspections"
          value="127"
          icon={Building}
          trend={{ value: 8, label: 'from last month' }}
        />
        <StatsCard
          title="Completed Today"
          value="5"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="In Progress"
          value="3"
          icon={Clock}
          variant="accent"
        />
        <StatsCard
          title="Issues Found"
          value="12"
          icon={AlertTriangle}
          trend={{ value: -15, label: 'from last month' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentInspections />
        </div>
        <div>
          <QuickActions onTabChange={onTabChange || (() => {})} />
        </div>
      </div>
    </div>
  );
}