import { StatsCard } from "@/components/Dashboard/StatsCard";
import { RecentInspections } from "@/components/Dashboard/RecentInspections";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { Building, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export function Dashboard() {
  return (
    <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">GradeMyBuilding - Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Inspector</p>
      </div>

      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Recent Inspections */}
      <RecentInspections />
    </div>
  );
}
